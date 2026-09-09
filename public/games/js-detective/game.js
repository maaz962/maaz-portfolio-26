(function () {
  "use strict";

  // LEVELS starts empty. levels.js sets window.LJS_LEVELS before/after this
  // script (both load with strategy="afterInteractive", so execution order is
  // not guaranteed) — tryLoadLevels/ensureLevels populate it when ready and
  // every render/state access re-checks so an empty array can never win.
  var LEVELS = [];

  var LEVEL_LOAD_TRY_MS = 80;
  var LEVEL_LOAD_MAX_TRIES = 60; // ~4.8s before giving up and surfacing a toast

  function tryLoadLevels() {
    if (LEVELS.length > 0) return true;
    if (
      typeof window !== "undefined" &&
      window.LJS_LEVELS &&
      window.LJS_LEVELS.length > 0
    ) {
      LEVELS = window.LJS_LEVELS.slice();
      return true;
    }
    return false;
  }

  function ensureLevels(done) {
    if (typeof window === "undefined") { done(); return; }
    if (tryLoadLevels()) { done(); return; }
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (tryLoadLevels() || tries >= LEVEL_LOAD_MAX_TRIES) {
        clearInterval(timer);
        done();
      }
    }, LEVEL_LOAD_TRY_MS);
  }

  var TIERS = ["easy", "intermediate", "hard", "mostHard"];

  var TIER_LABELS = {
    easy: "Easy",
    intermediate: "Intermediate",
    hard: "Hard",
    mostHard: "Most Hard",
  };

  var SUCCESS_MSGS = [
    "That's exactly right! The case is closed.",
    "Nailed it, detective! Sharp instincts.",
    "Solved! Your logic is airtight.",
    "Spot on! Every clue pointed there.",
    "Great work! You cracked the code.",
    "That's it! Precise and clean.",
    "Wonderful! The evidence was in your favor.",
    "You got it! Case closed, on to the next.",
  ];

  var WRONG_MSGS = [
    "Not quite yet. Run your code and check the console output.",
    "Hmm, that doesn't solve it. Compare your output with the task.",
    "Almost! Check the hint and the expected result.",
    "Not yet! Make sure you printed the right value with console.log.",
    "Keep digging! The answer should match what the task asks for.",
  ];

  var STATE = { currentLevel: 0, score: 0, completed: {} };

  var POINTS = { easy: 5, intermediate: 10, hard: 15, mostHard: 20 };

  function tierLabel(tier) {
    return TIER_LABELS[tier] || tier || "Easy";
  }

  function pointsForLevel(level) {
    return POINTS[level.tier] || 5;
  }

  function tierIndex(tier) {
    return TIERS.indexOf(tier);
  }

  function countDoneInTier(tierKey) {
    var n = 0, i;
    for (i = 0; i < LEVELS.length; i++) {
      if (LEVELS[i].tier === tierKey && STATE.completed[i]) n++;
    }
    return n;
  }

  function tierLevels(tierKey) {
    var out = [], i;
    for (i = 0; i < LEVELS.length; i++) {
      if (LEVELS[i].tier === tierKey) out.push(LEVELS[i]);
    }
    return out;
  }

  // Progressive gating: finish 3 of 4 cases in a tier to unlock the next;
  // all 4 Hard cases must be solved before Most Hard opens.
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
    var prevLabel = tierLabel(prevKey);
    var prevLevels = tierLevels(prevKey);
    var need = prevKey === "hard" ? prevLevels.length : Math.max(1, prevLevels.length - 1);
    var left = Math.max(0, need - countDoneInTier(prevKey));
    return (
      "Solve " + left + " more " + prevLabel + " case" + (left === 1 ? "" : "es") +
      " to unlock this tier."
    );
  }

  function emitProgress() {
    if (typeof window !== "undefined" && typeof window.__onJsDetectiveProgress === "function") {
      window.__onJsDetectiveProgress({
        currentLevel: STATE.currentLevel,
        score: STATE.score,
        completed: STATE.completed,
        totalLevels: LEVELS.length,
      });
    }
  }

  function publishState() {
    if (typeof window === "undefined") return;
    try {
      window.dispatchEvent(
        new CustomEvent("jsd-state", {
          detail: {
            currentLevel: STATE.currentLevel,
            score: STATE.score,
            completed: STATE.completed,
            totalLevels: LEVELS.length,
          },
        })
      );
    } catch (e) { /* no-op */ }
  }

  function resumeGame(saved) {
    if (!saved) return;
    ensureLevels(function () {
      if (LEVELS.length === 0) return;
      if (typeof saved.currentLevel === "number") {
        var cl = Math.floor(saved.currentLevel);
        if (cl >= 0 && cl < LEVELS.length) STATE.currentLevel = cl;
      }
      if (typeof saved.score === "number") STATE.score = saved.score;
      if (saved.completed && typeof saved.completed === "object") {
        var clean = {};
        for (var k in saved.completed) {
          if (saved.completed[k] && k >= 0 && k < LEVELS.length) clean[k] = true;
        }
        STATE.completed = clean;
      }
      while (STATE.currentLevel > 0 && !isLevelUnlocked(STATE.currentLevel)) {
        STATE.currentLevel--;
      }
      var s = $("score-display");
      if (s) s.textContent = "Score: " + STATE.score;
      renderLevel();
      publishState();
    });
  }

  function $(id) { return document.getElementById(id); }
  function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function stringifyValue(v) {
    if (v === undefined) return "undefined";
    if (v === null) return "null";
    if (typeof v === "string") return "\"" + v + "\"";
    if (typeof v === "function") return "ƒ " + (v.name || "anonymous");
    if (Array.isArray(v)) return "[" + v.map(function (x) { return stringifyValue(x); }).join(",") + "]";
    if (typeof v === "object") {
      try { return JSON.stringify(v); } catch (e) { return String(v); }
    }
    return String(v);
  }

  function evaluateUserCodeAsync(code, setUp) {
    var ctx = {};
    var logs = [];

    function capLog(value) {
      logs.push({ value: value, text: stringifyValue(value) });
    }

    var capturedConsole = {
      log: capLog,
      error: capLog,
      warn: capLog,
      info: capLog,
    };

    function runSetUp() {
      if (!setUp) return;
      try {
        if (typeof setUp === "function") {
          setUp(ctx);
        } else {
          var setupFn = new Function(
            "var ctx = arguments[0];\nvar console = arguments[1];\n" + setUp
          );
          setupFn(ctx, capturedConsole);
        }
      } catch (e) {
        logs.push({ value: undefined, text: "✕ Error: " + safeError(e), isError: true });
      }
    }

    function buildCode() {
      var varDecls = "";
      for (var key in ctx) {
        if (Object.prototype.hasOwnProperty.call(ctx, key)) {
          varDecls += "var " + key + " = ctx." + key + ";\n";
        }
      }
      return (
        "var ctx = arguments[0];\n" +
        "var console = arguments[1];\n" +
        varDecls +
        (code || "") + "\n"
      );
    }

    function settle() {
      return new Promise(function (resolve) { setTimeout(resolve, 60); });
    }

    runSetUp();

    var AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    var fn;
    try {
      fn = new AsyncFunction(buildCode());
    } catch (e) {
      return Promise.resolve({
        error: "Could not build your code: " + safeError(e),
        logs: logs,
        ctx: ctx,
      });
    }

    return Promise.resolve()
      .then(function () { return fn(ctx, capturedConsole); })
      .catch(function (e) {
        logs.push({ value: undefined, text: "✕ Error: " + safeError(e), isError: true });
      })
      .then(settle)
      .then(function () {
        return { logs: logs, ctx: ctx, error: null };
      });
  }

  function safeError(e) {
    if (!e) return "Something went wrong";
    if (e instanceof Error) return e.message;
    try { return String(e); } catch (_) { return "Unknown error"; }
  }

  function runCode() {
    var ta = $("js-editor");
    if (!ta) return;
    var level = LEVELS[STATE.currentLevel];
    if (!level) return;
    evaluateUserCodeAsync(ta.value, level.setUp).then(function (result) {
      renderConsole(result.logs);
    });
  }

  function renderConsole(logs) {
    var consoleEl = $("jsd-console");
    if (!consoleEl) return;
    consoleEl.innerHTML = "";

    if (!logs || logs.length === 0) {
      var empty = document.createElement("div");
      empty.className = "jsd-console-empty";
      empty.textContent = "Run your code to see output here...";
      consoleEl.appendChild(empty);
      return;
    }

    for (var i = 0; i < logs.length; i++) {
      var line = document.createElement("div");
      var cell = logs[i];
      if (cell.isError) {
        line.className = "jsd-console-line error";
        line.textContent = cell.text;
      } else {
        line.className = "jsd-console-line log";
        var prompt = document.createElement("span");
        prompt.className = "prompt";
        prompt.textContent = "›";
        line.appendChild(prompt);
        line.appendChild(document.createTextNode(cell.text));
      }
      consoleEl.appendChild(line);
    }
  }

  function showToast(msg, isError) {
    var t = $("toast");
    if (!t) return;
    t.textContent = (isError ? "\u2715 " : "\u2713 ") + msg;
    t.className = "jsd-status-toast " + (isError ? "error" : "success");
    t.style.display = "flex";
    t.style.opacity = "1";
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.style.opacity = "0"; }, isError ? 6000 : 2600);
  }

  function hideToast() {
    var t = $("toast");
    if (t) { t.style.opacity = "0"; clearTimeout(t._timer); }
  }

  function showOverlay(title, sub, msg, btnText, action) {
    var o = $("overlay");
    if (!o) return;
    var t = qs(".jsd-complete-text", o);
    var s = qs(".jsd-complete-sub", o);
    var m = qs(".jsd-complete-msg", o);
    var b = qs(".jsd-complete-btn", o);
    if (t) t.textContent = title;
    if (s) s.textContent = sub;
    if (m) m.textContent = msg;
    if (b) { b.textContent = btnText; b.onclick = action; }
    o.style.display = "flex";
  }

  function hideOverlay() {
    var o = $("overlay");
    if (o) o.style.display = "none";
  }

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }

  function setButtonsDisabled(v) {
    var cb = $("check-btn");
    var nb = $("next-btn");
    var tb = $("run-btn");
    if (cb) cb.disabled = v;
    if (nb) nb.disabled = v;
    if (tb) tb.disabled = v;
  }

  function completeLevel() {
    if (STATE.completed[STATE.currentLevel]) return;
    STATE.completed[STATE.currentLevel] = true;
    STATE.score += pointsForLevel(LEVELS[STATE.currentLevel]);

    var s = $("score-display");
    if (s) s.textContent = "Score: " + STATE.score;

    var nb = $("next-btn");
    if (nb) { nb.disabled = false; nb.classList.add("ready"); }
    var cb = $("check-btn");
    if (cb) cb.classList.add("ready");

    renderProgress();
    emitProgress();
    publishState();

    var level = LEVELS[STATE.currentLevel];
    showToast(level.successNote || "\u2713 Solved!", false);

    setTimeout(function () {
      showOverlay(
        "Case Solved!",
        "Great work, detective!",
        randomItem(SUCCESS_MSGS),
        level.isFinal ? "See Your Results \u2B50" : "Next Case \u2192",
        function () { nextLevel(); }
      );
    }, 1200);
  }

  function nextLevel() {
    if (!STATE.completed[STATE.currentLevel]) {
      checkAnswer();
      return;
    }
    if (STATE.currentLevel < LEVELS.length - 1) {
      STATE.currentLevel++;
      renderLevel();
      emitProgress();
    } else {
      renderVictory();
      emitProgress();
    }
  }

  function prevLevel() {
    if (STATE.currentLevel > 0) {
      STATE.currentLevel--;
      renderLevel();
      emitProgress();
    }
  }

  function gotoLevel(index) {
    var i = index | 0;
    if (i < 0 || i >= LEVELS.length) return;
    if (!isLevelUnlocked(i)) {
      showToast(lockMessageFor(i), true);
      return;
    }
    STATE.currentLevel = i;
    renderLevel();
    emitProgress();
  }

  function checkAnswer() {
    if (STATE.thinking) return;
    var ta = $("js-editor");
    if (!ta) return;
    var level = LEVELS[STATE.currentLevel];
    if (!level) return;
    STATE.thinking = true;
    setButtonsDisabled(true);

    evaluateUserCodeAsync(ta.value, level.setUp).then(function (result) {
      renderConsole(result.logs);
      STATE.thinking = false;
      setButtonsDisabled(false);

      if (STATE.completed[STATE.currentLevel]) {
        nextLevel();
        return;
      }

      if (result.error) {
        showToast(result.error, true);
        return;
      }

      var crashed = result.logs.some(function (l) { return l.isError; });
      if (crashed) {
        showToast("Your code threw an error. Read the console and fix it.", true);
        return;
      }

      var passed = false;
      try {
        passed = !!level.check(result.ctx, result.logs);
      } catch (e) {
        passed = false;
      }

      if (passed) {
        completeLevel();
      } else {
        showToast(randomItem(WRONG_MSGS), true);
      }
    });
  }

  function renderProgress() {
    var box = $("progress-dots");
    if (!box) return;
    box.innerHTML = "";
    for (var i = 0; i < LEVELS.length; i++) {
      var unlocked = isLevelUnlocked(i);
      var d = document.createElement("button");
      d.type = "button";
      d.className =
        "jsd-progress-dot" +
        (i === STATE.currentLevel ? " current" : "") +
        (STATE.completed[i] ? " done" : "") +
        (unlocked ? "" : " locked");
      d.setAttribute("aria-label", "Case " + (i + 1) + (STATE.completed[i] ? " (solved)" : ""));
      d.title = "Case " + (i + 1) + (STATE.completed[i] ? " \u2713" : unlocked ? "" : " (locked)");
      if (STATE.completed[i]) {
        d.innerHTML = "\u2713";
      } else if (!unlocked) {
        d.innerHTML = "\uD83D\uDD12";
      }
      (function (idx) {
        d.addEventListener("click", function () {
          if (idx === STATE.currentLevel) return;
          if (!isLevelUnlocked(idx)) {
            showToast(lockMessageFor(idx), true);
            return;
          }
          STATE.currentLevel = idx;
          renderLevel();
          emitProgress();
        });
      })(i);
      box.appendChild(d);
    }
  }

  function renderLevel() {
    var level = LEVELS[STATE.currentLevel];
    if (!level) return renderVictory();

    var titleEl = $("level-title");
    var numEl = $("level-number");
    var instrEl = $("level-instruction");
    var hintEl = $("level-hint");
    var diffEl = $("level-difficulty");
    var ta = $("js-editor");
    var nb = $("next-btn");
    var pb = $("prev-btn");
    var cb = $("check-btn");

    if (titleEl) titleEl.textContent = level.title;
    if (numEl) numEl.textContent = level.id;
    if (instrEl) instrEl.innerHTML = level.instruction;

    // Hard / Most Hard cases gate their hint behind a reveal button.
    if (hintEl) {
      hintEl.innerHTML = "";
      var gated = level.tier === "hard" || level.tier === "mostHard";
      if (gated) {
        var reveal = document.createElement("button");
        reveal.type = "button";
        reveal.className = "jsd-hint-reveal";
        reveal.textContent = "\uD83D\uDCA1 Reveal hint (" + tierLabel(level.tier) + " case)";
        reveal.onclick = function () {
          hintEl.innerHTML = "";
          var spark = document.createElement("span");
          spark.innerHTML = "\uD83D\uDCA1 ";
          hintEl.appendChild(spark);
          hintEl.appendChild(document.createTextNode("Hint: "));
          var hintSpan = document.createElement("span");
          hintSpan.innerHTML = level.hint;
          hintEl.appendChild(hintSpan);
        };
        hintEl.appendChild(reveal);
      } else {
        var spark = document.createElement("span");
        spark.innerHTML = "\uD83D\uDCA1 ";
        hintEl.appendChild(spark);
        hintEl.appendChild(document.createTextNode("Hint: "));
        var hintSpan = document.createElement("span");
        hintSpan.innerHTML = level.hint;
        hintEl.appendChild(hintSpan);
      }
    }

    if (diffEl) {
      diffEl.textContent = tierLabel(level.tier);
      diffEl.className = "jsd-level-difficulty " + level.tier;
    }
    if (ta) {
      ta.value = level.starter || "";
      ta.placeholder = level.isFinal ? "Fix the boss case, detective!" : "Write your JavaScript here...";
    }
    if (pb) { pb.disabled = STATE.currentLevel === 0; pb.style.opacity = STATE.currentLevel === 0 ? "0.4" : "1"; }
    if (nb) { nb.disabled = false; nb.classList.toggle("ready", !!STATE.completed[STATE.currentLevel]); }
    if (cb) { cb.disabled = false; cb.classList.toggle("ready", !!STATE.completed[STATE.currentLevel]); }

    renderProgress();
    renderConsole([]);
    hideOverlay();
    hideToast();
    publishState();
  }

  function renderVictory() {
    if (LEVELS.length === 0) return;
    var done = 0;
    for (var k in STATE.completed) if (STATE.completed[k]) done++;
    var stars = done >= LEVELS.length ? "\u2B50\u2B50\u2B50" : done >= LEVELS.length * 0.7 ? "\u2B50\u2B50" : "\u2B50";

    var t = $("level-title");
    var n = $("level-number");
    var i = $("level-instruction");
    var h = $("level-hint");
    var d = $("level-difficulty");

    if (t) t.textContent = "You Did It!";
    if (n) n.textContent = "\uD83C\uDF1F";
    if (i) i.textContent = "All " + LEVELS.length + " cases closed — Easy, Intermediate, Hard and Most Hard. You mastered the core of JavaScript.";
    if (h) h.innerHTML = "Hint: You can now write variables, loops, functions, objects, DOM handlers, storage and async code. Share your score!";
    if (d) { d.textContent = "Detective Master"; d.className = "jsd-level-difficulty mostHard"; }

    var consoleEl = $("jsd-console");
    if (consoleEl) {
      consoleEl.innerHTML = "";
      var banner = document.createElement("div");
      banner.className = "jsd-console-line success";
      banner.textContent = stars + " JS DETECTIVE MASTER! Score: " + STATE.score + " | Cases: " + done + "/" + LEVELS.length;
      consoleEl.appendChild(banner);
    }

    var ta = $("js-editor");
    if (ta) ta.value = "";

    var nb = $("next-btn");
    if (nb) { nb.disabled = true; nb.classList.remove("ready"); }
    var pb = $("prev-btn");
    if (pb) { pb.disabled = false; pb.style.opacity = "1"; }
    var cb = $("check-btn");
    if (cb) cb.classList.remove("ready");

    hideOverlay();
    renderProgress();
    publishState();
  }

  function handleRun() {
    runCode();
  }

  function handleInput() {
    var ta = $("js-editor");
    var hint = $("jsd-editor-hint");
    if (!ta || !hint) return;
    hint.classList.toggle("has-value", ta.value.trim().length > 0);
    if (STATE.completed[STATE.currentLevel]) {
      hideToast();
    }
  }

  function handleReset() {
    var level = LEVELS[STATE.currentLevel];
    var ta = $("js-editor");
    if (!ta || !level) return;
    ta.value = level.starter || "";
    handleInput();
    renderConsole([]);
    hideToast();
    if (STATE.completed[STATE.currentLevel]) {
      STATE.completed[STATE.currentLevel] = false;
      STATE.score = Math.max(0, STATE.score - pointsForLevel(level));
      var s = $("score-display");
      if (s) s.textContent = "Score: " + STATE.score;
      var nb = $("next-btn");
      if (nb) nb.classList.remove("ready");
      var cb = $("check-btn");
      if (cb) cb.classList.remove("ready");
      renderProgress();
      emitProgress();
      publishState();
    }
  }

  function handleKey(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      checkAnswer();
    }
  }

  function initGame() {
    var ta = $("js-editor");
    var pb = $("prev-btn");
    var nb = $("next-btn");
    var cb = $("check-btn");
    var rb = $("run-btn");

    if (ta) {
      ta.removeEventListener("input", handleInput);
      ta.addEventListener("input", handleInput);
      ta.removeEventListener("keydown", handleKey);
      ta.addEventListener("keydown", handleKey);
    }
    if (pb) { pb.removeEventListener("click", prevLevel); pb.addEventListener("click", prevLevel); }
    if (cb) { cb.removeEventListener("click", checkAnswer); cb.addEventListener("click", checkAnswer); }
    if (nb) { nb.removeEventListener("click", nextLevel); nb.addEventListener("click", nextLevel); }
    if (rb) { rb.removeEventListener("click", handleRun); rb.addEventListener("click", handleRun); }

    var resetBtn = $("reset-btn");
    if (resetBtn) { resetBtn.removeEventListener("click", handleReset); resetBtn.addEventListener("click", handleReset); }

    STATE.currentLevel = 0;
    STATE.score = 0;
    STATE.completed = {};

    var s = $("score-display");
    if (s) s.textContent = "Score: 0";

    ensureLevels(function () {
      if (LEVELS.length === 0) {
        showToast("Case files still loading — if this keeps up, reload the page.", true);
        return;
      }
      renderLevel();
    });
  }

  if (typeof window !== "undefined") {
    window.__initJsDetective = function () { initGame(); };
    window.__resumeJsDetective = function (saved) { resumeGame(saved); };
    window.__getJsDetectiveState = function () {
      tryLoadLevels();
      return {
        currentLevel: STATE.currentLevel,
        score: STATE.score,
        completed: STATE.completed,
        totalLevels: LEVELS.length,
      };
    };
    window.__runJsDetective = function () { runCode(); };
    window.__goToJsDetectiveLevel = function (index) { gotoLevel(index); };
    window.__getJsDetectiveLevels = function () {
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
        };
      });
    };
  }
})();