(function () {
  "use strict";

  var LEVELS = [
    {
      id: 1, title: "Turn On Flexbox!",
      instruction: "The animal cards are stacked vertically. Add Flexbox to line them up in a row!",
      hint: "The magic property is <code>display: flex</code>",
      difficulty: "beginner",
      accept: [{ display: "flex" }],
      placeholder: "display: flex",
      items: [
        { name: "Lion", icon: "\uD83E\uDD81", bg: "linear-gradient(135deg, #f97316, #ea580c)" },
        { name: "Tiger", icon: "\uD83D\uDC2F", bg: "linear-gradient(135deg, #f59e0b, #d97706)" },
        { name: "Bear", icon: "\uD83D\uDC3B", bg: "linear-gradient(135deg, #92400e, #78350f)" },
        { name: "Panda", icon: "\uD83D\uDC3C", bg: "linear-gradient(135deg, #6b7280, #4b5563)" },
        { name: "Fox", icon: "\uD83E\uDD8A", bg: "linear-gradient(135deg, #ea580c, #c2410c)" },
      ],
    },
    {
      id: 2, title: "Change Direction!",
      instruction: "Now reverse the row so the birds march from right to left.",
      hint: "Use <code>flex-direction</code> with a value that reverses the row.",
      difficulty: "beginner",
      accept: [{ "flex-direction": "row-reverse" }],
      placeholder: "flex-direction: row-reverse",
      items: [
        { name: "Crow", icon: "\uD83D\uDC26", bg: "linear-gradient(135deg, #1e293b, #334155)" },
        { name: "Duck", icon: "\uD83D\uDC24", bg: "linear-gradient(135deg, #facc15, #eab308)" },
        { name: "Goose", icon: "\uD83D\uDC25", bg: "linear-gradient(135deg, #fde047, #facc15)" },
        { name: "Chick", icon: "\uD83D\uDC23", bg: "linear-gradient(135deg, #fef08a, #fde047)" },
        { name: "Duck", icon: "\uD83E\uDD86", bg: "linear-gradient(135deg, #16a34a, #15803d)" },
      ],
    },
    {
      id: 3, title: "Vertical Stack!",
      instruction: "Make the pets flow top to bottom instead of left to right.",
      hint: "Change <code>flex-direction</code> so items flow downward.",
      difficulty: "beginner",
      accept: [{ "flex-direction": "column" }],
      placeholder: "flex-direction: column",
      items: [
        { name: "Dog", icon: "\uD83D\uDC36", bg: "linear-gradient(135deg, #92400e, #78350f)" },
        { name: "Cat", icon: "\uD83D\uDC31", bg: "linear-gradient(135deg, #f97316, #ea580c)" },
        { name: "Rabbit", icon: "\uD83D\uDC30", bg: "linear-gradient(135deg, #f472b6, #ec4899)" },
        { name: "Hamster", icon: "\uD83D\uDC39", bg: "linear-gradient(135deg, #fb923c, #f97316)" },
        { name: "Bison", icon: "\uD83E\uDD8F", bg: "linear-gradient(135deg, #d97706, #b45309)" },
      ],
    },
    {
      id: 4, title: "Let Them Wrap!",
      instruction: "Too many farm animals for one row! Make them wrap to the next line.",
      hint: "Use <code>flex-wrap</code> to allow wrapping.",
      difficulty: "beginner",
      accept: [{ "flex-wrap": "wrap" }, { "flex-wrap": "wrap-reverse" }],
      placeholder: "flex-wrap: wrap",
      items: [
        { name: "Dog", icon: "\uD83D\uDC36", bg: "linear-gradient(135deg, #92400e, #78350f)" },
        { name: "Horse", icon: "\uD83D\uDC34", bg: "linear-gradient(135deg, #78350f, #57534e)" },
        { name: "Sheep", icon: "\uD83D\uDC11", bg: "linear-gradient(135deg, #a8a29e, #78716c)" },
        { name: "Cow", icon: "\uD83D\uDC02", bg: "linear-gradient(135deg, #57534e, #44403c)" },
        { name: "Pig", icon: "\uD83D\uDC37", bg: "linear-gradient(135deg, #fda4af, #fb7185)" },
        { name: "Hen", icon: "\uD83D\uDC14", bg: "linear-gradient(135deg, #dc2626, #b91c1c)" },
      ],
    },
    {
      id: 5, title: "Push Right!",
      instruction: "Push ALL animals to the RIGHT side of the board.",
      hint: "<code>justify-content</code> controls horizontal alignment. Which value pushes to the end?",
      difficulty: "beginner",
      accept: [{ "justify-content": "flex-end" }],
      placeholder: "justify-content: flex-end",
      items: [
        { name: "Monkey", icon: "\uD83E\uDD85", bg: "linear-gradient(135deg, #78350f, #57534e)" },
        { name: "Dolphin", icon: "\uD83E\uDD89", bg: "linear-gradient(135deg, #0ea5e9, #0284c7)" },
        { name: "Parrot", icon: "\uD83E\uDD9C", bg: "linear-gradient(135deg, #16a34a, #15803d)" },
        { name: "Whale", icon: "\uD83E\uDDA6", bg: "linear-gradient(135deg, #2563eb, #1d4ed8)" },
        { name: "Flamingo", icon: "\uD83E\uDDA9", bg: "linear-gradient(135deg, #ec4899, #db2777)" },
      ],
    },
    {
      id: 6, title: "Center Them!",
      instruction: "Move the monkeys to the CENTER of the board.",
      hint: "There's a <code>justify-content</code> value specifically for centering.",
      difficulty: "beginner",
      accept: [{ "justify-content": "center" }],
      placeholder: "justify-content: center",
      items: [
        { name: "Ape", icon: "\uD83D\uDC35", bg: "linear-gradient(135deg, #d97706, #b45309)" },
        { name: "Monkey", icon: "\uD83D\uDE35", bg: "linear-gradient(135deg, #ca8a04, #a16207)" },
        { name: "Gorilla", icon: "\uD83D\uDE39", bg: "linear-gradient(135deg, #a16207, #854d0e)" },
        { name: "Chimp", icon: "\uD83D\uDE3A", bg: "linear-gradient(135deg, #854d0e, #713f12)" },
        { name: "Baboon", icon: "\uD83D\uDC12", bg: "linear-gradient(135deg, #713f12, #57534e)" },
      ],
    },
    {
      id: 7, title: "Space Around!",
      instruction: "Spread the sea creatures with EQUAL space around each one.",
      hint: "<code>justify-content</code> has a value that puts equal space on both sides of each item.",
      difficulty: "beginner",
      accept: [{ "justify-content": "space-around" }],
      placeholder: "justify-content: space-around",
      items: [
        { name: "Fish", icon: "\uD83D\uDC1F", bg: "linear-gradient(135deg, #3b82f6, #2563eb)" },
        { name: "Tropical", icon: "\uD83D\uDC20", bg: "linear-gradient(135deg, #06b6d4, #0891b2)" },
        { name: "Puffer", icon: "\uD83D\uDE21", bg: "linear-gradient(135deg, #f59e0b, #d97706)" },
        { name: "Shrimp", icon: "\uD83E\uDC88", bg: "linear-gradient(135deg, #6366f1, #4f46e5)" },
        { name: "Whale", icon: "\uD83D\uDC0B", bg: "linear-gradient(135deg, #0ea5e9, #0284c7)" },
      ],
    },
    {
      id: 8, title: "Space Between!",
      instruction: "First fish at the LEFT edge, last at the RIGHT. Equal space BETWEEN only.",
      hint: "<code>justify-content</code> has a value that puts space only between items.",
      difficulty: "beginner",
      accept: [{ "justify-content": "space-between" }],
      placeholder: "justify-content: space-between",
      items: [
        { name: "Fish", icon: "\uD83D\uDC1F", bg: "linear-gradient(135deg, #3b82f6, #2563eb)" },
        { name: "Tropical", icon: "\uD83D\uDC20", bg: "linear-gradient(135deg, #06b6d4, #0891b2)" },
        { name: "Puffer", icon: "\uD83D\uDE21", bg: "linear-gradient(135deg, #f59e0b, #d97706)" },
        { name: "Shrimp", icon: "\uD83E\uDC88", bg: "linear-gradient(135deg, #6366f1, #4f46e5)" },
        { name: "Whale", icon: "\uD83D\uDC0B", bg: "linear-gradient(135deg, #0ea5e9, #0284c7)" },
      ],
    },
    {
      id: 9, title: "Move Down!",
      instruction: "The reptiles are stuck at the TOP. Push them all the way DOWN!",
      hint: "<code>align-items</code> controls the vertical (cross) axis.",
      difficulty: "intermediate",
      accept: [{ "align-items": "flex-end" }],
      placeholder: "align-items: flex-end",
      items: [
        { name: "Croc", icon: "\uD83D\uDC0A", bg: "linear-gradient(135deg, #15803d, #166534)" },
        { name: "Turtle", icon: "\uD83D\uDC22", bg: "linear-gradient(135deg, #65a30d, #4d7c0f)" },
        { name: "Gecko", icon: "\uD83D\uDC38", bg: "linear-gradient(135deg, #4d7c0f, #365314)" },
        { name: "Snake", icon: "\uD83D\uDC0D", bg: "linear-gradient(135deg, #365314, #166534)" },
        { name: "Lizard", icon: "\uD83E\uDD95", bg: "linear-gradient(135deg, #166534, #14532d)" },
      ],
    },
    {
      id: 10, title: "Center Both Axes!",
      instruction: "Center the pets BOTH horizontally AND vertically \u2014 dead center!",
      hint: "You need <code>justify-content: center</code> AND <code>align-items: center</code> on separate lines.",
      difficulty: "intermediate",
      accept: [
        { "justify-content": "center", "align-items": "center" },
        { "align-items": "center", "justify-content": "center" },
      ],
      placeholder: "justify-content: center\nalign-items: center",
      multiLine: true,
      items: [
        { name: "Rabbit", icon: "\uD83D\uDC30", bg: "linear-gradient(135deg, #f472b6, #ec4899)" },
        { name: "Hare", icon: "\uD83D\uDC07", bg: "linear-gradient(135deg, #e879f9, #d946ef)" },
        { name: "Bison", icon: "\uD83E\uDD8F", bg: "linear-gradient(135deg, #d97706, #b45309)" },
        { name: "Hamster", icon: "\uD83D\uDC39", bg: "linear-gradient(135deg, #fb923c, #f97316)" },
        { name: "Bat", icon: "\uD83D\uDC3E", bg: "linear-gradient(135deg, #a78bfa, #8b5cf6)" },
      ],
    },
    {
      id: 11, title: "Bottom-Right Corner!",
      instruction: "Move all cats to the BOTTOM-RIGHT corner. Think about both axes!",
      hint: "Combine <code>justify-content</code> and <code>align-items</code> to reach a corner.",
      difficulty: "intermediate",
      accept: [
        { "justify-content": "flex-end", "align-items": "flex-end" },
        { "align-items": "flex-end", "justify-content": "flex-end" },
      ],
      placeholder: "justify-content: flex-end\nalign-items: flex-end",
      multiLine: true,
      items: [
        { name: "Cat", icon: "\uD83D\uDC31", bg: "linear-gradient(135deg, #f97316, #ea580c)" },
        { name: "Lynx", icon: "\uD83D\uDE3A", bg: "linear-gradient(135deg, #ea580c, #c2410c)" },
        { name: "Tiger", icon: "\uD83D\uDE38", bg: "linear-gradient(135deg, #c2410c, #9a3412)" },
        { name: "Cougar", icon: "\uD83D\uDE3B", bg: "linear-gradient(135deg, #dc2626, #b91c1c)" },
        { name: "Panther", icon: "\uD83D\uDC08", bg: "linear-gradient(135deg, #9a3412, #78350f)" },
      ],
    },
    {
      id: 12, title: "One Rebel!",
      instruction: "Keep the group at the TOP-LEFT. Make just the Lion go to the BOTTOM alone!",
      hint: "Use <code>align-self</code> to override the group on one child.",
      difficulty: "advanced",
      accept: [{ "align-self": "flex-end" }],
      placeholder: "align-self: flex-end",
      items: [
        { name: "Lion", icon: "\uD83E\uDD81", bg: "linear-gradient(135deg, #ea580c, #c2410c)", special: true },
        { name: "Elephant", icon: "\uD83D\uDC18", bg: "linear-gradient(135deg, #6b7280, #4b5563)" },
        { name: "Crane", icon: "\uD83E\uDD93", bg: "linear-gradient(135deg, #1e293b, #334155)" },
        { name: "Moose", icon: "\uD83E\uDD92", bg: "linear-gradient(135deg, #d97706, #b45309)" },
        { name: "Bison", icon: "\uD83E\uDD8F", bg: "linear-gradient(135deg, #78716c, #57534e)" },
      ],
    },
    {
      id: 13, title: "Reverse + End!",
      instruction: "Reverse the direction AND push them to the far end. Two properties!",
      hint: "Use <code>flex-direction: row-reverse</code> with <code>justify-content: flex-end</code>.",
      difficulty: "advanced",
      accept: [
        { "flex-direction": "row-reverse", "justify-content": "flex-end" },
        { "justify-content": "flex-end", "flex-direction": "row-reverse" },
      ],
      placeholder: "flex-direction: row-reverse\njustify-content: flex-end",
      multiLine: true,
      items: [
        { name: "Wolf", icon: "\uD83D\uDC3A", bg: "linear-gradient(135deg, #475569, #334155)" },
        { name: "Fox", icon: "\uD83E\uDD8A", bg: "linear-gradient(135deg, #ea580c, #c2410c)" },
        { name: "Bull", icon: "\uD83D\uDC17", bg: "linear-gradient(135deg, #78350f, #57534e)" },
        { name: "Deer", icon: "\uD83E\uDD8C", bg: "linear-gradient(135deg, #a16207, #854d0e)" },
        { name: "Boar", icon: "\uD83E\uDD9D", bg: "linear-gradient(135deg, #57534e, #44403c)" },
      ],
    },
    {
      id: 14, title: "Add Gap!",
      instruction: "Give each animal breathing room. Add space BETWEEN them using gap!",
      hint: "The <code>gap</code> property adds space between flex items.",
      difficulty: "advanced",
      accept: [
        { gap: "20px" }, { gap: "2rem" }, { gap: "30px" },
        { gap: "40px" }, { gap: "50px" }, { gap: "2.5rem" },
      ],
      placeholder: "gap: 20px",
      items: [
        { name: "Unicorn", icon: "\uD83E\uDD84", bg: "linear-gradient(135deg, #a855f7, #9333ea)" },
        { name: "Dragon", icon: "\uD83D\uDC32", bg: "linear-gradient(135deg, #16a34a, #15803d)" },
        { name: "Monkey", icon: "\uD83E\uDD85", bg: "linear-gradient(135deg, #ca8a04, #a16207)" },
        { name: "Wolf", icon: "\uD83D\uDC3A", bg: "linear-gradient(135deg, #64748b, #475569)" },
        { name: "Shrimp", icon: "\uD83E\uDC88", bg: "linear-gradient(135deg, #0284c7, #0369a1)" },
      ],
    },
    {
      id: 15, title: "Grand Finale!",
      instruction: "The ultimate combo! Wrap, center horizontally AND vertically. A perfect centered grid!",
      hint: "Use <code>justify-content: center</code>, <code>align-content: center</code>, and <code>flex-wrap: wrap</code>.",
      difficulty: "advanced",
      accept: [
        { "justify-content": "center", "align-content": "center", "flex-wrap": "wrap" },
        { "justify-content": "center", "flex-wrap": "wrap", "align-content": "center" },
        { "align-content": "center", "justify-content": "center", "flex-wrap": "wrap" },
        { "align-content": "center", "flex-wrap": "wrap", "justify-content": "center" },
        { "flex-wrap": "wrap", "justify-content": "center", "align-content": "center" },
        { "flex-wrap": "wrap", "align-content": "center", "justify-content": "center" },
      ],
      placeholder: "justify-content: center\nalign-content: center\nflex-wrap: wrap",
      multiLine: true,
      items: [
        { name: "Unicorn", icon: "\uD83E\uDD84", bg: "linear-gradient(135deg, #a855f7, #9333ea)" },
        { name: "Dragon", icon: "\uD83D\uDC32", bg: "linear-gradient(135deg, #16a34a, #15803d)" },
        { name: "Monkey", icon: "\uD83E\uDD85", bg: "linear-gradient(135deg, #ca8a04, #a16207)" },
        { name: "Wolf", icon: "\uD83D\uDC3A", bg: "linear-gradient(135deg, #64748b, #475569)" },
        { name: "Shrimp", icon: "\uD83E\uDC88", bg: "linear-gradient(135deg, #0284c7, #0369a1)" },
        { name: "Lion", icon: "\uD83E\uDD81", bg: "linear-gradient(135deg, #ea580c, #c2410c)" },
      ],
    },
  ];

  var VALID_PROPS = [
    "display", "flex-direction", "flex-wrap", "justify-content",
    "align-items", "align-self", "align-content", "gap",
  ];

  var VALID_VALUES = {
    display: ["flex", "inline-flex"],
    "flex-direction": ["row", "row-reverse", "column", "column-reverse"],
    "flex-wrap": ["nowrap", "wrap", "wrap-reverse"],
    "justify-content": ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"],
    "align-items": ["flex-start", "flex-end", "center", "stretch", "baseline"],
    "align-self": ["auto", "flex-start", "flex-end", "center", "stretch", "baseline"],
    "align-content": ["flex-start", "flex-end", "center", "stretch", "space-between", "space-around"],
  };

  var SUCCESS_MSGS = [
    "That's exactly right! You're getting the hang of this!",
    "Perfect! See how the animals moved? That's CSS magic!",
    "Nailed it! You really understand this concept.",
    "Spot on! The animals love their new spot.",
    "Great work! You're becoming a CSS pro!",
    "That's it! Flexbox does exactly what you tell it.",
    "Wonderful! Keep this up and you'll master CSS in no time!",
    "Exactly right! See? CSS isn't so scary after all.",
    "You got it! Each property unlocks new layout powers.",
    "Beautiful! The animals are exactly where they should be!",
  ];

  var WRONG_MSGS = [
    "Not quite right! The animals aren't where they should be yet. Check the hint.",
    "Hmm, that code doesn't solve this level. Check the hint and try again.",
    "Almost! That CSS is valid, but it's wrong for this task. Check the hint.",
    "Nope, wrong code! Figure out where the animals need to go, then fix it.",
    "Not yet! Look at the hint and adjust the code until the board matches.",
  ];

  var STATE = { currentLevel: 0, score: 0, completed: {} };

  var POINTS = { beginner: 5, intermediate: 8, advanced: 9 };

  function pointsForLevel(level) {
    return POINTS[level.difficulty] || 5;
  }

  function emitProgress() {
    if (typeof window !== "undefined" && typeof window.__onFlexboxZooProgress === "function") {
      window.__onFlexboxZooProgress({
        currentLevel: STATE.currentLevel,
        score: STATE.score,
        completed: STATE.completed,
        totalLevels: LEVELS.length,
      });
    }
  }

  function resumeGame(saved) {
    if (!saved) return;
    if (typeof saved.currentLevel === "number" && saved.currentLevel >= 0 && saved.currentLevel < LEVELS.length) {
      STATE.currentLevel = Math.floor(saved.currentLevel);
    }
    if (typeof saved.score === "number") STATE.score = saved.score;
    if (saved.completed && typeof saved.completed === "object") STATE.completed = saved.completed;
    var s = $("score-display");
    if (s) s.textContent = "Score: " + STATE.score;
    renderLevel();
  }

  function $(id) { return document.getElementById(id); }
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function parseCSS(text) {
    if (!text || !text.trim()) return [];
    var lines = text.split("\n");
    var pairs = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim().replace(/;+$/, "").trim();
      if (!line) continue;
      var colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      var prop = line.substring(0, colonIdx).trim().toLowerCase();
      var val = line.substring(colonIdx + 1).trim().toLowerCase().replace(/;+$/, "").trim();
      if (prop && val) pairs.push({ property: prop, value: val });
    }
    return pairs;
  }

  function checkCompletion(pairs) {
    var level = LEVELS[STATE.currentLevel];
    if (!level) return false;
    var userMap = {};
    for (var i = 0; i < pairs.length; i++) userMap[pairs[i].property] = pairs[i].value;
    for (var a = 0; a < level.accept.length; a++) {
      var combo = level.accept[a];
      var keys = Object.keys(combo);
      var match = true;
      for (var k = 0; k < keys.length; k++) {
        if (userMap[keys[k]] !== combo[keys[k]]) { match = false; break; }
      }
      if (match) return true;
    }
    return false;
  }

  function validateInput(pairs) {
    for (var i = 0; i < pairs.length; i++) {
      var p = pairs[i].property;
      var v = pairs[i].value;
      if (VALID_PROPS.indexOf(p) === -1) {
        return "'" + p + "' isn't a flexbox property. Try: display, flex-direction, justify-content, align-items, gap.";
      }
      var allowed = VALID_VALUES[p];
      if (allowed && allowed.indexOf(v) === -1) {
        var hints = {
          display: "Try: flex",
          "flex-direction": "Try: row, row-reverse, column, column-reverse",
          "flex-wrap": "Try: wrap, nowrap, wrap-reverse",
          "justify-content": "Try: flex-end, center, space-between, space-around",
          "align-items": "Try: flex-end, center, stretch",
          "align-self": "Try: flex-end, center, auto",
          "align-content": "Try: center, flex-end, space-between",
          gap: "Try: 20px or 2rem",
        };
        return "'" + v + "' isn't right for " + p + ". " + (hints[p] || "Check the hint!");
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
      var keys = Object.keys(level.accept[a]);
      for (var k = 0; k < keys.length; k++) {
        var key = keys[k];
        if (expectedProps.indexOf(key) === -1) expectedProps.push(key);
        if (!acceptedByProp[key]) acceptedByProp[key] = [];
        if (acceptedByProp[key].indexOf(level.accept[a][key]) === -1) acceptedByProp[key].push(level.accept[a][key]);
      }
    }
    var wrongProps = [];
    var missingProps = [];
    for (var e = 0; e < expectedProps.length; e++) {
      var prop = expectedProps[e];
      var val = userMap[prop];
      if (val === undefined) missingProps.push(prop);
      else if (acceptedByProp[prop].indexOf(val) === -1) wrongProps.push(prop);
    }
    if (wrongProps.length > 0) {
      return "Wrong value for " + wrongProps.join(", ") + ". Check the hint below!";
    }
    if (missingProps.length > 0) {
      return "Almost! You're still missing " + missingProps.join(", ") + ".";
    }
    return randomItem(WRONG_MSGS);
  }

  function applyCSS(pairs) {
    var board = $("zoo-board");
    if (!board) return;
    for (var i = 0; i < pairs.length; i++) {
      if (VALID_PROPS.indexOf(pairs[i].property) !== -1) {
        board.style.setProperty(pairs[i].property, pairs[i].value);
      }
    }
  }

  function resetBoard() {
    var board = $("zoo-board");
    if (!board) return;
    board.removeAttribute("style");
    board.style.display = "block";
    board.style.padding = "16px";
    board.style.gap = "12px";
    board.style.overflow = "hidden";
    board.style.height = "360px";
    board.style.width = "100%";
    board.style.boxSizing = "border-box";
    board.style.position = "relative";
    board.style.borderRadius = "0 0 1rem 1rem";
  }

  function renderBoard() {
    var board = $("zoo-board");
    if (!board) return;
    board.innerHTML = "";
    var level = LEVELS[STATE.currentLevel];
    if (!level) return;

    for (var a = 0; a < level.items.length; a++) {
      var item = level.items[a];
      var el = document.createElement("div");
      el.className = "zoo-item";
      if (item.special) el.className += " zoo-item-special";
      el.id = "item-" + a;

      el.innerHTML =
        '<div class="zoo-item-icon">' + item.icon + '</div>' +
        '<div class="zoo-item-name">' + item.name + '</div>';

      el.style.background = item.bg;
      el.style.width = "80px";
      el.style.height = "90px";
      el.style.borderRadius = "14px";
      el.style.display = "flex";
      el.style.flexDirection = "column";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.gap = "4px";
      el.style.flexShrink = "0";
      el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)";
      el.style.border = "2px solid rgba(255,255,255,0.2)";
      el.style.transition = "all 0.4s cubic-bezier(0.22,1,0.36,1)";
      el.style.userSelect = "none";
      el.style.cursor = "default";
      el.style.position = "relative";
      el.style.zIndex = "2";

      board.appendChild(el);
    }
  }

  function showToast(msg, isError) {
    var t = $("toast");
    if (!t) return;
    t.textContent = (isError ? "\u2715 " : "\u2713 ") + msg;
    t.className = "zoo-status-toast " + (isError ? "error" : "success");
    t.style.display = "flex";
    t.style.opacity = "1";
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.style.opacity = "0"; }, isError ? 4000 : 2500);
  }

  function hideToast() {
    var t = $("toast");
    if (t) { t.style.opacity = "0"; clearTimeout(t._timer); }
  }

  function showOverlay(title, msg, btnText, action) {
    var o = $("overlay");
    if (!o) return;
    var t = qs(".zoo-complete-text", o);
    var m = qs(".zoo-complete-msg", o);
    var b = qs(".overlay-btn", o);
    if (t) t.textContent = title;
    if (m) m.textContent = msg;
    if (b) { b.textContent = btnText; b.onclick = action; }
    o.style.display = "flex";
  }

  function hideOverlay() {
    var o = $("overlay");
    if (o) o.style.display = "none";
  }

  function completeLevel() {
    if (STATE.completed[STATE.currentLevel]) return;
    STATE.completed[STATE.currentLevel] = true;
    STATE.score += pointsForLevel(LEVELS[STATE.currentLevel]);

    var s = $("score-display");
    if (s) s.textContent = "Score: " + STATE.score;

    var nb = $("next-btn");
    if (nb) { nb.disabled = false; nb.style.opacity = "1"; }

    emitProgress();

    showToast("\u2713 Correct! See how the animals moved?", false);

    setTimeout(function () {
      showOverlay("Level Complete!", randomItem(SUCCESS_MSGS), "Next Level \u2192", function () {
        nextLevel();
      });
    }, 1800);
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

    if (titleEl) titleEl.textContent = level.title;
    if (numEl) numEl.textContent = level.id;
    if (instrEl) instrEl.textContent = level.instruction;
    if (hintEl) hintEl.innerHTML = level.hint;
    if (diffEl) {
      diffEl.textContent = level.difficulty.charAt(0).toUpperCase() + level.difficulty.slice(1);
      diffEl.className = "zoo-level-difficulty " + level.difficulty;
    }
    if (ta) {
      ta.value = "";
      ta.placeholder = level.placeholder;
      ta.rows = level.multiLine ? 3 : 2;
    }
    if (pb) { pb.disabled = STATE.currentLevel === 0; pb.style.opacity = STATE.currentLevel === 0 ? "0.4" : "1"; }
    if (nb) {
      var done = STATE.completed[STATE.currentLevel];
      nb.disabled = !done;
      nb.style.opacity = done ? "1" : "0.4";
    }

    renderBoard();
    resetBoard();
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
    if (i) i.textContent = "You completed all " + LEVELS.length + " levels and learned CSS Flexbox!";
    if (h) h.innerHTML = "You can now position elements like a pro. Share your score with friends!";
    if (d) { d.textContent = "Complete"; d.className = "zoo-level-difficulty beginner"; }

    var board = $("zoo-board");
    if (board) {
      board.innerHTML =
        '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;text-align:center">' +
        '<div style="font-size:4rem;margin-bottom:0.5rem">' + stars + '</div>' +
        '<div style="font-size:2rem;margin-bottom:0.5rem">\uD83C\uDF89\uD83E\uDD81\uD83C\uDF89</div>' +
        '<div style="font-size:1.2rem;font-weight:700;font-family:var(--font-display)">Zoo Master!</div>' +
        '<div style="font-size:0.85rem;color:hsl(var(--muted));margin-top:0.25rem">Score: ' + STATE.score + ' | Levels: ' + done + '/' + LEVELS.length + '</div>' +
        '</div>';
      board.style.display = "flex";
      board.style.alignItems = "center";
      board.style.justifyContent = "center";
    }

    hideOverlay();
    var ta = $("css-editor");
    if (ta) ta.value = "";
    var nb = $("next-btn");
    if (nb) { nb.disabled = true; nb.style.opacity = "0.4"; }
    var pb = $("prev-btn");
    if (pb) { pb.disabled = false; pb.style.opacity = "1"; }
  }

  function handleInput() {
    var ta = $("css-editor");
    if (!ta) return;
    var text = ta.value;
    var pairs = parseCSS(text);
    var board = $("zoo-board");
    if (!board) return;

    resetBoard();
    if (STATE.currentLevel === 0) board.style.display = "block";
    applyCSS(pairs);

    if (checkCompletion(pairs)) {
      completeLevel();
      return;
    }

    if (pairs.length > 0) {
      var err = validateInput(pairs);
      if (err) showToast(err, true);
      else showToast(getWrongHint(pairs), true);
    } else {
      hideToast();
    }
  }

  function handleReset() {
    var ta = $("css-editor");
    if (ta) ta.value = "";
    hideToast();
    renderBoard();
    resetBoard();
    if (STATE.currentLevel === 0) {
      var board = $("zoo-board");
      if (board) board.style.display = "block";
    }
  }

  function initGame() {
    var ta = $("css-editor");
    var pb = $("prev-btn");
    var nb = $("next-btn");
    var rb = $("reset-btn");

    if (ta) { ta.removeEventListener("input", handleInput); ta.addEventListener("input", handleInput); }
    if (pb) { pb.removeEventListener("click", prevLevel); pb.addEventListener("click", prevLevel); }
    if (nb) {
      var nextHandler = function () { if (!nb.disabled) nextLevel(); };
      nb.removeEventListener("click", nextHandler);
      nb.addEventListener("click", nextHandler);
    }
    if (rb) { rb.removeEventListener("click", handleReset); rb.addEventListener("click", handleReset); }

    STATE.currentLevel = 0;
    STATE.score = 0;
    STATE.completed = {};

    var s = $("score-display");
    if (s) s.textContent = "Score: 0";

    renderLevel();
  }

  if (typeof window !== "undefined") {
    window.__initFlexboxZoo = function () { initGame(); };
    window.__resumeFlexboxZoo = function (saved) { resumeGame(saved); };
  }
})();
