/* PHP Playground — vanilla IIFE, js-detective contract (exact):
 *   __initPhpPlayground / __resumePhpPlayground / __onPhpPlaygroundProgress /
 *   __getPhpPlaygroundLevels / __goToPhpPlaygroundLevel / __checkPhpPlayground
 * The heavy PHP (php-wasm) engine is booted lazily by the page.tsx bridge —
 * this engine only owns level data, tier unlock, XP, hints and progress, and
 * delegates code execution to window.__phpPlaygroundRun(source). It also emits
 * a "php-booting" phase so the page can show a "Setting up PHP engine…" state.
 */
(function () {
  "use strict";

  var LEVELS = [];
  try { LEVELS = window.__phpPlaygroundLevels || []; } catch (e) { LEVELS = []; }

  var TIER_ORDER = ["easy", "intermediate", "hard", "mostHard"];
  var LAST_TIER = "mostHard";

  var STATE = {
    currentLevel: 0,
    score: LEVELS.reduce(function (s, l) { return s + l.xp; }, 0),
    completed: {},
    hints: {},
    totalLevels: LEVELS.length,
  };
  var emitter = null;

  function tierLevels(tier) { return LEVELS.filter(function (l) { return l.tier === tier; }); }
  function tierDone(tier) { return tierLevels(tier).filter(function (l) { return STATE.completed[l.id - 1]; }).length; }
  function tierOpen(tier) {
    if (tier === "easy") return true;
    var prev = TIER_ORDER[TIER_ORDER.indexOf(tier) - 1];
    var prevId = tierLevels(prev).map(function (l) { return l.id; });
    if (!prevId.length) return true;
    return tierDone(prev) >= prevId.length;
  }

  function emit() {
    var payload = {
      currentLevel: STATE.currentLevel,
      score: STATE.score,
      completed: STATE.completed,
      totalLevels: STATE.totalLevels,
    };
    if (emitter) emitter(payload);
    if (window.__onPhpPlaygroundProgressExternal) window.__onPhpPlaygroundProgressExternal(payload);
  }

  function markDone(id) {
    if (STATE.completed[id]) return;
    STATE.completed[id] = true;
    emit();
  }

  function garbageCollect() {}

  function checkLevel(id, source) {
    var lvl = LEVELS.find(function (l) { return l.id === id; });
    if (!lvl) return Promise.resolve({ ok: false, error: "Unknown level." });
    if (typeof window.__phpPlaygroundRun !== "function") {
      return Promise.resolve({ ok: false, error: "PHP engine is still booting. Please wait a moment, then try again.", booting: true });
    }
    return Promise.resolve(window.__phpPlaygroundRun(source)).then(function (res) {
      if (!res) return { ok: false, error: "PHP engine returned no result." };
      if (res.error) return { ok: false, error: res.error, stdout: res.stdout || "" };
      // The level's PASS value is a plain string compared against stdout.
      var expected = String(lvl.passValue ?? "");
      var actual = String(res.stdout ?? "").trim();
      if (actual === expected) {
        markDone(id);
        return { ok: true, stdout: actual };
      }
      return { ok: false, error: res.stderr || lvl.seedErr || "Output doesn't match.", stdout: actual };
    });
  }

  function goLevel(id) {
    if (id < 0 || id >= STATE.totalLevels) return;
    STATE.currentLevel = id;
    emit();
  }

  function init(cb) { if (cb) emitter = cb; emit(); }
  function resume(cb, prev) {
    if (cb) emitter = cb;
    if (prev) {
      STATE.currentLevel = prev.currentLevel || 0;
      STATE.score = prev.score || LEVELS.reduce(function (s, l) { return s + l.xp; }, 0);
      STATE.completed = prev.completed || {};
      if (prev.totalLevels) STATE.totalLevels = prev.totalLevels;
    }
    emit();
  }

  window.__initPhpPlayground = init;
  window.__resumePhpPlayground = resume;
  window.__onPhpPlaygroundProgress = function (cb) { emitter = cb; };
  window.__getPhpPlaygroundLevels = function () { return LEVELS; };
  window.__goToPhpPlaygroundLevel = function (id) { goLevel(id); };
  window.__checkPhpPlayground = function (id, source) { return checkLevel(id, source); };
  window.__getPhpPlaygroundState = function () { return STATE; };
})();
