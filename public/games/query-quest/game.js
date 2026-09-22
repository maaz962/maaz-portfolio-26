/* ==========================================================================
   QUERY QUEST — SQL engine (sql.js / SQLite via WebAssembly).
   Follows the php-playground engine contract so the shared page + hook
   wiring (level meta, tier gate, points, hints, solutions, DB progress)
   behave identically across games.

   window API:
     __initQueryQuest                 init/reset state (called by hook)
     __resumeQueryQuest(saved)        restore DB progress (hook)
     __getQueryQuestLevels()          level meta for the sidebar cards
     __getQueryQuestState()           live snapshot for boot polling
     __goToQueryQuestLevel(index)     navigate (0-based, tier-gated)
     __queryQuestRun(index, code)     execute SQL, return result table
     __queryQuestCheck(index, code)   execute + judge vs expected result
     __queryQuestRevealHint(index)    reveal hint (max 3/day, DB-tracked)
     __queryQuestBootState()          { boot: idle|booting|ready|error }
   Events:
     query-quest-boot   {status: booting|ready|error, message?}
     query-quest-state  {currentLevel, score, completed, solutions,
                         hints, totalLevels, ready, bootError}

   The sql.js engine (JS + WASM, ~640 KB) warms up on init/resume so the
   download actually happens without user interaction. Results are judged
   against expectedColumns + expectedRows in exact order (row order matters).
   Every execution re-seeds a FRESH database (SQLite is in-memory, cost is
   negligible) so INSERT/UPDATE/DELETE levels are deterministic and users
   can retry as often as they like.
   ========================================================================== */
(function () {
  "use strict";

  var TIERS = ["easy", "intermediate", "hard", "mostHard"];
  var TIER_LABELS = { easy: "Easy", intermediate: "Intermediate", hard: "Hard", mostHard: "Most Hard" };
  var TIER_ACCENTS = {
    easy: "emerald",
    intermediate: "sky",
    hard: "amber",
    mostHard: "rose",
  };
  var POINTS = { easy: 5, intermediate: 6, hard: 7, mostHard: 8 };
  var HINTS_PER_DAY = 3;

  var LEVELS = [];

  var STATE = {
    currentLevel: 0,
    score: 0,
    completed: {},
    solutions: {},
    hintsDate: null,
    hintsUsed: 0,
    ready: false,
    bootError: null,
  };

  /* ---- level data (poll-safe) -------------------------------------------- */

  function tryLoadLevels() {
    if (LEVELS.length) return true;
    try {
      if (typeof window.__queryQuestLevels !== "undefined") {
        LEVELS = window.__queryQuestLevels || [];
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

  // Finish all but one level in a tier to unlock the next; all Hard levels
  // must be solved before Most Hard opens (same rules as the other games).
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
      ready: STATE.ready,
      bootError: STATE.bootError,
    };
    try {
      window.dispatchEvent(new CustomEvent("query-quest-state", { detail: payload }));
    } catch (e) { /* no listeners yet */ }
    if (typeof window.__onQueryQuestProgress === "function") {
      try { window.__onQueryQuestProgress(payload); } catch (e) { /* ignore */ }
    }
  }

  /* ---- sql.js boot --------------------------------------------------------- */

  var SQL_INIT = null;
  var DB = null;
  var bootState = { status: "idle", bootPromise: null };
  var BOOT_TIMEOUT_MS = 60000;

  function bootEvent(status, message) {
    var detail = { status: status };
    if (message !== undefined) detail.message = message;
    try {
      window.dispatchEvent(new CustomEvent("query-quest-boot", { detail: detail }));
    } catch (e) { /* no listeners yet */ }
  }

  function ensureBooted() {
    if (bootState.status === "ready" && DB) return Promise.resolve(DB);
    if (bootState.status === "booting") return bootState.bootPromise;
    bootState.status = "booting";
    bootEvent("booting");

    var watchdog = setTimeout(function () {
      if (bootState.status !== "booting") return;
      bootState.status = "error";
      bootState.bootPromise = null;
      STATE.ready = false;
      STATE.bootError = "The SQL engine did not start within " + Math.round(BOOT_TIMEOUT_MS / 1000) + "s. Try again, or check that the query-quest WASM assets are deployed.";
      bootEvent("error", STATE.bootError);
      publishState();
    }, BOOT_TIMEOUT_MS);

    function loadInit() {
      if (typeof window.initSqlJs === "function") return Promise.resolve(window.initSqlJs);
      return new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = "/games/query-quest/sql-wasm.js";
        s.async = true;
        s.onload = function () {
          if (typeof window.initSqlJs === "function") resolve(window.initSqlJs);
          else reject(new Error("sql.js loaded but initSqlJs is missing."));
        };
        s.onerror = function () {
          reject(new Error("Could not load the SQL engine (sql.js). Check the network tab."));
        };
        document.head.appendChild(s);
      });
    }

    bootState.bootPromise = Promise.resolve()
      .then(loadInit)
      .then(function (init) {
        SQL_INIT = init;
        return init({ locateFile: function (f) { return "/games/query-quest/" + f; } });
      })
      .then(function (SQL) {
        DB = new SQL.Database();
        seed();
        STATE.ready = true;
        STATE.bootError = null;
        bootState.status = "ready";
        clearTimeout(watchdog);
        bootEvent("ready");
        publishState();
        return DB;
      })
      .catch(function (err) {
        bootState.status = "error";
        bootState.bootPromise = null;
        STATE.ready = false;
        if (!STATE.bootError) STATE.bootError = String((err && err.message) || err);
        clearTimeout(watchdog);
        bootEvent("error", STATE.bootError);
        publishState();
        throw err;
      });

    return bootState.bootPromise;
  }

  /* ---- seed ----------------------------------------------------------------- */

  // In-memory DemoCorp data (idempotent: run before every execution).
  // Traps designed into the data: Coffee Mug (product 5) is never ordered;
  // Barbara Liskov (user 5) has no orders.
  function seed() {
    DB.run("DROP TABLE IF EXISTS users;");
    DB.run("DROP TABLE IF EXISTS products;");
    DB.run("DROP TABLE IF EXISTS orders;");

    DB.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, city TEXT NOT NULL, age INTEGER NOT NULL);");
    [
      [1, "Ada Lovelace", "ada@example.com", "London", 36],
      [2, "Grace Hopper", "grace@example.com", "New York", 85],
      [3, "Alan Turing", "alan@example.com", "London", 41],
      [4, "Linus Torvalds", "linus@example.com", "Helsinki", 55],
      [5, "Barbara Liskov", "barbara@example.com", "Boston", 84],
      [6, "Margaret Hamilton", "margaret@example.com", "Boston", 88],
    ].forEach(function (r) { DB.run("INSERT INTO users (id, name, email, city, age) VALUES (?, ?, ?, ?, ?)", r); });

    DB.run("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, price REAL NOT NULL);");
    [
      [1, "Laptop", "electronics", 1200],
      [2, "Mouse", "electronics", 20],
      [3, "Keyboard", "electronics", 80],
      [4, "Desk Lamp", "home", 45],
      [5, "Coffee Mug", "home", 12],
      [6, "Notebook", "stationery", 4],
    ].forEach(function (r) { DB.run("INSERT INTO products (id, name, category, price) VALUES (?, ?, ?, ?)", r); });

    DB.run("CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL);");
    [
      [1, 1, 1, 1, "paid", "2024-01-05"],
      [2, 1, 3, 2, "paid", "2024-02-11"],
      [3, 2, 6, 4, "shipped", "2024-01-18"],
      [4, 3, 2, 1, "paid", "2024-03-02"],
      [5, 3, 1, 1, "cancelled", "2024-03-15"],
      [6, 4, 6, 5, "shipped", "2024-04-22"],
      [7, 6, 4, 1, "paid", "2024-05-09"],
      [8, 6, 1, 2, "pending", "2024-06-30"],
    ].forEach(function (r) { DB.run("INSERT INTO orders (id, user_id, product_id, quantity, status, created_at) VALUES (?, ?, ?, ?, ?, ?)", r); });
  }

  /* ---- run / judge ------------------------------------------------------------ */

  function toRows(t) {
    var cols = t.columns || [];
    return (t.values || []).map(function (v) {
      var o = {};
      for (var i = 0; i < cols.length; i++) o[String(cols[i])] = v[i];
      return o;
    });
  }

  function sqlMetaError(err) {
    var m = String((err && err.message) || err || "SQL error");
    if (/no such column/i.test(m)) return { error: m, errorType: "column" };
    if (/no such table/i.test(m)) return { error: m, errorType: "table" };
    if (/no such function/i.test(m)) return { error: m, errorType: "function" };
    if (/syntax error|unrecognized token|unterminated|incomplete input/i.test(m)) return { error: m, errorType: "syntax" };
    return { error: m, errorType: "runtime" };
  }

  // Re-seed a FRESH database before every execution so mutation levels
  // (INSERT / UPDATE / DELETE) are byte-for-byte deterministic on retries.
  function runUser(code) {
    return ensureBooted().then(function () {
      seed();
      try {
        var res = DB.exec(String(code || ""));
        var t = res && res.length ? res[0] : null;
        return {
          ok: true,
          columns: t ? t.columns : [],
          values: t ? t.values : [],
          rows: t ? toRows(t) : [],
          error: null,
        };
      } catch (err) {
        var meta = sqlMetaError(err);
        return { ok: false, columns: [], values: [], rows: [], error: meta.error, errorType: meta.errorType };
      }
    });
  }

  function colsMatch(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (String(a[i]).toLowerCase() !== String(b[i]).toLowerCase()) return false;
    }
    return true;
  }
  function rowsMatch(exp, act) {
    if (!exp || !act) return false;
    if (exp.length !== act.length) return false;
    for (var i = 0; i < exp.length; i++) {
      var er = exp[i], ar = act[i];
      if (!ar || er.length !== ar.length) return false;
      for (var j = 0; j < er.length; j++) {
        if (String(er[j]) !== String(ar[j])) return false;
      }
    }
    return true;
  }

  function checkLevel(index, code) {
    var lvl = LEVELS[index];
    if (!lvl) return Promise.resolve({ ok: false, error: "Unknown level.", errorType: "wrong" });
    return runUser(code).then(function (r) {
      if (!r.ok) {
        return { ok: false, columns: [], rows: [], error: r.error, errorType: r.errorType || "runtime" };
      }
      var labels = columnsToLabels(r.columns);
      if (!r.columns.length) {
        return {
          ok: false,
          columns: [],
          rows: [],
          error: lvl.seedErr || "Your query produced no table of results. Finish with a SELECT.",
          errorType: "wrong",
        };
      }
      var colsOk = colsMatch(lvl.expectedColumns, r.columns);
      var rowsOk = rowsMatch(lvl.expectedRows, r.values);
      var ok = colsOk && rowsOk;
      var detail = [];
      if (!colsOk) detail.push("Expected columns: " + lvl.expectedColumns.join(", ") + " — got: " + r.columns.join(", "));
      if (!rowsOk) detail.push("Expected " + lvl.expectedRows.length + " row(s), got " + r.values.length + ". Row order matters.");
      if (ok) {
        STATE.completed[index] = true;
        STATE.solutions[index] = String(code || "");
        publishState();
        return {
          ok: true,
          columns: labels,
          values: r.values,
          rows: r.rows,
          score: pointsForLevel(lvl),
          completed: true,
        };
      }
      return {
        ok: false,
        columns: labels,
        values: r.values,
        rows: r.rows,
        error: lvl.seedErr || "Result doesn't match the expected output.",
        detail: detail.length ? detail.join(" ") : null,
        errorType: "wrong",
      };
    });
  }

  function columnsToLabels(cols) {
    return (cols || []).map(String);
  }

  /* ---- hints ------------------------------------------------------------------ */

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

  /* ---- navigation -------------------------------------------------------------- */

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
    ensureBooted().catch(function () {});
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
    ensureBooted().catch(function () {});
  }

  window.__initQueryQuest = init;
  window.__resumeQueryQuest = resume;
  window.__getQueryQuestLevels = function () {
    tryLoadLevels();
    return LEVELS.map(function (lv) {
      return {
        id: lv.id,
        title: lv.title,
        tier: lv.tier,
        concept: lv.concepts || [],
        points: pointsForLevel(lv),
        isFinal: !!lv.isFinal,
        shortDesc: lv.shortDesc || "",
        instruction: lv.instruction || "",
        hint: lv.hint || "",
        seedCode: lv.starter || "",
        seedErr: lv.seedErr || "Result doesn't match the expected output.",
        expectedColumns: (lv.expectedColumns || []).map(String),
        expectedRows: lv.expectedRows || [],
      };
    });
  };
  window.__getQueryQuestState = function () {
    tryLoadLevels();
    return {
      currentLevel: STATE.currentLevel,
      score: STATE.score,
      completed: STATE.completed,
      solutions: STATE.solutions,
      hints: { date: STATE.hintsDate, used: STATE.hintsUsed },
      totalLevels: LEVELS.length,
      ready: STATE.ready,
      bootError: STATE.bootError,
    };
  };
  window.__goToQueryQuestLevel = gotoLevel;
  window.__queryQuestRun = function (index, code) { return runUser(code); };
  window.__queryQuestCheck = function (index, code) { return checkLevel(index, code); };
  window.__queryQuestRevealHint = revealHint;
  window.__queryQuestBootState = function () {
    tryLoadLevels();
    return { boot: bootState.status };
  };
})();