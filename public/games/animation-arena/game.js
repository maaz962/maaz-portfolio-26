(function () {
  "use strict";

  // ANIMATION ARENA: CSS transitions + keyframe animations, taught through
  // 12 levels across two tiers (8 Beginner, 4 Intermediate). Players compose
  // CSS property: value pairs in the editor and hit Check; a live preview
  // applies valid pairs to the #arena-stage element on the board.

  // A fixed <style> block defines the keyframes players refer to by name
  // (pulse, spin, float, pop, wiggle), so the answer is always just composing
  // the `animation` shorthand from the editor; no keyframes authoring needed.
  var KEYFRAMES_CSS = [
    "@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }",
    "@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }",
    "@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }",
    "@keyframes pop { 0% { transform: scale(0); opacity: 0.3; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }",
    "@keyframes wiggle { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }"
  ].join("\n");

  // Per-tier XP. 8 beginner (8 XP) + 4 intermediate (9 XP) = 100 exactly,
  // matching the 100-point ceiling of every other game on the site.
  var POINTS = { beginner: 8, intermediate: 9 };

  var TIER_LABELS = { beginner: "Beginner", intermediate: "Intermediate" };

  var SUCCESS_MSGS = [
    "Nailed it! The crowd goes wild!",
    "Perfect form! You're a natural!",
    "That's the move! Ten out of ten!",
    "Flawless execution! Encore!",
    "Beautifully timed! On to the next!",
  ];

  var WRONG_MSGS = [
    "Not quite. Compare your property and value with the task.",
    "Almost! Re-read the instruction and double-check the value.",
    "Hmm, that doesn't animate the way the task asks. Check the hint!",
    "Keep at it. The property is right, but the value needs work.",
  ];

  var VALID_PROPS = [
    "transition",
    "transform",
    "animation",
    "animation-delay",
    "animation-direction",
    "animation-duration",
    "animation-fill-mode",
    "animation-iteration-count",
    "animation-name",
    "animation-timing-function",
  ];

  // Note: parseCSS lowercases both the property and the value, so accepted
  // values here are lowercase (e.g. "translatex(80px)").
  var LEVELS = [
    {
      id: 1,
      tier: "beginner",
      title: "First Fade",
      instruction:
        "The star flashes in with zero smoothness. Give it a transition so its background color changes gradually. Use the property background-color with a 0.4s duration.",
      hint: "A transition needs the property name and how long it lasts. Write <code>transition: background-color 0.4s</code>.",
      accept: [
        { "transition": "background-color 0.4s" },
      ],
      placeholder: "Write your CSS here...",
      multiLine: false,
      hover: false,
      concepts: ["transition", "duration"],
      fx: "bgfade",
    },
    {
      id: 2,
      tier: "beginner",
      title: "Easy Does It",
      instruction:
        "The star dims abruptly. Smooth it out with the transition shorthand. Fade opacity over 0.6s using the ease-in-out timing function.",
      hint: "Use the shortcut here: <code>transition: opacity 0.6s ease-in-out</code>.",
      accept: [
        { "transition": "opacity 0.6s ease-in-out" },
      ],
      placeholder: "Write your CSS here...",
      multiLine: false,
      hover: false,
      concepts: ["transition", "timing"],
      fx: "opacitypulse",
    },
    {
      id: 3,
      tier: "beginner",
      title: "Slide Over",
      instruction:
        "Slide the star over to the dashed goal ring by transforming it. Translate it 80px along the X axis.",
      hint: "Transform moves the star. Try <code>transform: translateX(80px)</code>.",
      accept: [
        { "transform": "translatex(80px)" },
      ],
      placeholder: "Write your CSS here...",
      multiLine: false,
      hover: false,
      concepts: ["transform", "translate"],
      fx: null,
      goalX: 80,
    },
    {
      id: 4,
      tier: "beginner",
      title: "Turn the Dial",
      instruction:
        "Spin the star a quarter turn by rotating it 45deg.",
      hint: "Rotations happen with <code>transform: rotate(45deg)</code>.",
      accept: [
        { "transform": "rotate(45deg)" },
      ],
      placeholder: "Write your CSS here...",
      multiLine: false,
      hover: false,
      concepts: ["transform", "rotate"],
      fx: null,
    },
    {
      id: 5,
      tier: "beginner",
      title: "Super Size",
      instruction:
        "Blow the star up. Scale it to 1.5 times its size.",
      hint: "<code>transform: scale(1.5)</code> will grow it for you.",
      accept: [
        { "transform": "scale(1.5)" },
      ],
      placeholder: "Write your CSS here...",
      multiLine: false,
      hover: false,
      concepts: ["transform", "scale"],
      fx: null,
    },
    {
      id: 6,
      tier: "beginner",
      title: "First Loop",
      instruction:
        "Make the star pulse on a loop using the built-in pulse keyframes. Use the animation property with a 1.5s duration.",
      hint: "Keyframes run through the animation property, like <code>animation: pulse 1.5s</code>.",
      accept: [
        { "animation": "pulse 1.5s" },
      ],
      placeholder: "Write your CSS here...",
      multiLine: false,
      hover: false,
      concepts: ["animation", "keyframes"],
      fx: null,
    },
    {
      id: 7,
      tier: "beginner",
      title: "Endless Motion",
      instruction:
        "Set the star spinning non-stop with animation spin 1s, and make it iterate infinitely.",
      hint: "Keep it moving with <code>animation: spin 1s infinite</code>. The iteration count lives in the shorthand.",
      accept: [
        { "animation": "spin 1s infinite" },
        {
          "animation-name": "spin",
          "animation-duration": "1s",
          "animation-iteration-count": "infinite",
        },
      ],
      placeholder: "Write your CSS here...",
      multiLine: true,
      hover: false,
      concepts: ["animation", "iteration", "shorthand"],
      fx: null,
    },
    {
      id: 8,
      tier: "beginner",
      title: "On Repeat",
      instruction:
        "Send the star gently bobbing with a float animation over 3s, ease-in-out timing, and infinite repeats, all in one shorthand.",
      hint: "Compose it all at once: <code>animation: float 3s ease-in-out infinite</code>.",
      accept: [
        { "animation": "float 3s ease-in-out infinite" },
        {
          "animation-name": "float",
          "animation-duration": "3s",
          "animation-timing-function": "ease-in-out",
          "animation-iteration-count": "infinite",
        },
      ],
      placeholder: "Write your CSS here...",
      multiLine: true,
      hover: false,
      concepts: ["animation", "shorthand"],
      fx: null,
    },
    {
      id: 9,
      tier: "intermediate",
      title: "Late Arrival",
      instruction:
        "This one pops in late. Give the star a pop animation over 2s with ease-in-out timing, and make it wait 1s before starting using the animation-delay property.",
      hint: "Add the delay as its own line too: <code>animation: pop 2s ease-in-out</code> on one line and <code>animation-delay: 1s</code> on the next.",
      accept: [
        {
          "animation": "pop 2s ease-in-out",
          "animation-delay": "1s",
        },
      ],
      placeholder: "Write your CSS here...",
      multiLine: true,
      hover: false,
      concepts: ["animation-delay", "delay"],
      fx: null,
    },
    {
      id: 10,
      tier: "intermediate",
      title: "Zoom In, Zoom Out",
      instruction:
        "Make the star zoom back and forth with a pulse animation over 2s, ease-in-out timing, repeated infinitely, and the direction reversed on every other cycle with alternate.",
      hint: "Turning around each cycle is the <code>animation-direction</code> value <code>alternate</code>, inside the shorthand: <code>animation: pulse 2s ease-in-out infinite alternate</code>.",
      accept: [
        { "animation": "pulse 2s ease-in-out infinite alternate" },
        {
          "animation-name": "pulse",
          "animation-duration": "2s",
          "animation-timing-function": "ease-in-out",
          "animation-iteration-count": "infinite",
          "animation-direction": "alternate",
        },
      ],
      placeholder: "Write your CSS here...",
      multiLine: true,
      hover: false,
      concepts: ["animation-direction"],
      fx: null,
    },
    {
      id: 11,
      tier: "intermediate",
      title: "Hover Lift",
      instruction:
        "Lift the star when you hover it! Add a transition for transform (0.3s, ease), then a transform that raises it 8px. Then hover the star.",
      hint: "Two lines: <code>transition: transform 0.3s ease</code> and <code>transform: translateY(-8px)</code>. Hover the star to see it rise.",
      accept: [
        { "transition": "transform 0.3s ease", "transform": "translatey(-8px)" },
      ],
      placeholder: "Write your CSS here...",
      multiLine: true,
      hover: true,
      concepts: ["transition", "transform", "hover"],
      fx: null,
    },
    {
      id: 12,
      tier: "intermediate",
      title: "Grand Finale",
      instruction:
        "The grand finale! Hover the star. It should rise 8px and grow to 1.1x at once, with a 0.3s ease transition on transform.",
      hint: "Chain the transforms together: <code>transition: transform 0.3s ease</code> and <code>transform: translateY(-8px) scale(1.1)</code>. Then hover the star.",
      accept: [
        { "transition": "transform 0.3s ease", "transform": "translatey(-8px) scale(1.1)" },
      ],
      placeholder: "Write your CSS here...",
      multiLine: true,
      hover: true,
      concepts: ["transition", "transform", "hover"],
      fx: null,
      isFinal: true,
    },
  ];

  var STATE = {
    currentLevel: 0,
    score: 0,
    completed: {},
    solutions: {},
    fxTimer: null,
    effectTimer: null,
  };

  var DATA_VERSION = 1;

  function tierLabel(tier) {
    return TIER_LABELS[tier] || tier || "Beginner";
  }

  function pointsForLevel(level) {
    return POINTS[level.tier] || 8;
  }

  function isLevelUnlocked(index) {
    if (!LEVELS[index]) return false;
    if (STATE.completed[index]) return true;
    // Linear gating: level N opens once N-1 is solved (level 0 always open).
    if (index === 0) return true;
    return !!STATE.completed[index - 1];
  }

  function lockMessageFor(index) {
    if (!isLevelUnlocked(index)) {
      return "Solve Level " + index + " first to unlock Level " + (index + 1) + ".";
    }
    return "";
  }

  // Inject the fixed keyframe stylesheet once.
  function ensureKeyframes() {
    if (!$("arena-keyframes")) {
      var style = document.createElement("style");
      style.id = "arena-keyframes";
      style.textContent = KEYFRAMES_CSS;
      (document.head || document.documentElement).appendChild(style);
    }
  }

  function emitProgress() {
    if (typeof window !== "undefined" && typeof window.__onAnimationArenaProgress === "function") {
      window.__onAnimationArenaProgress({
        currentLevel: STATE.currentLevel,
        score: STATE.score,
        completed: STATE.completed,
        solutions: STATE.solutions,
        totalLevels: LEVELS.length,
        version: DATA_VERSION,
      });
    }
  }

  function publishState() {
    if (typeof window === "undefined") return;
    try {
      window.dispatchEvent(
        new CustomEvent("aaa-state", {
          detail: {
            currentLevel: STATE.currentLevel,
            score: STATE.score,
            completed: STATE.completed,
            totalLevels: LEVELS.length,
            version: DATA_VERSION,
          },
        })
      );
    } catch (e) { /* no-op */ }
  }

  function resumeGame(saved) {
    if (!saved) return;
    if (typeof saved.currentLevel === "number") {
      var cl = Math.floor(saved.currentLevel);
      if (cl >= 0 && cl < LEVELS.length) STATE.currentLevel = cl;
    }
    if (saved.completed && typeof saved.completed === "object") {
      var clean = {};
      for (var k in saved.completed) {
        if (saved.completed[k] && k >= 0 && k < LEVELS.length) clean[k] = true;
      }
      STATE.completed = clean;
      // Rebuild the score from the completed set (never trust a stored total),
      // so revisits and version changes always converge on the current points.
      STATE.score = 0;
      for (var sk in clean) STATE.score += pointsForLevel(LEVELS[sk]);
    }
    if (saved.solutions && typeof saved.solutions === "object") {
      var sols = {};
      for (var ik in saved.solutions) {
        var si = Number(ik);
        if (
          Number.isInteger(si) &&
          si >= 0 &&
          si < LEVELS.length &&
          typeof saved.solutions[ik] === "string"
        ) {
          sols[si] = saved.solutions[ik];
        }
      }
      STATE.solutions = sols;
    }
    while (STATE.currentLevel > 0 && !isLevelUnlocked(STATE.currentLevel)) {
      STATE.currentLevel--;
    }
    var s = $("score-display");
    if (s) s.textContent = "Score: " + STATE.score;
    renderLevel();
    publishState();
  }

  function $(id) { return document.getElementById(id); }
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function cleanCssText(text) {
    return String(text || "")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/\/\/[^\n]*/g, " ")
      .replace(/[{}]/g, " ")
      .replace(/#board\b/gi, " ");
  }

  function normValue(v) {
    var s = String(v || "").toLowerCase().trim();
    if (!s) return "";
    s = s.replace(/;+\s*$/, "").trim();
    s = s.replace(/\s+\(/g, "(").replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");
    s = s.replace(/\s*,\s*/g, ",");
    s = s.replace(/\s+/g, " ");
    s = s.replace(/(\d+(?:\.\d+)?)s\b/g, function (m, n) {
      return Math.round(parseFloat(n) * 1000) + "ms";
    });
    return s;
  }

  function parseCSS(text) {
    if (!text || !text.trim()) return [];
    var lines = cleanCssText(text).split("\n");
    var pairs = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      var parts = line.split(";");
      for (var q = 0; q < parts.length; q++) {
        var part = parts[q].trim();
        if (!part) continue;
        var colonIdx = part.indexOf(":");
        if (colonIdx === -1) {
          if (pairs.length) pairs[pairs.length - 1].value += " " + part;
          continue;
        }
        var prop = part.substring(0, colonIdx).trim().toLowerCase();
        var val = part.substring(colonIdx + 1);
        if (prop) pairs.push({ property: prop, value: val });
      }
    }
    for (var j = 0; j < pairs.length; j++) pairs[j].value = normValue(pairs[j].value);
    return pairs;
  }

  function checkCompletion(pairs) {
    var level = LEVELS[STATE.currentLevel];
    if (!level) return false;
    var userMap = {};
    for (var i = 0; i < pairs.length; i++) userMap[pairs[i].property] = pairs[i].value;
    for (var a = 0; a < level.accept.length; a++) {
      var combo = level.accept[a];
      var match = true;
      for (var p in combo) {
        if (Object.prototype.hasOwnProperty.call(combo, p)) {
          if (normValue(userMap[p]) !== normValue(combo[p])) { match = false; break; }
        }
      }
      if (match) return true;
    }
    return false;
  }

  function validateInput(pairs) {
    for (var i = 0; i < pairs.length; i++) {
      var p = pairs[i].property;
      if (VALID_PROPS.indexOf(p) === -1) {
        return "'" + p + "' isn't a CSS animation property. Try: transition, transform, animation, animation-delay, animation-direction, etc.";
      }
    }
    return null;
  }

  function getWrongHint(pairs) {
    var level = LEVELS[STATE.currentLevel];
    if (!level) return randomItem(WRONG_MSGS);
    var userMap = {};
    for (var i = 0; i < pairs.length; i++) userMap[pairs[i].property] = pairs[i].value;

    var expectedProps = [];
    var acceptedByProp = {};
    for (var a = 0; a < level.accept.length; a++) {
      var combo = level.accept[a];
      for (var p in combo) {
        if (Object.prototype.hasOwnProperty.call(combo, p)) {
          if (expectedProps.indexOf(p) === -1) expectedProps.push(p);
          if (!acceptedByProp[p]) acceptedByProp[p] = [];
          if (acceptedByProp[p].indexOf(normValue(combo[p])) === -1) acceptedByProp[p].push(normValue(combo[p]));
        }
      }
    }

    var wrongProps = [];
    var missingProps = [];
    for (var e = 0; e < expectedProps.length; e++) {
      var prop = expectedProps[e];
      var val = userMap[prop];
      if (val === undefined) missingProps.push(prop);
      else if (acceptedByProp[prop].indexOf(normValue(val)) === -1) wrongProps.push(prop);
    }
    if (wrongProps.length > 0) {
      return "Wrong value for " + wrongProps.join(", ") + ". Check the hint below!";
    }
    if (missingProps.length > 0) {
      return "Almost! You're still missing " + missingProps.join(", ") + ".";
    }
    return randomItem(WRONG_MSGS);
  }

  // Live preview: apply valid pairs to the stage. Hover levels never apply a
  // static transform; it is shown on hover only.
  function applyCSS(pairs) {
    var stage = $("arena-stage");
    if (!stage) return;
    var level = LEVELS[STATE.currentLevel];
    for (var i = 0; i < pairs.length; i++) {
      var prop = pairs[i].property;
      var val = pairs[i].value;
      if (VALID_PROPS.indexOf(prop) === -1) continue;
      if (level && level.hover && prop === "transform") continue;
      stage.style.setProperty(prop, val);
    }
  }

  function resetBoard() {
    var board = $("arena-board");
    if (!board) return;
    board.removeAttribute("style");
    board.style.height = "360px";
    board.style.width = "100%";
    board.style.position = "relative";
    board.style.overflow = "hidden";
    board.style.borderRadius = "0 0 1rem 1rem";
    board.style.display = "flex";
    board.style.alignItems = "center";
    board.style.justifyContent = "center";
    board.style.boxSizing = "border-box";

    var stage = $("arena-stage");
    if (stage) {
      stage.removeAttribute("style");
      stage.style.width = "130px";
      stage.style.height = "130px";
      stage.style.borderRadius = "24px";
      stage.style.display = "flex";
      stage.style.alignItems = "center";
      stage.style.justifyContent = "center";
      stage.style.fontSize = "60px";
      stage.style.position = "relative";
      stage.style.zIndex = "2";
      stage.style.boxShadow = "0 12px 32px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)";
      stage.style.border = "2px solid rgba(255,255,255,0.25)";
      stage.style.background = "#8b5cf6";
      stage.style.transition = "background-color 0.4s ease, opacity 0.6s ease-in-out, transform 0.3s ease, box-shadow 0.3s ease";
      stage.style.userSelect = "none";
      stage.style.cursor = "default";
    }
  }

  function renderBoard() {
    var board = $("arena-board");
    if (!board) return;
    var level = LEVELS[STATE.currentLevel];
    if (!level) return;

    board.innerHTML = "";

    var beamLeft = document.createElement("div");
    beamLeft.className = "arena-beam left";
    var beamRight = document.createElement("div");
    beamRight.className = "arena-beam right";
    var platform = document.createElement("div");
    platform.className = "arena-platform";
    var glow = document.createElement("div");
    glow.className = "arena-glow";
    var stage = document.createElement("div");
    stage.id = "arena-stage";
    stage.className = "arena-stage";
    var glyph = document.createElement("span");
    glyph.className = "arena-stage-glyph";
    glyph.textContent = "\u2726";
    stage.appendChild(glyph);

    board.appendChild(beamLeft);
    board.appendChild(beamRight);
    board.appendChild(platform);
    board.appendChild(glow);
    board.appendChild(stage);

    // Dashed goal ring for translate/scale levels.
    if (typeof level.goalX === "number") {
      var goal = document.createElement("div");
      goal.className = "arena-goal";
      goal.style.left = "calc(50% + " + level.goalX + "px)";
      goal.style.top = "50%";
      goal.textContent = "goal";
      board.appendChild(goal);
    }

    // Hover levels: bind enter/leave so the transform transition is visible.
    if (level.hover) {
      stage.addEventListener("mouseenter", onStageEnter);
      stage.addEventListener("mouseleave", onStageLeave);
    }
  }

  function onStageEnter() {
    var stage = $("arena-stage");
    if (!stage) return;
    var ta = $("css-editor");
    if (!ta) return;
    var pairs = parseCSS(ta.value);
    for (var i = 0; i < pairs.length; i++) {
      if (pairs[i].property === "transform") {
        stage.style.transform = pairs[i].value;
        return;
      }
    }
  }

  function onStageLeave() {
    var stage = $("arena-stage");
    if (stage) stage.style.transform = "";
  }

  // Per-level intro effect so the transition levels visibly demo what a
  // transition does (otherwise there is no state change for it to animate).
  function queueIntroFx(level) {
    var stage = $("arena-stage");
    if (!stage) return;
    clearTimeout(STATE.fxTimer);
    if (level.fx === "bgfade") {
      stage.style.background = "#d97706";
      STATE.fxTimer = setTimeout(function () {
        var s = $("arena-stage");
        if (s) s.style.background = "#8b5cf6";
      }, 350);
    } else if (level.fx === "opacitypulse") {
      STATE.fxTimer = setTimeout(function () {
        var s = $("arena-stage");
        if (s) s.style.opacity = "0.3";
        setTimeout(function () {
          var st2 = $("arena-stage");
          if (st2) st2.style.opacity = "1";
        }, 500);
      }, 400);
    }
  }

  function showToast(msg, isError) {
    var t = $("toast");
    if (!t) return;
    t.textContent = (isError ? "\u2715 " : "\u2713 ") + msg;
    t.className = "aaa-status-toast " + (isError ? "error" : "success");
    t.style.display = "flex";
    t.style.opacity = "1";
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.style.opacity = "0"; }, isError ? 4000 : 2500);
  }

  function hideToast() {
    var t = $("toast");
    if (t) { t.style.opacity = "0"; clearTimeout(t._timer); }
  }

  function showOverlay(title, sub, msg, btnText, action) {
    var o = $("overlay");
    if (!o) return;
    var t = qs(".aaa-complete-text", o);
    var s = qs(".aaa-complete-sub", o);
    var m = qs(".aaa-complete-msg", o);
    var b = qs(".overlay-btn", o);
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

  function renderSolvedNote() {
    var note = $("aaa-solved-note");
    if (!note) return;
    var done = !!STATE.completed[STATE.currentLevel];
    note.hidden = !done;
    if (done) {
      note.textContent = "Solved! Answers are saved - you can return to this level anytime.";
    } else {
      note.textContent = "";
    }
  }

  var CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  var X_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

  function renderResult(type, pointsOrMsg) {
    var r = $("aaa-result");
    if (!r) return;
    if (type === "pass") {
      r.className = "aaa-result pass";
      r.innerHTML =
        '<div class="aaa-result-icon">' + CHECK_SVG + '</div>' +
        '<div class="aaa-result-content">' +
        '<strong>Correct!</strong>' +
        '<span class="aaa-result-detail"><span class="aaa-result-xp">+' + pointsOrMsg + ' XP</span> · Saved to your profile</span>' +
        '</div>';
      r.style.display = "flex";
    } else if (type === "fail") {
      r.className = "aaa-result fail";
      r.innerHTML =
        '<div class="aaa-result-icon">' + X_SVG + '</div>' +
        '<div class="aaa-result-content">' +
        '<strong>Not quite yet</strong>' +
        '<span class="aaa-result-detail">' + pointsOrMsg + '</span>' +
        '</div>';
      r.style.display = "flex";
    } else {
      r.style.display = "none";
    }
  }

  function completeLevel(text) {
    if (STATE.completed[STATE.currentLevel]) return;
    var level = LEVELS[STATE.currentLevel];
    if (!level) return;
    STATE.completed[STATE.currentLevel] = true;
    STATE.solutions[STATE.currentLevel] = text;
    STATE.score += pointsForLevel(level);

    var s = $("score-display");
    if (s) s.textContent = "Score: " + STATE.score;

    var nb = $("next-btn");
    if (nb) { nb.disabled = false; nb.style.opacity = "1"; }
    var cb = $("check-btn");
    if (cb) cb.classList.add("ready");

    renderSolvedNote();
    renderProgress();
    emitProgress();
    publishState();
    renderResult("pass", pointsForLevel(level));

    showToast("\u2713 Correct! Watch the star move!", false);

    setTimeout(function () {
      var msg = "+" + pointsForLevel(level) + " XP \u00B7 Saved to your profile";
      if (level.isFinal) {
        showOverlay("Champion!", "You mastered every trick in the book.", msg, "See Your Results \u2B50", function () {
          nextLevel();
        });
      } else {
        showOverlay("Level Complete!", "Great job! You solved it!", msg, "Next Level \u2192", function () {
          nextLevel();
        });
      }
    }, 1200);
  }

  function nextLevel() {
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

  function nextHandler() {
    var nb = $("next-btn");
    if (nb && !nb.disabled) nextLevel();
  }

  function checkAnswer() {
    var ta = $("css-editor");
    if (!ta) return;
    var level = LEVELS[STATE.currentLevel];
    if (!level) {
      showToast("Level data not loaded yet. Reload the page if this persists.", true);
      return;
    }
    var text = ta.value || "";
    var pairs = parseCSS(text);

    if (!text.trim()) {
      renderResult("fail", "Write some CSS first!");
      showToast("Write some CSS first!", true);
      return;
    }
    if (pairs.length === 0) {
      renderResult("fail", "That isn't valid CSS. Write property: value pairs, one per line.");
      showToast("That isn't valid CSS. Write property: value pairs, one per line.", true);
      return;
    }
    var err = validateInput(pairs);
    if (err) { renderResult("fail", err); showToast(err, true); return; }

    // Preview the exact answer state before judging it.
    resetBoard();
    applyCSS(pairs);

    if (STATE.completed[STATE.currentLevel]) {
      renderResult("pass", pointsForLevel(level));
      showToast("\u2713 Already solved. +" + pointsForLevel(level) + " XP earned.", false);
      return;
    }

    if (checkCompletion(pairs)) {
      completeLevel(text);
    } else {
      var hint = getWrongHint(pairs);
      renderResult("fail", hint);
      showToast(hint, true);
    }
  }

  function handleInput() {
    var ta = $("css-editor");
    var editorHint = $("aaa-editor-hint");
    if (ta && editorHint) {
      editorHint.classList.toggle("has-value", ta.value.trim().length > 0);
    }
    if (!ta) return;
    var text = ta.value;
    var pairs = parseCSS(text);
    if (pairs.length === 0) {
      // Nothing to preview yet; clear the board so stale styles never linger.
      resetBoard();
      hideToast();
      return;
    }
    var err = validateInput(pairs);
    if (err) {
      resetBoard();
      showToast(err, true);
      return;
    }
    hideToast();
    resetBoard();
    applyCSS(pairs);
  }

  function handleReset() {
    var ta = $("css-editor");
    if (ta) ta.value = "";
    hideToast();
    clearEffectTimer();
    renderBoard();
    resetBoard();
    queueIntroFx(LEVELS[STATE.currentLevel]);
    var editorHint = $("aaa-editor-hint");
    if (editorHint) editorHint.classList.remove("has-value");
  }

  // Replays any CSS animation from scratch so Run always visibly restarts it
  // instead of freezing on the last painted frame.
  function replayAnimations(pairs) {
    var stage = $("arena-stage");
    if (!stage) return;
    var hasAnim = false;
    for (var i = 0; i < pairs.length; i++) {
      if (pairs[i].property.indexOf("animation") === 0) hasAnim = true;
    }
    if (!hasAnim) return;
    stage.style.animation = "none";
    void stage.offsetWidth; // force reflow so the animation restarts cleanly
    for (var j = 0; j < pairs.length; j++) {
      var p = pairs[j].property;
      if (VALID_PROPS.indexOf(p) !== -1 && p.indexOf("animation") === 0) {
        stage.style.setProperty(p, pairs[j].value);
      }
    }
  }

  // Hover levels skip transform while typing; Run simulates one hover so the
  // player sees exactly what their CSS will do before trying it themselves.
  function simulateHover(pairs) {
    var level = LEVELS[STATE.currentLevel];
    var stage = $("arena-stage");
    if (!stage || !level || !level.hover) return;
    var tf = null;
    for (var i = 0; i < pairs.length; i++) {
      if (pairs[i].property === "transform") tf = pairs[i].value;
    }
    if (!tf) return;
    stage.style.transform = tf;
    clearEffectTimer();
    STATE.effectTimer = setTimeout(function () {
      var s = $("arena-stage");
      if (s) s.style.transform = "";
    }, 1200);
  }

  function clearEffectTimer() {
    if (STATE.effectTimer) {
      clearTimeout(STATE.effectTimer);
      STATE.effectTimer = null;
    }
  }

  function handleRun() {
    var ta = $("css-editor");
    if (!ta) return;
    var level = LEVELS[STATE.currentLevel];
    if (!level) return;
    var text = ta.value || "";
    var pairs = parseCSS(text);

    if (!text.trim()) {
      resetBoard();
      hideToast();
      showToast("Write some CSS first, then Run to see it play!", true);
      return;
    }
    if (pairs.length === 0) {
      resetBoard();
      showToast("That isn't valid CSS; write property: value pairs, one per line.", true);
      return;
    }
    var err = validateInput(pairs);
    if (err) {
      resetBoard();
      showToast(err, true);
      return;
    }

    clearEffectTimer();
    resetBoard();
    applyCSS(pairs);
    replayAnimations(pairs);
    queueIntroFx(level);
    renderResult("none");

    if (level.hover) {
      simulateHover(pairs);
      showToast("\u25B6 Run: preview hover shown. Hover the robot yourself to try it!", false);
    } else {
      showToast("\u25B6 Run: watch the robot respond to your CSS!", false);
    }
  }

  function renderProgress() {
    var dots = $("progress-dots");
    if (!dots) return;
    dots.innerHTML = "";
    for (var i = 0; i < LEVELS.length; i++) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "aaa-progress-dot";
      btn.setAttribute("aria-label", "Level " + (i + 1));
      btn.title = "Level " + (i + 1);
      if (i === STATE.currentLevel) btn.classList.add("current");
      var isDone = !!STATE.completed[i];
      var locked = !isDone && !isLevelUnlocked(i);
      if (isDone) btn.classList.add("done");
      if (locked) btn.classList.add("locked");
      if (locked) btn.disabled = true;
      btn.textContent = isDone ? "\u2713" : String(i + 1);
      if (!locked) {
        btn.addEventListener("click", function () {
          if (i !== STATE.currentLevel) {
            gotoLevel(i);
            publishState();
          }
        });
      }
      dots.appendChild(btn);
    }
  }

  function renderHintArea(level, hintEl) {
    // Nudges stay hidden behind a "Show Hint" button. Reveals draw from the
    // shared daily budget (3 hints/day across ALL games) which the page
    // enforces server-side via /api/games/hints; the engine never unlocks
    // it directly.
    hintEl.innerHTML = "";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "aaa-hint-reveal";
    btn.textContent = "\uD83D\uDCA1 Show Hint";
    btn.onclick = function () {
      if (typeof window.__onAnimationArenaHintRequest === "function") {
        window.__onAnimationArenaHintRequest(STATE.currentLevel);
      }
    };
    hintEl.appendChild(btn);

    var left = document.createElement("span");
    left.className = "aaa-hint-left";
    left.id = "aaa-hint-left";
    var n =
      typeof window.__aaaHintLeft === "number" ? window.__aaaHintLeft : "-";
    left.textContent = "Hints left today: " + n;
    hintEl.appendChild(left);
  }

  function renderLevel() {
    var level = LEVELS[STATE.currentLevel];
    if (!level) return renderVictory();

    var titleEl = $("level-title");
    var numEl = $("level-number");
    var instrEl = $("level-instruction");
    var hintEl = $("level-hint");
    var diffEl = $("level-difficulty");
    var ta = $("css-editor");
    var nb = $("next-btn");
    var pb = $("prev-btn");
    var cb = $("check-btn");

    if (titleEl) titleEl.textContent = level.title;
    if (numEl) numEl.textContent = level.id;
    if (instrEl) instrEl.innerHTML = level.instruction;
    if (hintEl) renderHintArea(level, hintEl);
    if (diffEl) {
      diffEl.textContent = tierLabel(level.tier);
      diffEl.className = "aaa-level-difficulty " + level.tier;
    }
    if (ta) {
      // Show the saved passing answer on revisited completed levels.
      ta.value =
        STATE.completed[STATE.currentLevel] && STATE.solutions[STATE.currentLevel]
          ? STATE.solutions[STATE.currentLevel]
          : "";
      ta.placeholder = level.placeholder;
      ta.rows = level.multiLine ? 3 : 2;
      var editorHint = $("aaa-editor-hint");
      if (editorHint) {
        editorHint.classList.toggle("has-value", ta.value.trim().length > 0);
      }
    }
    if (pb) { pb.disabled = STATE.currentLevel === 0; pb.style.opacity = STATE.currentLevel === 0 ? "0.4" : "1"; }
    if (nb) {
      var done = !!STATE.completed[STATE.currentLevel];
      nb.disabled = !done;
      nb.style.opacity = done ? "1" : "0.4";
    }
    if (cb) {
      cb.classList.toggle("ready", !!STATE.completed[STATE.currentLevel]);
    }

    renderSolvedNote();
    renderProgress();
    renderResult("none");

    clearEffectTimer();
    renderBoard();
    resetBoard();
    queueIntroFx(level);

    // Re-apply whatever is typed (covers the completed-solution restore).
    if (ta && ta.value.trim()) {
      var pairs = parseCSS(ta.value);
      if (pairs.length > 0 && !validateInput(pairs)) {
        applyCSS(pairs);
      }
    }

    hideOverlay();
    hideToast();
  }

  function renderVictory() {
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
    if (i) i.textContent = "You completed all " + LEVELS.length + " levels and mastered CSS animations!";
    if (h) h.innerHTML = "You can now bring anything to life. Share your score with friends!";
    if (d) { d.textContent = "Complete"; d.className = "aaa-level-difficulty beginner"; }

    var board = $("arena-board");
    if (board) {
      board.innerHTML =
        '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;text-align:center">' +
        '<div style="font-size:4rem;margin-bottom:0.5rem">' + stars + '</div>' +
        '<div style="font-size:2rem;margin-bottom:0.5rem">\uD83C\uDFC6\u2728\uD83C\uDFC6</div>' +
        '<div style="font-size:1.2rem;font-weight:700;font-family:var(--font-display)">Animation Champion!</div>' +
        '<div style="font-size:0.85rem;color:hsl(var(--muted));margin-top:0.25rem">Score: ' + STATE.score + ' | Levels: ' + done + '/' + LEVELS.length + '</div>' +
        '</div>';
      board.style.display = "flex";
      board.style.alignItems = "center";
      board.style.justifyContent = "center";
    }

    var nb = $("next-btn");
    if (nb) { nb.disabled = true; nb.style.opacity = "0.4"; }
    var pb = $("prev-btn");
    if (pb) { pb.disabled = false; pb.style.opacity = "1"; }
    var cb = $("check-btn");
    if (cb) cb.classList.remove("ready");

    var note = $("aaa-solved-note");
    if (note) { note.hidden = true; note.textContent = ""; }
    renderResult("none");

    hideOverlay();
    hideToast();
    var ta = $("css-editor");
    if (ta) ta.value = "";
  }

  function initGame() {
    ensureKeyframes();
    var ta = $("css-editor");
    var pb = $("prev-btn");
    var nb = $("next-btn");
    var cb = $("check-btn");
    var runb = $("run-btn");

    if (ta) {
      ta.removeEventListener("input", handleInput);
      ta.addEventListener("input", handleInput);
    }
    if (pb) { pb.removeEventListener("click", prevLevel); pb.addEventListener("click", prevLevel); }
    if (nb) {
      nb.removeEventListener("click", nextHandler);
      nb.addEventListener("click", nextHandler);
    }
    if (cb) { cb.removeEventListener("click", checkAnswer); cb.addEventListener("click", checkAnswer); }
    if (runb) { runb.removeEventListener("click", handleRun); runb.addEventListener("click", handleRun); }
    var clr = $("clear-btn");
    if (clr) { clr.removeEventListener("click", handleReset); clr.addEventListener("click", handleReset); }

    STATE.currentLevel = 0;
    STATE.score = 0;
    STATE.completed = {};
    STATE.solutions = {};

    var s = $("score-display");
    if (s) s.textContent = "Score: 0";

    renderLevel();
  }

  if (typeof window !== "undefined") {
    window.__initAnimationArena = function () { initGame(); };
    window.__resumeAnimationArena = function (saved) { resumeGame(saved); };
    window.__getAnimationArenaState = function () {
      return {
        currentLevel: STATE.currentLevel,
        score: STATE.score,
        completed: STATE.completed,
        totalLevels: LEVELS.length,
        version: DATA_VERSION,
      };
    };
    window.__getAnimationArenaLevels = function () {
      return LEVELS.map(function (lv) {
        return {
          id: lv.id,
          tier: lv.tier,
          points: pointsForLevel(lv),
          isFinal: !!lv.isFinal,
          concepts: lv.concepts || [],
          title: lv.title,
          instruction: lv.instruction,
        };
      });
    };
    window.__goToAnimationArenaLevel = function (index) { gotoLevel(index); };
    window.__animationArenaCheck = function () { checkAnswer(); };
    window.__animationArenaShowHint = function (index) {
      var lvl = LEVELS[index | 0];
      if (!lvl || (index | 0) !== STATE.currentLevel) return;
      var hintEl = $("level-hint");
      if (!hintEl) return;
      hintEl.innerHTML = "";
      var spark = document.createElement("span");
      spark.textContent = "\uD83D\uDCA1 ";
      hintEl.appendChild(spark);
      var label = document.createElement("strong");
      label.textContent = "Hint: ";
      hintEl.appendChild(label);
      var hintSpan = document.createElement("span");
      hintSpan.innerHTML = lvl.hint;
      hintEl.appendChild(hintSpan);
    };
    window.__animationArenaSetHintLeft = function (n) {
      window.__aaaHintLeft = typeof n === "number" ? Math.max(0, n | 0) : 0;
      var el = $("aaa-hint-left");
      if (el) el.textContent = "Hints left today: " + window.__aaaHintLeft;
    };
    window.__animationArenaToast = function (msg, isError) { showToast(msg, isError); };
  }
})();