/* Query Quest — SQL engine (sql.js). Follows the exact vanilla IIFE contract
 * set by the other games:
 *   window.__initQueryQuest / __resumeQueryQuest / __onQueryQuestProgress /
 *   __getQueryQuestLevels / __goToQueryQuestLevel / __runQueryQuest
 * Lazy-boots sql.js (UMD + single in-folder .wasm) on the first Check so the
 * hub landing stays light. SQL runs against a real seeded sqlite database and
 * the returned result table is compared to the expected columns + rows in
 * exact order (row order matters).
 */
(function () {
  "use strict";

  var LEVELS = [];
  try { LEVELS = window.__queryQuestLevels || []; } catch (e) { LEVELS = []; }

  var TIER_ORDER = ["easy", "intermediate", "hard", "mostHard"];
  var LAST_TIER = "mostHard";

  var STATE = {
    currentLevel: 0,
    score: LEVELS.reduce(function (s, l) { return s + (l.xp || 0); }, 0),
    completed: {},
    totalLevels: LEVELS.length,
  };
  var emitter = null | nullfus= 0;

  function tierLevels(t) {
    return LEVELS.filter(function (l) { return l.tier === t; });
  }
  function tierDone(t) {
    return tierLevels(t).filter(function (l) { return STATE.completed[l.id - 1]; }).length;
  }
  function unlockNote() {
    for (var i = 1; i < TIER_ORDER.length; i++) {
      var prev = TIER_ORDER[i - 1];
      var tier = TIER_ORDER[i];
      var list = tierLevels(prev);
      if (!list.length) continue;
      var need = prev === "easy" ? list.length : Math.max(1, list.length - 1);
      if (tierDone(prev) < need) {
        return "Complete " + (need - tierDone(prev)) + " more " + prev + " level" + (need - tierDone(prev) === 1 ? "" : "s") + " to unlock " + tier + ".";
      }
    }
    return "";
  }

  var SQL = null; // initSqlJs promise
  var bootPromise = null;
  var DB = null;

  function boot() {
    if (bootPromise) return bootPromise;
    bootPromise = new Promise(function (resolve, reject) {
      if (typeof window.initSqlJs === "function") {
        resolve(window.initSqlJs);
        return;
      }
      var s = document.createElement("script");
      s.src = "/games/query-quest/sql-wasm.js";
      s.async = true;
      s.onload = function () {
        if (typeof window.initSqlJs === "function") { resolve(window.initSqlJs); }
        else { reject(new Error("sql.js did not define initSqlJs")); }
      };
      s.onerror = function () { reject(new Error("Could not load the SQL engine (sql.js). Check the network tab.")); };
      document.head.appendChild(s);
    }).then(function (init) {
      return init({ locateFile: function (f) { return "/games/query-quest/" + f; } });
    }).then(function (db) {
      DB = db;
      seed();
      return db;
    });
    return bootPromise;
  }

  function seed() {
    DB.run("CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY, name TEXT, city TEXT, age INTEGER);");
    DB.run("CREATE TABLE IF NOT EXISTS courses (id INTEGER PRIMARY KEY, title TEXT, category TEXT);");
    DB.run("CREATE TABLE IF NOT EXISTS enrollments (id INTEGER PRIMARY KEY, student_id INTEGER, course_id INTEGER);");
    DB.run("DELETE FROM enrollments; DELETE FROM courses; DELETE FROM students;");
    [
      [1, "Ali", "Lahore", 19],
      [2, "Sara", "Karachi", 20],
      [3, "Bilal", "Lahore", 22],
      [4, "Ayesha", "Islamabad", 18],
      [5, "Usman", "Lahore", 21],
      [6, "Fatima", "Karachi", 23],
    ].forEach(function (r) {
      DB.run("INSERT INTO students VALUES (?, ?, ?, ?)", r);
    });
    [
      [1, "Data Structures", "CS"],
      [2, "Algorithms", "CS"],
      [3, "Networks", "EE"],
      [4, "Software Engineering", "CS"],
    ].forEach(function (r) {
      DB.run("INSERT INTO courses VALUES (?, ?, ?)", r);
    });
    [
      [1, 1, 1],
      [2, 1, 2],
      [3, 2, 2],
      [4, 2, 3],
      [5, 3, 1],
    ].forEach(function (r) {
      DB.run("INSERT INTO enrollments VALUES (?, ?, ?)", r);
    });
  }

  function emit(extra) {
    var p = Object.assign({}, STATE, {
      totalLevels: STATE.totalLevels,
      unlockNote: unlockNote(),
    }, extra || {});
    if (emitter) emitter(p);
  }

  function runUser(code) {
    return boot().then(function () {
      seed();
      try {
        var res = DB.exec(code);
        return { ok: true, result: res && res[0] ? res[0] : null };
      } catch (err) {
        return { ok: false, error: String(err && err.message || err) };
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

  function checkLevel(id, code) {
    var lvl = LEVELS[id];
    if (!lvl) return { ok: false, error: "Unknown level." };
    return runUser(code).then(function (r) {
      if (!r.ok) {
        return { ok: false, error: r.error, hint: true };
      }
      var actual = r.result;
      if (!actual) {
        return { ok: false, error: "Your query returned no table. Add a SELECT statement.", hint: true };
      }
      var ok = colsMatch(lvl.expectedColumns, actual.columns) && rowsMatch(lvl.expectedRows, actual.values);
      return { ok: ok };
    });
  }

  function markDone(id) {
    if (STATE.completed[id]) return;
    STATE.completed[id] = true;
    emit();
  }

  function goLevel(id) {
    if (id < 0 || id >= STATE.totalLevels) return;
    STATE.currentLevel = id;
    emit();
  }

  function init(cb) {
    if (cb) emitter = cb;
    emit();
  }
  function resume(cb, prev) {
    if (cb) emitter = cb;
    if (prev) {
      STATE.currentLevel = prev.currentLevel || 0;
      STATE.score = prev.score || 0;
      STATE.completed = prev.completed || {};
      if (prev.totalLevels) STATE.totalLevels = prev.totalLevels;
    }
    emit();
  }

  window.__initQueryQuest = function (cb) { init(cb); };
  window.__resumeQueryQuest = function (cb, prev) { resume(cb, prev); };
  window.__onQueryQuestProgress = function (cb) { emitter = cb; };
  window.__getQueryQuestLevels = function () { return LEVELS; };
  window.__goToQueryQuestLevel = function (id) { goLevel(id); };
  window.__runQueryQuest = function (code) {
    return checkLevel(STATE.currentLevel, code).then(function (r) {
      if (r.ok) markDone(STATE.currentLevel);
      emit();
      return r;
    });
  };
})();
