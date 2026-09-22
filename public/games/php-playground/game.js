/* ==========================================================================
   PHP PLAYGROUND — Engine (vanilla IIFE, js-detective contract)
   window API:
     __initPhpPlayground                init/reset state (called by hook)
     __resumePhpPlayground(saved)       restore DB progress (hook)
     __getPhpPlaygroundLevels()         level meta for the sidebar cards
     __getPhpPlaygroundState()          live snapshot for boot polling
     __goToPhpPlaygroundLevel(index)    navigate (0-based index)
     __phpPlaygroundRun(index, code)    run PHP, return stdout/stderr
     __phpPlaygroundCheck(index, code)  run + judge vs passValue
     __phpPlaygroundRevealHint(index)   reveal hint (max 3/day, DB-tracked)
   Events:
     php-playground-boot   {status: booting|ready|error, message?}
     php-playground-state  {currentLevel, score, completed, solutions, hints, totalLevels}
   The heavy php-wasm engine (PHP 8.4 WASM) boots LAZILY on the first Run.
   Hints: nudge only, hidden behind a reveal button, limited to 3 per day per
   user; the counter rides the progress payload ({date, used}) so it persists
   in the DB and resumes across visits.
   ========================================================================== */
(function () {
  "use strict";

  var LEVELS = [];
  var TIERS = ["easy", "intermediate", "hard", "mostHard"];
  var TIER_LABELS = { easy: "Easy", intermediate: "Intermediate", hard: "Hard", mostHard: "Most Hard" };
  var POINTS = { easy: 5, intermediate: 6, hard: 7, mostHard: 8 };
  var HINTS_PER_DAY = 3;

  var STATE = {
    currentLevel: 0,
    score: 0,
    completed: {},
    solutions: {},
    hintsDate: null,
    hintsUsed: 0,
  };

  /* ---- level data (poll-safe) -------------------------------------------- */

  function tryLoadLevels() {
    if (LEVELS.length) return true;
    try {
      if (typeof window.__phpPlaygroundLevels !== "undefined") {
        LEVELS = window.__phpPlaygroundLevels || [];
        STATE.currentLevel = Math.min(STATE.currentLevel, Math.max(0, LEVELS.length - 1));
        return LEVELS.length > 0;
      }
    } catch (e) { /* levels.js may not be parsed yet */ }
    return false;
  }

  /* ---- tier gate ---------------------------------------------------------- */

  function tierIndex(tier) { return TIERS.indexOf(tier); }
  function tierLevels(tierKey) { return LEVELS.filter(function (l) { return l.tier === tierKey; }); }
  function countDoneInTier(tierKey) {
    return tierLevels(tierKey).filter(function (l) { return STATE.completed[l.id - 1]; }).length;
  }
  function pointsForLevel(level) { return POINTS[level.tier] || 5; }

  // Finish all but one case in a tier to unlock the next; all Hard cases
  // must be solved before Most Hard opens (same rules as js-detective).
  function isLevelUnlocked(index) {
    if (!LEVELS[index]) return false;
    if (STATE.completed[index]) return true;
    var ti = tierIndex(LEVELS[index].tier);
    if (ti <= 0) return true;
    var prevKey = TIERS[ti - 1];
    var prevLevels = tierLevels(prevKey);
    var need = prevKey === "hard" ? prevLevels.length : Math.max(1, prevLevels.length - 1);
    return prevLevels.length === 0 || countDoneInTier(prevKey) >= need;
  }

  function lockMessageFor(index) {
    var lvl = LEVELS[index];
    if (!lvl) return "";
    var ti = tierIndex(lvl.tier);
    if (ti <= 0) return "";
    var prevKey = TIERS[ti - 1];
    var prevLabel = TIER_LABELS[prevKey] || prevKey;
    var prevLevels = tierLevels(prevKey);
    var need = prevKey === "hard" ? prevLevels.length : Math.max(1, prevLevels.length - 1);
    var left = Math.max(0, need - countDoneInTier(prevKey));
    return "Solve " + left + " more " + prevLabel + " level" + (left === 1 ? "" : "s") + " to unlock this tier.";
  }

  /* ---- score / state ---------------------------------------- */

  function recomputeScore() {
    var s = 0, i;
    for (i = 0; i < LEVELS.length; i++) {
      if (STATE.completed[i]) s += pointsForLevel(LEVELS[i]);
    }
    STATE.score = s;
  }

  function publishState() {
    tryLoadLevels();
    recomputeScore();
    var payload = {
      currentLevel: STATE.currentLevel,
      score: STATE.score,
      completed: STATE.completed,
      solutions: STATE.solutions,
      hints: { date: STATE.hintsDate, used: STATE.hintsUsed },
      totalLevels: LEVELS.length,
    };
    try {
      window.dispatchEvent(new CustomEvent("php-playground-state", { detail: payload }));
    } catch (e) { /* no listeners yet */ }
    if (typeof window.__onPhpPlaygroundProgress === "function") {
      try { window.__onPhpPlaygroundProgress(payload); } catch (e) { /* ignore */ }
    }
  }

  /* ---- php-wasm lazy boot -------------------------------------------------- */

  try {
    if (typeof navigator !== "undefined" && !navigator.locks) {
      var __locksChain = Promise.resolve();
      navigator.locks = {
        request: function (name, callback) {
          var next = __locksChain.then(function () { return callback({ name: name, mode: "exclusive" }); });
          __locksChain = next.then(function () {}, function () {});
          return next;
        },
      };
    }
  } catch (e) { /* run() will surface any locks problems */ }

  var BOOT_TIMEOUT_MS = 60000;
  var engineState = { status: "idle", php: null, bootPromise: null };

  function bootEvent(status, message) {
    var detail = { status: status };
    if (message !== undefined) detail.message = message;
    try {
      window.dispatchEvent(new CustomEvent("php-playground-boot", { detail: detail }));
    } catch (e) { /* no listeners yet */ }
  }

  function ensureBooted() {
    if (engineState.status === "ready") return Promise.resolve(engineState.php);
    if (engineState.status === "booting") return engineState.bootPromise;
    engineState.status = "booting";
    bootEvent("booting");

    var watchdog = setTimeout(function () {
      if (engineState.status !== "booting") return;
      engineState.status = "error";
      engineState.bootPromise = null;
      bootEvent("error", "The PHP engine did not start within " + Math.round(BOOT_TIMEOUT_MS / 1000) + "s. Try again, or check that the php-playground WASM assets are deployed.");
    }, BOOT_TIMEOUT_MS);

    engineState.bootPromise = Promise.resolve()
      .then(function () {
        // PhpWeb.mjs dynamically imports ./php8.4-web.mjs, which fetches
        // e31ec3faf3e2323a2b4a448342b50307765b8217.wasm alongside it.
        return import("/games/php-playground/PhpWeb.mjs");
      })
      .then(function (mod) {
        var PhpWeb = mod && (mod.PhpWeb || (mod.default && mod.default.PhpWeb));
        if (typeof PhpWeb !== "function") throw new Error("php-wasm module is malformed");
        return new PhpWeb({ version: "8.4" });
      })
      .then(function (php) {
        return php.binary.then(function () {
          engineState.php = php;
          engineState.status = "ready";
          return php;
        });
      })
      .then(function (php) { clearTimeout(watchdog); bootEvent("ready"); return php; })
      .catch(function (err) {
        engineState.status = "error";
        engineState.bootPromise = null;
        clearTimeout(watchdog);
        bootEvent("error", String((err && err.message) || err));
        throw err;
      });
    return engineState.bootPromise;
  }

  /* ---- run ---------------------------------------------------------------- */

  function runPHP(source) {
    return ensureBooted()
      .then(function (php) {
        var out = "", err = "";
        php.addEventListener("output", function (e) { out += (e.detail || []).join(""); });
        php.addEventListener("error", function (e) { err += (e.detail || []).join(""); });
        return php.run(String(source || "")).then(function (exit) {
          return { stdout: out, stderr: err, exit: exit };
        });
      })
      .catch(function (e) {
        return { stdout: "", stderr: String((e && e.message) || e), exit: -1 };
      });
  }

  function firstPhpError(output) {
    var text = String(output || "");
    if (!text.trim()) return "";
    var lines = text.split("\n");
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (/(?:^|\s)(?:Parse |Fatal )?error:|Warning:|Notice:|Deprecated:/i.test(line)) return line.trim();
    }
    return "";
  }

  function checkLevel(index, source) {
    var lvl = LEVELS[index];
    return runPHP(source).then(function (res) {
      if (!lvl) return { ok: false, stdout: res.stdout, error: "Unknown level." };
      var expected = String(lvl.passValue ?? "").trim();
      var actual = String(res.stdout ?? "").trim();
      if (actual === expected) {
        STATE.completed[index] = true;
        STATE.solutions[index] = source;
        publishState();
        return { ok: true, stdout: res.stdout, score: pointsForLevel(lvl), completed: true };
      }
      if (res.stderr && res.stderr.trim()) {
        return { ok: false, stdout: res.stdout, error: res.stderr, errorType: "runtime" };
      }
      var phpErr = firstPhpError(res.stdout);
      if (phpErr) {
        return { ok: false, stdout: res.stdout, error: phpErr, errorType: "runtime" };
      }
      return { ok: false, stdout: res.stdout, error: lvl.seedErr || "Output doesn't match the expected result.", errorType: "wrong" };
    });
  }

  /* ---- hints ---------------------------------------------------------------- */

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function revealHint(index) {
    var lvl = LEVELS[index];
    if (!lvl) return { ok: false, left: 0, used: STATE.hintsUsed };
    var today = todayStr();
    if (STATE.hintsDate !== today) {
      STATE.hintsDate = today;
      STATE.hintsUsed = 0;
    }
    if (STATE.hintsUsed >= HINTS_PER_DAY) {
      return { ok: false, left: 0, used: HINTS_PER_DAY };
    }
    STATE.hintsUsed += 1;
    publishState();
    return { ok: true, hint: lvl.hint, used: STATE.hintsUsed, left: HINTS_PER_DAY - STATE.hintsUsed };
  }

  /* ---- navigation ------------------------------------------------------------ */

  function gotoLevel(index) {
    if (!LEVELS.length) return;
    index = Number(index);
    if (index < 0 || index >= LEVELS.length) return;
    if (!STATE.completed[index] && !isLevelUnlocked(index)) return;
    STATE.currentLevel = index;
    publishState();
  }

  /* ---- public API -------------------------------------------------------------- */

  function init() {
    STATE.currentLevel = 0;
    STATE.score = 0;
    STATE.completed = {};
    STATE.solutions = {};
    STATE.hintsDate = null;
    STATE.hintsUsed = 0;
    publishState();
  }

  function resume(saved) {
    if (!saved) return;
    tryLoadLevels();
    if (typeof saved.currentLevel === "number") {
      var cl = Math.floor(saved.currentLevel);
      if (cl >= 0 && cl < Math.max(1, LEVELS.length)) STATE.currentLevel = cl;
    }
    if (saved.completed && typeof saved.completed === "object") STATE.completed = saved.completed;
    if (saved.solutions && typeof saved.solutions === "object") STATE.solutions = saved.solutions;
    if (saved.hints && typeof saved.hints === "object") {
      var hu = Number(saved.hints.used);
      if (typeof saved.hints.date === "string" && saved.hints.date.length === 10 && Number.isInteger(hu) && hu >= 0) {
        STATE.hintsDate = saved.hints.date;
        STATE.hintsUsed = STATE.hintsDate === todayStr() ? hu : 0;
      }
    }
    publishState();
  }

  window.__initPhpPlayground = init;
  window.__resumePhpPlayground = resume;
  window.__getPhpPlaygroundLevels = function () {
    tryLoadLevels();
    return LEVELS.map(function (lv) {
      return {
        id: lv.id,
        title: lv.title,
        tier: lv.tier,
        concepts: lv.concepts || [],
        points: pointsForLevel(lv),
        isFinal: !!lv.isFinal,
        shortDesc: lv.shortDesc || "",
        instruction: lv.instruction || "",
        hint: lv.hint || "",
        seedCode: lv.starter || "",
        seedErr: lv.seedErr || "Output doesn't match the expected result.",
        passValue: lv.passValue ?? "",
      };
    });
  };
  window.__getPhpPlaygroundState = function () {
    tryLoadLevels();
    return {
      currentLevel: STATE.currentLevel,
      score: STATE.score,
      completed: STATE.completed,
      solutions: STATE.solutions,
      hints: { date: STATE.hintsDate, used: STATE.hintsUsed },
      totalLevels: LEVELS.length,
    };
  };
  window.__goToPhpPlaygroundLevel = gotoLevel;
  window.__phpPlaygroundRun = function (index, code) { return runPHP(code); };
  window.__phpPlaygroundCheck = function (index, code) { return checkLevel(index, code); };
  window.__phpPlaygroundRevealHint = revealHint;
  window.__phpPlaygroundBootState = function () {
    tryLoadLevels();
    return { boot: engineState.status };
  };
})();