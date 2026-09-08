(function () {
  "use strict";

  var LEVELS = [
    {
      id: 1,
      title: "Hello, Detective!",
      difficulty: "easy",
      instruction:
        "Every program says hello. Use console.log to print the message \"Ready!\" in the console.",
      hint: "Write <code>console.log(\"Ready!\")</code> — console.log prints whatever is inside the parentheses.",
      starter: "",
      expectedMsg: "Ready!",
      check: function (ctx, logs) {
        return logs.some(function (l) { return String(l.value) === "Ready!"; });
      },
      successNote: "You printed your first output. That's the very heart of logging.",
    },
    {
      id: 2,
      title: "Keep the Name Secret",
      difficulty: "easy",
      instruction:
        "Declare a variable named <code>name</code> storing \"Ada\" (a famous programmer), then log it.",
      hint: "Write <code>let name = \"Ada\";</code> then <code>console.log(name);</code>.",
      starter: "// declare your variable here\n",
      expectedLogValue: "Ada",
      check: function (ctx, logs) {
        return logs.some(function (l) { return String(l.value) === "Ada"; });
      },
      successNote: "Variables let you store data and reuse it — the building block of JS.",
    },
    {
      id: 3,
      title: "The Joined Clue",
      difficulty: "easy",
      instruction:
        "Join the two strings \"Agent \" and \"Maaz\" using the + operator, then log the result.",
      hint: "Write <code>console.log(\"Agent \" + \"Maaz\");</code> — the + joins strings together.",
      starter: "",
      expectedLogValue: "Agent Maaz",
      check: function (ctx, logs) {
        return logs.some(function (l) { return String(l.value) === "Agent Maaz"; });
      },
      successNote: "Concatenation stitches strings together with +. Great for building sentences.",
    },
    {
      id: 4,
      title: "Template Talent",
      difficulty: "easy",
      instruction:
        "Use a template literal (backticks with ${...}) to log: \"1 + 1 = 2\". Embed the real sum of 1 + 1 inside the ${ }.",
      hint: "Write <code>console.log(`1 + 1 = ${1 + 1}`)</code> — backticks let you inject expressions with ${ }.",
      starter: "",
      expectedLogValue: "1 + 1 = 2",
      check: function (ctx, logs) {
        return logs.some(function (l) { return String(l.value) === "1 + 1 = 2"; });
      },
      successNote: "Template literals make string building far cleaner than endless + signs.",
    },
    {
      id: 5,
      title: "Number Detective",
      difficulty: "easy",
      instruction:
        "JavaScript does the math. Log the result of the expression: 5 times 3, plus 2.",
      hint: "Write <code>console.log(5 * 3 + 2);</code> — * is multiplication.",
      starter: "",
      expectedValue: 17,
      check: function (ctx, logs) {
        return logs.some(function (l) { return Number(l.value) === 17; });
      },
      successNote: "Arithmetic works just like math — *, /, + and - are your tools.",
    },
    {
      id: 6,
      title: "The Array Lineup",
      difficulty: "easy",
      instruction:
        "Create an array of the three numbers 3, 1 and 2 (in that order), store it in a variable <code>arr</code>, then log it.",
      hint: "Write <code>let arr = [3, 1, 2];</code> then <code>console.log(arr);</code>.",
      starter: "// create the array\n",
      expectedLogValue: "[3,1,2]",
      check: function (ctx, logs) {
        return logs.some(function (l) {
          var v = l.value;
          return Array.isArray(v) && v.length === 3 && v[0] === 3 && v[1] === 1 && v[2] === 2;
        });
      },
      successNote: "Arrays are ordered lists — the perfect way to store many clues at once.",
    },
    {
      id: 7,
      title: "Push for More Clues",
      difficulty: "easy",
      instruction:
        "Start with the array <code>[\"map\"]</code> stored in <code>clues</code>. Use .push to add \"key\" to the end, then log clues.",
      hint: "Write <code>let clues = [\"map\"];</code> then <code>clues.push(\"key\");</code> then <code>console.log(clues);</code>.",
      starter: "// build and grow the clues array\n",
      expectedLogValue: "map,key",
      check: function (ctx, logs) {
        return logs.some(function (l) {
          var v = l.value;
          return Array.isArray(v) && v.length === 2 && v[0] === "map" && v[1] === "key";
        });
      },
      successNote: ".push() adds an item to the end of an array, growing it one clue at a time.",
    },
    {
      id: 8,
      title: "Loop the Loop",
      difficulty: "intermediate",
      instruction:
        "Use a for loop to add up the numbers 1 through 5, then log the total (it should equal 15).",
      hint: "Start a variable <code>let sum = 0;</code> then <code>for (let i = 1; i <= 5; i++) { sum += i; }</code> then log sum.",
      starter: "let sum = 0;\n// add 1..5 with a for loop\n",
      expectedValue: 15,
      check: function (ctx, logs) {
        return logs.some(function (l) { return Number(l.value) === 15; });
      },
      successNote: "A for loop repeats code a set number of times — perfect for summing lists.",
    },
    {
      id: 9,
      title: "While We Investigate",
      difficulty: "intermediate",
      instruction:
        "Use a while loop to keep counting up from 0 until a counter reaches 3, then log the final counter.",
      hint: "Write <code>let i = 0;</code> then <code>while (i < 3) { i++; }</code> then <code>console.log(i);</code>.",
      starter: "let i = 0;\n// count with a while loop\n",
      expectedValue: 3,
      check: function (ctx, logs) {
        return logs.some(function (l) { return Number(l.value) === 3; });
      },
      successNote: "A while loop repeats while a condition stays true — great when you don't know the count.",
    },
    {
      id: 10,
      title: "Double Trouble",
      difficulty: "intermediate",
      instruction:
        "The clue box <code>input</code> holds [1, 2, 3]. Use .map to double each number and log the new array (should be [2, 4, 6]).",
      hint: "Write <code>let doubled = input.map(n => n * 2);</code> then <code>console.log(doubled);</code>.",
      starter: "// input is already defined: [1, 2, 3]\n",
      expectedLogValue: "[2,4,6]",
      setUp: "ctx.input = [1, 2, 3];",
      check: function (ctx, logs) {
        return logs.some(function (l) {
          var v = l.value;
          return Array.isArray(v) && v.length === 3 && v[0] === 2 && v[1] === 4 && v[2] === 6;
        });
      },
      successNote: ".map transforms every element — one to one — into a brand new array.",
    },
    {
      id: 11,
      title: "The Great Filter",
      difficulty: "intermediate",
      instruction:
        "The array <code>input</code> holds [1, 2, 3, 4, 5, 6]. Use .filter to keep only the even numbers and log the result (should be [2, 4, 6]).",
      hint: "Write <code>let evens = input.filter(n => n % 2 === 0);</code> then log evens.",
      starter: "// keep only even numbers\n",
      expectedLogValue: "[2,4,6]",
      setUp: "ctx.input = [1, 2, 3, 4, 5, 6];",
      check: function (ctx, logs) {
        return logs.some(function (l) {
          var v = l.value;
          return Array.isArray(v) && v.length === 3 && v[0] === 2 && v[1] === 4 && v[2] === 6;
        });
      },
      successNote: ".filter keeps only the elements that pass your test — like filtering the good clues.",
    },
    {
      id: 12,
      title: "The Function Factory",
      difficulty: "intermediate",
      instruction:
        "Write a function named <code>double</code> that returns its input times 2. Then log <code>double(21)</code> — it should print 42.",
      hint: "Write <code>function double(n) { return n * 2; }</code> then <code>console.log(double(21));</code>.",
      starter: "// define the double function\n",
      expectedValue: 42,
      check: function (ctx, logs) {
        return logs.some(function (l) { return Number(l.value) === 42; });
      },
      successNote: "Functions package reusable logic — define once, call anywhere. 42 is the classic answer!",
    },
    {
      id: 13,
      title: "The Big Decision",
      difficulty: "intermediate",
      instruction:
        "The number <code>input</code> equals 25. Write an if/else that logs \"big\" when it is greater than 10, otherwise \"small\".",
      hint: "Write <code>if (input > 10) { console.log(\"big\"); } else { console.log(\"small\"); }</code>.",
      starter: "// input is already defined: 25\n",
      expectedLogValue: "big",
      setUp: "ctx.input = 25;",
      check: function (ctx, logs) {
        return logs.some(function (l) { return String(l.value) === "big"; });
      },
      successNote: "if/else lets code take different paths based on conditions.",
    },
    {
      id: 14,
      title: "The Click Mystery",
      difficulty: "advanced",
      instruction:
        "A button named <code>button</code> exists with an .addEventListener method. Attach a \"click\" handler that sets <code>button.text</code> to \"Solved\". Then click it to verify.",
      hint: "Write <code>button.addEventListener(\"click\", function () { button.text = \"Solved\"; });</code>.",
      starter: "// attach a click handler that sets button.text = \"Solved\"\n",
      setUp:
        "ctx.button = { text: \"\", listeners: [] };\n" +
        "ctx.button.addEventListener = function (type, fn) { ctx.button.listeners.push({ type: type, fn: fn }); };",
      check: function (ctx, logs) {
        var btn = ctx.button;
        var found = false;
        for (var i = 0; i < btn.listeners.length; i++) {
          if (btn.listeners[i].type === "click") {
            btn.listeners[i].fn();
            found = true;
          }
        }
        return found && btn.text === "Solved";
      },
      successNote: "Event listeners react to user actions — this is how real buttons come alive.",
    },
    {
      id: 15,
      title: "The Final Case",
      difficulty: "advanced",
      instruction:
        "FINAL CASE! Use an array [2, 4, 6], a function, and a loop together: define <code>function sumAll(nums)</code> that loops and returns the total, then log <code>sumAll(input)</code> (should be 12).",
      hint: "Write the function with a for loop adding each element, return the total, then log it.",
      starter: "// combined challenge: function + loop + array\n",
      expectedValue: 12,
      setUp: "ctx.input = [2, 4, 6];",
      isFinal: true,
      check: function (ctx, logs) {
        // The user should define their own sumAll; verify it works on input.
        return logs.some(function (l) { return Number(l.value) === 12; });
      },
      successNote: "You combined variables, arrays, functions and loops — you're officially a JS Detective!",
    },
  ];

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

  var POINTS = { easy: 3, intermediate: 7, advanced: 9 };

  function pointsForLevel(level) {
    return POINTS[level.difficulty] || 3;
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

  // Build and run the user's code in a controlled context.
  // - ctx: a shared object the setUp + user code can read/write.
  // - logs: capture every console.log call (raw value + string form).
  function evaluateUserCode(code, setUp) {
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

    // Phase 1: run the level's setUp to populate ctx (input, button, ...).
    if (setUp) {
      try {
        var setupFn = new Function(
          "var ctx = arguments[0];\nvar console = arguments[1];\n" + setUp
        );
        setupFn(ctx, capturedConsole);
      } catch (e) {
        logs.push({ value: undefined, text: "✕ Error: " + safeError(e), isError: true });
      }
    }

    // Phase 2: expose ctx properties as local variables so the user can
    // reference bare `input`, `button`, etc., then run their code.
    var varDecls = "";
    for (var key in ctx) {
      if (Object.prototype.hasOwnProperty.call(ctx, key)) {
        varDecls += "var " + key + " = ctx." + key + ";\n";
      }
    }

    var fullCode =
      "var ctx = arguments[0];\n" +
      "var console = arguments[1];\n" +
      varDecls +
      (code || "") + "\n";

    var fn;
    try {
      fn = new Function(fullCode);
    } catch (e) {
      return { error: "Could not build your code: " + safeError(e), logs: logs, ctx: ctx };
    }

    try {
      fn(ctx, capturedConsole);
    } catch (e) {
      logs.push({ value: undefined, text: "✕ Error: " + safeError(e), isError: true });
    }

    return { logs: logs, ctx: ctx, error: null };
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
    var result = evaluateUserCode(ta.value, level.setUp || "");
    renderConsole(result.logs);
    return result;
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
    t._timer = setTimeout(function () { t.style.opacity = "0"; }, isError ? 5000 : 2500);
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

  function checkAnswer() {
    var ta = $("js-editor");
    if (!ta) return;
    var level = LEVELS[STATE.currentLevel];
    var result = evaluateUserCode(ta.value, level.setUp || "");
    renderConsole(result.logs);

    if (STATE.completed[STATE.currentLevel]) {
      nextLevel();
      return;
    }

    if (result.error) {
      showToast(result.error, true);
      return;
    }

    // If the code crashed (error in logs), prompt to fix.
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
  }

  function renderProgress() {
    var box = $("progress-dots");
    if (!box) return;
    box.innerHTML = "";
    for (var i = 0; i < LEVELS.length; i++) {
      var d = document.createElement("button");
      d.type = "button";
      d.className =
        "jsd-progress-dot" +
        (i === STATE.currentLevel ? " current" : "") +
        (STATE.completed[i] ? " done" : "");
      d.setAttribute("aria-label", "Case " + (i + 1) + (STATE.completed[i] ? " (solved)" : ""));
      d.title = "Case " + (i + 1) + (STATE.completed[i] ? " \u2713" : "");
      if (STATE.completed[i]) {
        d.innerHTML = "\u2713";
      } else {
        d.textContent = "";
      }
      (function (idx) {
        d.addEventListener("click", function () {
          if (idx === STATE.currentLevel) return;
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
    if (hintEl) {
      hintEl.innerHTML = "";
      var spark = document.createElement("span");
      spark.innerHTML = "💡 ";
      hintEl.appendChild(spark);
      hintEl.appendChild(document.createTextNode("Hint: "));
      var hintSpan = document.createElement("span");
      hintSpan.innerHTML = level.hint;
      hintEl.appendChild(hintSpan);
    }
    if (diffEl) {
      diffEl.textContent = level.difficulty.charAt(0).toUpperCase() + level.difficulty.slice(1);
      diffEl.className = "jsd-level-difficulty " + level.difficulty;
    }
    if (ta) {
      ta.value = level.starter || "";
      ta.placeholder = level.isFinal ? "You got this, detective!" : "Write your JavaScript here...";
    }
    if (pb) { pb.disabled = STATE.currentLevel === 0; pb.style.opacity = STATE.currentLevel === 0 ? "0.4" : "1"; }
    if (nb) { nb.disabled = false; nb.classList.toggle("ready", !!STATE.completed[STATE.currentLevel]); }
    if (cb) { cb.disabled = false; cb.classList.toggle("ready", !!STATE.completed[STATE.currentLevel]); }

    renderProgress();
    renderConsole([]);
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
    if (i) i.textContent = "All cases closed! You mastered the core of JavaScript.";
    if (h) h.innerHTML = "Hint: You can now write variables, loops, functions, arrays and event handlers. Share your score!";
    if (d) { d.textContent = "Master"; d.className = "jsd-level-difficulty advanced"; }

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
    if (!ta) return;
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

    // Reset button (aliased to run-btn in this game's UI).
    var resetBtn = $("reset-btn");
    if (resetBtn) { resetBtn.removeEventListener("click", handleReset); resetBtn.addEventListener("click", handleReset); }

    STATE.currentLevel = 0;
    STATE.score = 0;
    STATE.completed = {};

    var s = $("score-display");
    if (s) s.textContent = "Score: 0";

    renderLevel();
  }

  if (typeof window !== "undefined") {
    window.__initJsDetective = function () { initGame(); };
    window.__resumeJsDetective = function (saved) { resumeGame(saved); };
    window.__getJsDetectiveState = function () {
      return {
        currentLevel: STATE.currentLevel,
        score: STATE.score,
        completed: STATE.completed,
        totalLevels: LEVELS.length,
      };
    };
    window.__runJsDetective = function () { runCode(); };
  }
})();
