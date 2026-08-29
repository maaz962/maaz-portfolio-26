(function () {
  "use strict";

  var LEVELS = [
    {
      id: 1, title: "Turn On Grid!",
      instruction: "The building blocks are stacked vertically. Activate CSS Grid to arrange them!",
      hint: "The magic property is <code>display: grid</code>",
      difficulty: "beginner",
      accept: [{ "display": "grid" }],
      placeholder: "display: grid",
      columns: 2, rows: 2,
      items: [
        { label: "Header", color: "linear-gradient(135deg, #6366f1, #4f46e5)" },
        { label: "Nav", color: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
        { label: "Main", color: "linear-gradient(135deg, #a78bfa, #8b5cf6)" },
        { label: "Footer", color: "linear-gradient(135deg, #c4b5fd, #a78bfa)" },
      ],
    },
    {
      id: 2, title: "Three Columns!",
      instruction: "Create 3 equal columns for your city blocks.",
      hint: "Use <code>grid-template-columns</code> with equal fractions.",
      difficulty: "beginner",
      accept: [
        { "grid-template-columns": "1fr 1fr 1fr" },
        { "grid-template-columns": "1fr  1fr  1fr" },
      ],
      placeholder: "grid-template-columns: 1fr 1fr 1fr",
      columns: 3, rows: 2,
      items: [
        { label: "Shop", color: "linear-gradient(135deg, #f97316, #ea580c)" },
        { label: "Park", color: "linear-gradient(135deg, #22c55e, #16a34a)" },
        { label: "Cafe", color: "linear-gradient(135deg, #eab308, #ca8a04)" },
        { label: "Bank", color: "linear-gradient(135deg, #3b82f6, #2563eb)" },
        { label: "Home", color: "linear-gradient(135deg, #ef4444, #dc2626)" },
        { label: "School", color: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
      ],
    },
    {
      id: 3, title: "Fixed + Fluid!",
      instruction: "Make the first column 150px wide and let the second fill the rest.",
      hint: "Mix a fixed pixel value with <code>1fr</code> for the remaining space.",
      difficulty: "beginner",
      accept: [
        { "grid-template-columns": "150px 1fr" },
      ],
      placeholder: "grid-template-columns: 150px 1fr",
      columns: 2, rows: 2,
      items: [
        { label: "Sidebar", color: "linear-gradient(135deg, #0ea5e9, #0284c7)" },
        { label: "Content", color: "linear-gradient(135deg, #06b6d4, #0891b2)" },
        { label: "Widget", color: "linear-gradient(135deg, #14b8a6, #0d9488)" },
        { label: "Footer", color: "linear-gradient(135deg, #10b981, #059669)" },
      ],
    },
    {
      id: 4, title: "Repeat Mode!",
      instruction: "Create 4 equal columns using the repeat function.",
      hint: "Use <code>repeat(4, 1fr)</code> to duplicate a track.",
      difficulty: "beginner",
      accept: [
        { "grid-template-columns": "repeat(4,1fr)" },
        { "grid-template-columns": "repeat(4, 1fr)" },
        { "grid-template-columns": "repeat(4,1 fr)" },
        { "grid-template-columns": "repeat(4, 1 fr)" },
      ],
      placeholder: "grid-template-columns: repeat(4, 1fr)",
      columns: 4, rows: 2,
      items: [
        { label: "A", color: "linear-gradient(135deg, #f43f5e, #e11d48)" },
        { label: "B", color: "linear-gradient(135deg, #f97316, #ea580c)" },
        { label: "C", color: "linear-gradient(135deg, #eab308, #ca8a04)" },
        { label: "D", color: "linear-gradient(135deg, #22c55e, #16a34a)" },
        { label: "E", color: "linear-gradient(135deg, #3b82f6, #2563eb)" },
        { label: "F", color: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
        { label: "G", color: "linear-gradient(135deg, #ec4899, #db2777)" },
        { label: "H", color: "linear-gradient(135deg, #14b8a6, #0d9488)" },
      ],
    },
    {
      id: 5, title: "Add Gap!",
      instruction: "Add 20px space between all grid items.",
      hint: "The <code>gap</code> property adds space between rows and columns.",
      difficulty: "beginner",
      accept: [
        { gap: "20px" }, { gap: "2rem" }, { gap: "30px" }, { gap: "15px" },
      ],
      placeholder: "gap: 20px",
      columns: 3, rows: 2,
      items: [
        { label: "Bed", color: "linear-gradient(135deg, #6366f1, #4f46e5)" },
        { label: "Desk", color: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
        { label: "Lamp", color: "linear-gradient(135deg, #a78bfa, #8b5cf6)" },
        { label: "Rug", color: "linear-gradient(135deg, #c4b5fd, #a78bfa)" },
        { label: "Plant", color: "linear-gradient(135deg, #22c55e, #16a34a)" },
        { label: "Clock", color: "linear-gradient(135deg, #eab308, #ca8a04)" },
      ],
    },
    {
      id: 6, title: "Span Columns!",
      instruction: "Make the first item span across 2 columns.",
      hint: "Use <code>grid-column</code> with <code>span 2</code> on the first item.",
      difficulty: "intermediate",
      accept: [
        { "grid-column": "span 2" },
        { "grid-column": "span  2" },
      ],
      placeholder: "grid-column: span 2",
      columns: 3, rows: 2, itemTarget: 0,
      items: [
        { label: "Banner", color: "linear-gradient(135deg, #f43f5e, #e11d48)" },
        { label: "Nav", color: "linear-gradient(135deg, #fb923c, #f97316)" },
        { label: "Action", color: "linear-gradient(135deg, #fbbf24, #f59e0b)" },
        { label: "Card", color: "linear-gradient(135deg, #34d399, #10b981)" },
        { label: "Card", color: "linear-gradient(135deg, #60a5fa, #3b82f6)" },
        { label: "Card", color: "linear-gradient(135deg, #a78bfa, #8b5cf6)" },
      ],
    },
    {
      id: 7, title: "Span Rows!",
      instruction: "Make the sidebar span across 2 rows.",
      hint: "Use <code>grid-row</code> with <code>span 2</code>.",
      difficulty: "intermediate",
      accept: [
        { "grid-row": "span 2" },
        { "grid-row": "span  2" },
      ],
      placeholder: "grid-row: span 2",
      columns: 3, rows: 2, itemTarget: 0,
      items: [
        { label: "Sidebar", color: "linear-gradient(135deg, #f97316, #ea580c)" },
        { label: "Top", color: "linear-gradient(135deg, #22c55e, #16a34a)" },
        { label: "Top", color: "linear-gradient(135deg, #22c55e, #16a34a)" },
        { label: "Bottom", color: "linear-gradient(135deg, #0ea5e9, #0284c7)" },
        { label: "Bottom", color: "linear-gradient(135deg, #0ea5e9, #0284c7)" },
      ],
    },
    {
      id: 8, title: "Column Gap!",
      instruction: "Create 3 columns and add 25px gap between them.",
      hint: "Use <code>grid-template-columns</code> and <code>column-gap</code> together.",
      difficulty: "intermediate",
      accept: [
        { "grid-template-columns": "1fr 1fr 1fr", "column-gap": "25px" },
        { "grid-template-columns": "1fr 1fr 1fr", "column-gap": "25px " },
        { "grid-template-columns": "1fr  1fr  1fr", "column-gap": "25px" },
      ],
      placeholder: "grid-template-columns: 1fr 1fr 1fr\ncolumn-gap: 25px",
      multiLine: true,
      columns: 3, rows: 2,
      items: [
        { label: "Red", color: "linear-gradient(135deg, #ef4444, #dc2626)" },
        { label: "Green", color: "linear-gradient(135deg, #22c55e, #16a34a)" },
        { label: "Blue", color: "linear-gradient(135deg, #3b82f6, #2563eb)" },
        { label: "Yellow", color: "linear-gradient(135deg, #eab308, #ca8a04)" },
        { label: "Purple", color: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
        { label: "Pink", color: "linear-gradient(135deg, #ec4899, #db2777)" },
      ],
    },
    {
      id: 9, title: "Center Items!",
      instruction: "Center the content inside each grid cell both ways.",
      hint: "Use <code>justify-items</code> and <code>align-items</code> with <code>center</code>.",
      difficulty: "intermediate",
      accept: [
        { "justify-items": "center", "align-items": "center" },
        { "align-items": "center", "justify-items": "center" },
      ],
      placeholder: "justify-items: center\nalign-items: center",
      multiLine: true,
      columns: 3, rows: 2,
      items: [
        { label: "X", color: "linear-gradient(135deg, #f43f5e, #e11d48)" },
        { label: "O", color: "linear-gradient(135deg, #3b82f6, #2563eb)" },
        { label: "X", color: "linear-gradient(135deg, #f43f5e, #e11d48)" },
        { label: "O", color: "linear-gradient(135deg, #3b82f6, #2563eb)" },
        { label: "X", color: "linear-gradient(135deg, #f43f5e, #e11d48)" },
        { label: "O", color: "linear-gradient(135deg, #3b82f6, #2563eb)" },
      ],
    },
    {
      id: 10, title: "Center the Grid!",
      instruction: "Center the entire grid horizontally inside its container.",
      hint: "Use <code>justify-content: center</code> to center the grid tracks.",
      difficulty: "intermediate",
      accept: [{ "justify-content": "center" }],
      placeholder: "justify-content: center",
      columns: 2, rows: 2,
      items: [
        { label: "A", color: "linear-gradient(135deg, #14b8a6, #0d9488)" },
        { label: "B", color: "linear-gradient(135deg, #06b6d4, #0891b2)" },
        { label: "C", color: "linear-gradient(135deg, #0ea5e9, #0284c7)" },
        { label: "D", color: "linear-gradient(135deg, #3b82f6, #2563eb)" },
      ],
    },
    {
      id: 11, title: "Dense Packing!",
      instruction: "Enable dense auto-flow so items fill gaps automatically.",
      hint: "Use <code>grid-auto-flow: dense</code> to fill empty spaces.",
      difficulty: "advanced",
      accept: [{ "grid-auto-flow": "dense" }],
      placeholder: "grid-auto-flow: dense",
      columns: 3, rows: 2,
      items: [
        { label: "Wide", color: "linear-gradient(135deg, #f43f5e, #e11d48)", span: 2 },
        { label: "S", color: "linear-gradient(135deg, #f97316, #ea580c)" },
        { label: "S", color: "linear-gradient(135deg, #22c55e, #16a34a)" },
        { label: "S", color: "linear-gradient(135deg, #3b82f6, #2563eb)" },
        { label: "Tall", color: "linear-gradient(135deg, #8b5cf6, #7c3aed)", rowSpan: 2 },
      ],
    },
    {
      id: 12, title: "Grid Areas!",
      instruction: "Use grid-template-areas to create: header spans full, sidebar left, main right.",
      hint: "Define areas with <code>grid-template-areas</code> using quoted names.",
      difficulty: "advanced",
      accept: [
        { "grid-template-areas": "\"header header\" \"sidebar main\"" },
        { "grid-template-areas": "\"header  header\" \"sidebar  main\"" },
      ],
      placeholder: 'grid-template-areas:\n  "header header"\n  "sidebar main"',
      multiLine: true,
      columns: 2, rows: 2,
      items: [
        { label: "Header", color: "linear-gradient(135deg, #f43f5e, #e11d48)", area: "header" },
        { label: "Sidebar", color: "linear-gradient(135deg, #f97316, #ea580c)", area: "sidebar" },
        { label: "Main", color: "linear-gradient(135deg, #3b82f6, #2563eb)", area: "main" },
      ],
    },
    {
      id: 13, title: "Three Column Pro!",
      instruction: "Create a 3-column layout: sidebar 200px, main 1fr, aside 200px. Add 16px gap.",
      hint: "Mix fixed and flexible columns with gap.",
      difficulty: "advanced",
      accept: [
        { "grid-template-columns": "200px 1fr 200px", gap: "16px" },
        { "grid-template-columns": "200px  1fr  200px", gap: "16px" },
        { "grid-template-columns": "200px 1fr 200px", gap: "16px " },
      ],
      placeholder: "grid-template-columns: 200px 1fr 200px\ngap: 16px",
      multiLine: true,
      columns: 3, rows: 2,
      items: [
        { label: "Left", color: "linear-gradient(135deg, #f97316, #ea580c)" },
        { label: "Center", color: "linear-gradient(135deg, #22c55e, #16a34a)" },
        { label: "Right", color: "linear-gradient(135deg, #3b82f6, #2563eb)" },
        { label: "Nav", color: "linear-gradient(135deg, #eab308, #ca8a04)" },
        { label: "Content", color: "linear-gradient(135deg, #14b8a6, #0d9488)" },
        { label: "Ads", color: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
      ],
    },
    {
      id: 14, title: "Final Combo!",
      instruction: "Create 3 columns, 20px gap, center items in cells, and center the grid.",
      hint: "Combine <code>grid-template-columns</code>, <code>gap</code>, <code>place-items</code>, and <code>justify-content</code>.",
      difficulty: "advanced",
      accept: [
        { "grid-template-columns": "1fr 1fr 1fr", gap: "20px", "place-items": "center", "justify-content": "center" },
        { "grid-template-columns": "1fr  1fr  1fr", gap: "20px", "place-items": "center", "justify-content": "center" },
        { "grid-template-columns": "1fr 1fr 1fr", gap: "20px ", "place-items": "center", "justify-content": "center" },
      ],
      placeholder: "grid-template-columns: 1fr 1fr 1fr\ngap: 20px\nplace-items: center\njustify-content: center",
      multiLine: true,
      columns: 3, rows: 2,
      items: [
        { label: "Web", color: "linear-gradient(135deg, #f43f5e, #e11d48)" },
        { label: "Site", color: "linear-gradient(135deg, #f97316, #ea580c)" },
        { label: "Pro", color: "linear-gradient(135deg, #eab308, #ca8a04)" },
        { label: "Layout", color: "linear-gradient(135deg, #22c55e, #16a34a)" },
        { label: "Grid", color: "linear-gradient(135deg, #3b82f6, #2563eb)" },
        { label: "Master", color: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
      ],
    },
    {
      id: 15, title: "Build the Layout!",
      instruction: "FINAL CHALLENGE! Recreate the website layout shown in the preview. Header spans full, sidebar left, main center, footer spans full. Use grid-template-areas!",
      hint: "Use <code>grid-template-areas</code> to define the layout: header top, sidebar left, main right, footer bottom.",
      difficulty: "advanced",
      accept: [
        { "grid-template-areas": '"header header" "sidebar main" "footer footer"' },
        { "grid-template-areas": '"header  header" "sidebar  main" "footer  footer"' },
      ],
      placeholder: 'grid-template-areas:\n  "header header"\n  "sidebar main"\n  "footer footer"',
      multiLine: true,
      columns: 2, rows: 3, isFinal: true,
      items: [
        { label: "Header", color: "linear-gradient(135deg, #f43f5e, #e11d48)", area: "header" },
        { label: "Sidebar", color: "linear-gradient(135deg, #f97316, #ea580c)", area: "sidebar" },
        { label: "Main", color: "linear-gradient(135deg, #3b82f6, #2563eb)", area: "main" },
        { label: "Footer", color: "linear-gradient(135deg, #8b5cf6, #7c3aed)", area: "footer" },
      ],
    },
  ];

  var VALID_PROPS = [
    "display", "grid-template-columns", "grid-template-rows", "gap",
    "row-gap", "column-gap", "grid-column", "grid-row", "grid-area",
    "grid-template-areas", "grid-auto-flow", "justify-items", "align-items",
    "justify-content", "align-content", "place-items",
  ];

  var VALID_VALUES = {
    display: ["grid", "inline-grid"],
    "grid-auto-flow": ["row", "column", "dense", "row dense", "column dense"],
    "justify-items": ["start", "end", "center", "stretch"],
    "align-items": ["start", "end", "center", "stretch"],
    "justify-content": ["start", "end", "center", "stretch", "space-between", "space-around", "space-evenly"],
    "align-content": ["start", "end", "center", "stretch", "space-between", "space-around", "space-evenly"],
    "place-items": ["center", "start", "end", "stretch"],
  };

  var SUCCESS_MSGS = [
    "That's exactly right! You're getting the hang of this!",
    "Perfect! See how the layout changed? That's CSS Grid!",
    "Nailed it! You really understand this concept.",
    "Spot on! The blocks are exactly where they should be.",
    "Great work! You're becoming a Grid pro!",
    "That's it! CSS Grid does exactly what you tell it.",
    "Wonderful! Keep this up and you'll master layouts!",
    "Exactly right! See? Grid isn't so scary after all.",
    "You got it! Each property unlocks new layout powers.",
    "Beautiful! The blocks are perfectly arranged!",
  ];

  var WRONG_MSGS = [
    "Not quite right! The blocks aren't where they should be yet. Check the hint.",
    "Hmm, that code doesn't solve this level. Check the hint and try again.",
    "Almost! That CSS is valid, but it's wrong for this task. Check the hint.",
    "Nope, wrong code! Figure out where the blocks need to go, then fix it.",
    "Not yet! Look at the hint and adjust the code until the layout matches.",
  ];

  var STATE = { currentLevel: 0, score: 0, completed: {} };

  var POINTS = { beginner: 5, intermediate: 6, advanced: 9 };

  function pointsForLevel(level) {
    return POINTS[level.difficulty] || 5;
  }

  function emitProgress() {
    if (typeof window !== "undefined" && typeof window.__onGridGardenProgress === "function") {
      window.__onGridGardenProgress({
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
        return "'" + p + "' isn't a grid property. Try: display, grid-template-columns, gap, justify-items, etc.";
      }
      var allowed = VALID_VALUES[p];
      if (allowed && allowed.indexOf(v) === -1) {
        return "'" + v + "' isn't right for " + p + ". Check the hint below!";
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
    var board = $("grid-board");
    if (!board) return;
    for (var i = 0; i < pairs.length; i++) {
      var prop = pairs[i].property;
      var val = pairs[i].value;
      if (VALID_PROPS.indexOf(prop) !== -1) {
        board.style.setProperty(prop, val);
      }
      var level = LEVELS[STATE.currentLevel];
      if (level.itemTarget !== undefined && level.items[level.itemTarget]) {
        var target = $("item-" + level.itemTarget);
        if (target) {
          if (prop === "grid-column" || prop === "grid-row" || prop === "grid-area") {
            target.style.setProperty(prop, val);
          }
        }
      }
    }
  }

  function resetBoard() {
    var board = $("grid-board");
    if (!board) return;
    board.removeAttribute("style");
    board.style.padding = "14px";
    board.style.overflow = "hidden";
    board.style.height = "320px";
    board.style.width = "100%";
    board.style.boxSizing = "border-box";
    board.style.position = "relative";
    board.style.borderRadius = "0 0 1rem 1rem";

    if (STATE.currentLevel === 0) {
      board.style.display = "block";
      board.style.gap = "0px";
    } else {
      board.style.display = "grid";
      board.style.gap = "8px";
      board.style.alignItems = "stretch";
      board.style.gridTemplateColumns = "1fr 1fr";
      board.style.gridTemplateRows = "auto";
    }

    var items = board.querySelectorAll(".grid-item");
    for (var i = 0; i < items.length; i++) {
      items[i].removeAttribute("style");
      items[i].style.background = items[i].getAttribute("data-color");
      items[i].style.display = "flex";
      items[i].style.alignItems = "center";
      items[i].style.justifyContent = "center";
      items[i].style.borderRadius = "12px";
      items[i].style.boxShadow = "0 3px 10px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)";
      items[i].style.border = "2px solid rgba(255,255,255,0.25)";
      items[i].style.transition = "all 0.4s cubic-bezier(0.22,1,0.36,1)";
      items[i].style.userSelect = "none";
      items[i].style.minHeight = "0";
      items[i].style.minWidth = "0";
      items[i].style.overflow = "hidden";
      items[i].style.padding = "10px 6px";
    }
  }

  function renderBoard() {
    var board = $("grid-board");
    if (!board) return;
    board.innerHTML = "";
    var level = LEVELS[STATE.currentLevel];
    if (!level) return;

    for (var a = 0; a < level.items.length; a++) {
      var item = level.items[a];
      var el = document.createElement("div");
      el.className = "grid-item";
      el.id = "item-" + a;
      el.setAttribute("data-color", item.color);
      el.style.background = item.color;

      var iconHtml = "";
      if (item.area) {
        iconHtml = '<div class="grid-item-area">' + item.area + '</div>';
        // Assign the item to its named area, otherwise grid-template-areas
        // has nothing to place and the board never shows the target layout.
        el.style.gridArea = item.area;
      }
      if (item.span) {
        el.style.gridColumn = "span " + item.span;
      }
      if (item.rowSpan) {
        el.style.gridRow = "span " + item.rowSpan;
      }

      el.innerHTML =
        '<div class="grid-item-inner">' +
          '<div class="grid-item-label">' + item.label + '</div>' +
          iconHtml +
        '</div>';

      board.appendChild(el);
    }
  }

  function renderPreview() {
    var preview = $("grid-preview");
    if (!preview) return;
    var level = LEVELS[STATE.currentLevel];
    if (!level || !level.isFinal) { preview.style.display = "none"; return; }
    preview.style.display = "block";
  }

  function showToast(msg, isError) {
    var t = $("toast");
    if (!t) return;
    t.textContent = (isError ? "\u2715 " : "\u2713 ") + msg;
    t.className = "grid-status-toast " + (isError ? "error" : "success");
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
    var t = qs(".grid-complete-text", o);
    var m = qs(".grid-complete-msg", o);
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

    showToast("\u2713 Correct! See how the layout changed?", false);

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

  function nextHandler() {
    var nb = $("next-btn");
    if (nb && !nb.disabled) nextLevel();
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
      diffEl.className = "grid-level-difficulty " + level.difficulty;
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
    renderPreview();
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
    if (i) i.textContent = "You completed all " + LEVELS.length + " levels and mastered CSS Grid!";
    if (h) h.innerHTML = "You can now build any layout! Share your score with friends!";
    if (d) { d.textContent = "Complete"; d.className = "grid-level-difficulty beginner"; }

    var board = $("grid-board");
    if (board) {
      board.innerHTML =
        '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;text-align:center">' +
        '<div style="font-size:4rem;margin-bottom:0.5rem">' + stars + '</div>' +
        '<div style="font-size:2rem;margin-bottom:0.5rem">\uD83C\uDF89\uD83C\uDF33\uD83C\uDF89</div>' +
        '<div style="font-size:1.2rem;font-weight:700;font-family:var(--font-display)">Grid Master!</div>' +
        '<div style="font-size:0.85rem;color:hsl(var(--muted));margin-top:0.25rem">Score: ' + STATE.score + ' | Levels: ' + done + '/' + LEVELS.length + '</div>' +
        '</div>';
      board.style.display = "flex";
      board.style.alignItems = "center";
      board.style.justifyContent = "center";
    }

    var preview = $("grid-preview");
    if (preview) preview.style.display = "none";

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
    var board = $("grid-board");
    if (!board) return;

    resetBoard();
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
  }

  function initGame() {
    var ta = $("css-editor");
    var pb = $("prev-btn");
    var nb = $("next-btn");
    var rb = $("reset-btn");

    if (ta) { ta.removeEventListener("input", handleInput); ta.addEventListener("input", handleInput); }
    if (pb) { pb.removeEventListener("click", prevLevel); pb.addEventListener("click", prevLevel); }
    if (nb) {
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
    window.__initGridGarden = function () { initGame(); };
    window.__resumeGridGarden = function (saved) { resumeGame(saved); };
  }
})();
