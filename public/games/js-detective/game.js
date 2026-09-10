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

  var STATE = {
    currentLevel: 0,
    score: 0,
    completed: {},
    solutions: {},
    hintsDate: null,
    hintsUsed: 0,
  };

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

  // Progressive gating: finish most cases in a tier to unlock the next;
  // all Hard cases must be solved before Most Hard opens.
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
        solutions: STATE.solutions,
        hints: { date: STATE.hintsDate, used: STATE.hintsUsed },
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
            solutions: STATE.solutions,
            hints: { date: STATE.hintsDate, used: STATE.hintsUsed },
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
      if (saved.solutions && typeof saved.solutions === "object") {
        var sols = {};
        for (var sk in saved.solutions) {
          var si = Number(sk);
          if (
            Number.isInteger(si) && si >= 0 && si < LEVELS.length &&
            typeof saved.solutions[sk] === "string"
          ) {
            sols[si] = saved.solutions[sk];
          }
        }
        STATE.solutions = sols;
      }
      if (saved.hints && typeof saved.hints === "object") {
        var hu = Number(saved.hints.used);
        if (typeof saved.hints.date === "string" && saved.hints.date.length === 10 && Number.isInteger(hu) && hu >= 0) {
          STATE.hintsDate = saved.hints.date;
          STATE.hintsUsed = hu;
        }
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

  // --- Sandboxing: the user's code runs as an async function whose first
  //       argument is the solve-time ctx and second is the captured console.
  //       We skip injecting a ctx key the user re-declares at top level (e.g.
  //       `let badge`) so their own declaration wins instead of colliding with
  //       our injected var.
  function stripCodeNoise(code) {
    // Blank out strings, template literals and comments (keeping newlines) so the
    // declaration scanner can't be fooled by keywords living inside them.
    return String(code).replace(
      /\\.|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`|\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
      function (m) { return m.replace(/[^\n]/g, " "); }
    );
  }

  function topLevelDeclaredNames(code) {
    var names = [];
    var clean = stripCodeNoise(code);
    var depth = 0;
    var re = /\b(var|let|const)\b|\{|\}/g;
    var m;
    while ((m = re.exec(clean)) !== null) {
      if (m[0] === "{") { depth++; continue; }
      if (m[0] === "}") { depth = Math.max(0, depth - 1); continue; }
      if (depth !== 0) continue;
      var soFar = clean.slice(0, m.index).replace(/\s+$/, "");
      if (soFar.charAt(soFar.length - 1) === "(") continue; // `for (let ...)` head
      var rest = clean.slice(re.lastIndex).replace(/^\s+/, "");
      var idm = /^[A-Za-z_$][$\w]*/.exec(rest);
      if (idm) names.push(idm[0]);
    }
    return names;
  }

  function buildSnippet(code, ctx, declaredNames) {
    var skip = {};
    for (var i = 0; i < declaredNames.length; i++) skip[declaredNames[i]] = true;
    var prefixLines = ["var ctx = arguments[0];", "var console = arguments[1];"];
    for (var key in ctx) {
      if (Object.prototype.hasOwnProperty.call(ctx, key) && !skip[key]) {
        prefixLines.push("var " + key + " = ctx." + key + ";");
      }
    }
    var src =
      prefixLines.join("\n") +
      "\n" +
      (code || "") +
      "\n//# sourceURL=student-solution.js\n";
    return { src: src, prefixLines: prefixLines };
  }

  // The V8 SyntaxError from `new AsyncFunction` never carries a line, so we
  // localize it by finding the first user line whose addition breaks parsing.
  function locateSyntaxErrorLine(prefixLines, code) {
    var AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    var lines = String(code).split("\n");
    for (var i = 0; i < lines.length; i++) {
      var partial =
        prefixLines.join("\n") +
        "\n" +
        lines.slice(0, i + 1).join("\n") +
        "\n//# sourceURL=student-solution.js\n";
      try { new AsyncFunction(partial); } catch (e) { return i + 1; }
    }
    return null;
  }

  // V8 reports runtime errors from `new AsyncFunction` bodies at the end of
  // the constructed script, which lands exactly (prefix lines + user lines + 2)
  // in both Node and Chrome (verified empirically), so we subtract that offset
  // and clamp to the user code's own line range as a safety net.
  function parseErrorLine(e, prefixLineCount, userLineCount) {
    if (!e || !e.stack) return null;
    var m = e.stack.match(/student-solution\.js:(\d+)/);
    if (!m) return null;
    var line = Number(m[1]) - prefixLineCount - 2;
    return line >= 1 && line <= userLineCount ? line : null;
  }

  function evaluateUserCodeAsync(code, setUp) {
    var ctx = {};
    var logs = [];
    var AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    var setupError = null;

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
        setupError = { kind: "setup", message: safeError(e), line: null };
      }
    }

    function runtimeError(e, prefixLineCount, userLineCount) {
      return { kind: "runtime", message: safeError(e), line: parseErrorLine(e, prefixLineCount, userLineCount) };
    }

    function settle() {
      return new Promise(function (resolve) { setTimeout(resolve, 60); });
    }

    // Async case files reject promises their fetches can't fulfill (e.g.
    // fetch("/broken")). A learner's first attempt often leaves that rejection
    // unhandled, which makes the BROWSER throw an "Uncaught (in promise)" —
    // scary and misleading on the page. While a solution is evaluating we
    // therefore swallow unhandled rejections and turn them into an ordinary,
    // readable console line with a hint instead.
    var uhrHandler = null;
    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      uhrHandler = function (event) {
        if (event && typeof event.preventDefault === "function") event.preventDefault();
        var reason = event && event.reason;
        var msg =
          reason && typeof reason === "object" && reason.message
            ? String(reason.message)
            : String(reason === undefined ? "unknown" : reason);
        logs.push({
          value: undefined,
          text:
            "✕ Unhandled promise rejection: " + msg +
            " — every rejected promise needs catching. Wrap await fetch('/broken') in try/catch.",
          isError: true,
        });
      };
      window.addEventListener("unhandledrejection", uhrHandler);
    }

    runSetUp();

    var built = buildSnippet(code, ctx, topLevelDeclaredNames(code));
    var fn;
    try {
      fn = new AsyncFunction(built.src);
    } catch (e) {
      return Promise.resolve({
        logs: logs,
        ctx: ctx,
        error: {
          kind: "syntax",
          message: safeError(e),
          line: locateSyntaxErrorLine(built.prefixLines, code),
        },
      });
    }

    var TIMEOUT_MS = 5000;

    var outcome = Promise.resolve()
      .then(function () { return fn(ctx, capturedConsole); })
      .catch(function (e) {
        logs.push({ value: undefined, text: "✕ Error: " + safeError(e), isError: true });
        if (!setupError) setupError = runtimeError(e, built.prefixLines.length, String(code).split("\n").length);
      })
      .then(settle)
      .then(function () {
        if (uhrHandler && typeof window !== "undefined") {
          window.removeEventListener("unhandledrejection", uhrHandler);
        }
        return { logs: logs, ctx: ctx, error: setupError };
      });

    // A learner's promise can hang forever (e.g. `await new Promise(() => {})`
    // or a never-settling fetch). Without a guard the Check/Run chain stalls,
    // the busy state never clears and the buttons stay wedged. Race the
    // evaluation against a timeout so the UI always recovers with a clear
    // message. (A synchronous `while (true) {}` freezes the tab itself — no
    // in-page timer can fire then — but never-resolving awaits are the common
    // hang and ARE recoverable this way.)
    return new Promise(function (resolve) {
      var timer = setTimeout(function () {
        if (uhrHandler && typeof window !== "undefined") {
          window.removeEventListener("unhandledrejection", uhrHandler);
        }
        logs.push({
          value: undefined,
          text:
            "✕ Timed out after " + (TIMEOUT_MS / 1000) + "s — your code never finished." +
            " Check for an infinite loop or an await that never resolves.",
          isError: true,
        });
        if (!setupError) {
          setupError = {
            kind: "timeout",
            message:
              "Your code took too long (over " + (TIMEOUT_MS / 1000) + "s) and was stopped —" +
              " look for an infinite loop or an await that never settles.",
            line: null,
          };
        }
        resolve({ logs: logs, ctx: ctx, error: setupError });
      }, TIMEOUT_MS);
      outcome.then(function (result) { clearTimeout(timer); resolve(result); });
    });
  }

  function safeError(e) {
    if (!e) return "Something went wrong";
    if (e instanceof Error) return e.message;
    try { return String(e); } catch (_) { return "Unknown error"; }
  }

  function errorLabel(kind) {
    if (kind === "syntax") return "Syntax Error";
    if (kind === "runtime") return "Runtime Error";
    if (kind === "setup") return "Setup Error";
    if (kind === "timeout") return "Timed Out";
    return "Error";
  }

  function errorText(err) {
    var text = err && err.message ? err.message : "Your code failed to run.";
    if (err && err.line) text += " (line " + err.line + ")";
    return text;
  }

  // Prominent, always-visible result panel under the editor (never a blank
  // screen, never console-only: pass / fail / syntax / runtime all land here).
  function renderResult(o) {
    var el = $("jsd-result");
    if (!el) return;
    el.innerHTML = "";
    if (!o || !o.text) {
      el.hidden = true;
      el.className = "jsd-result";
      return;
    }
    el.hidden = false;
    el.className = "jsd-result " + (o.state || "");
    var icon = document.createElement("span");
    icon.className = "jsd-result-icon";
    icon.textContent = o.icon || "";
    var body = document.createElement("span");
    body.className = "jsd-result-body";
    if (o.title) {
      var title = document.createElement("strong");
      title.textContent = o.title + " ";
      body.appendChild(title);
    }
    body.appendChild(document.createTextNode(o.text));
    el.appendChild(icon);
    el.appendChild(body);
  }

  function renderLineNumbers() {
    var el = $("jsd-line-numbers");
    var ta = $("js-editor");
    if (!el || !ta) return;
    var count = ta.value.split("\n").length || 1;
    if (count < 8) count = 8;
    if (count > 60) count = 60;
    var html = "";
    for (var i = 1; i <= count; i++) html += i + (i < count ? "<br>" : "");
    el.innerHTML = html;
    el.scrollTop = ta.scrollTop || 0;
    renderHighlight();
  }

  // VS Code-style token colors: comments, strings, numbers, keywords,
  // booleans/null, variables and the rest fall through to the plain text.
  var JS_KEYWORDS = {
    "var": 1, "let": 1, "const": 1, "function": 1, "return": 1, "if": 1,
    "else": 1, "for": 1, "while": 1, "do": 1, "switch": 1, "case": 1,
    "break": 1, "continue": 1, "new": 1, "class": 1, "extends": 1,
    "this": 1, "typeof": 1, "instanceof": 1, "in": 1, "of": 1, "try": 1,
    "catch": 1, "finally": 1, "throw": 1, "async": 1, "await": 1,
    "yield": 1, "import": 1, "export": 1, "default": 1, "delete": 1,
    "void": 1, "super": 1, "static": 1, "get": 1, "set": 1, "debugger": 1
  };
  var JS_LITERALS = { "true": 1, "false": 1, "null": 1, "undefined": 1 };

  function escHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function highlightJs(code) {
    var out = "";
    var i = 0;
    var n = code.length;

    function span(cls, text) {
      return '<span class="tok-' + cls + '">' + escHtml(text) + "</span>";
    }

    while (i < n) {
      var ch = code[i];

      // line comment //
      if (ch === "/" && code[i + 1] === "/") {
        var j = code.indexOf("\n", i);
        if (j === -1) j = n;
        out += span("comment", code.slice(i, j));
        i = j;
        continue;
      }
      // block comment
      if (ch === "/" && code[i + 1] === "*") {
        var k = code.indexOf("*/", i + 2);
        if (k === -1) k = n - 2;
        out += span("comment", code.slice(i, k + 2));
        i = k + 2;
        continue;
      }
      // template string
      if (ch === "`") {
        var startT = i;
        i++;
        while (i < n && code[i] !== "`") {
          if (code[i] === "\\") i++;
          i++;
        }
        i++;
        out += span("string", code.slice(startT, i));
        continue;
      }
      // single-line strings
      if (ch === '"' || ch === "'") {
        var startS = i;
        var quote = ch;
        i++;
        while (i < n) {
          if (code[i] === "\\") { i += 2; continue; }
          if (code[i] === quote) { i++; break; }
          i++;
        }
        out += span("string", code.slice(startS, i));
        continue;
      }
      // number
      if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(code[i + 1] || ""))) {
        var startNum = i;
        while (i < n && /[0-9a-fxA-FxX._eE+-]/.test(code[i])) {
          // don't consume a trailing + or - unless it's part of an exponent
          if ((code[i] === "+" || code[i] === "-") && !/[eE]/.test(code[i - 1] || "")) break;
          if ((code[i] === ".") && !/[0-9]/.test(code[i + 1] || "") && /[^.0-9]/.test(code[i + 1] || "")) break;
          i++;
        }
        out += span("number", code.slice(startNum, i));
        continue;
      }
      // identifier / keyword
      if (/[A-Za-z_$]/.test(ch)) {
        var startId = i;
        while (i < n && /[A-Za-z0-9_$]/.test(code[i])) i++;
        var word = code.slice(startId, i);
        if (JS_KEYWORDS[word]) out += span("keyword", word);
        else if (JS_LITERALS[word]) out += span("literal", word);
        else out += span("variable", word);
        continue;
      }
      // whitespace
      if (/\s/.test(ch)) {
        out += escHtml(ch);
        i++;
        continue;
      }
      // everything else (operators, punctuation)
      out += escHtml(ch);
      i++;
    }
    return out;
  }

  function renderHighlight() {
    var hl = $("jsd-highlight");
    var ta = $("js-editor");
    if (!hl || !ta) return;
    hl.innerHTML = highlightJs(ta.value) || "\u00a0";
    hl.scrollTop = ta.scrollTop;
    hl.scrollLeft = ta.scrollLeft;
  }

  function syncEditorScroll() {
    var hl = $("jsd-highlight");
    var ln = $("jsd-line-numbers");
    var ta = $("js-editor");
    if (!ta) return;
    if (hl) { hl.scrollTop = ta.scrollTop; hl.scrollLeft = ta.scrollLeft; }
    if (ln) ln.scrollTop = ta.scrollTop;
  }

  function updateSolvedNote() {
    var note = $("jsd-solved-note");
    if (!note) return;
    if (STATE.completed[STATE.currentLevel]) {
      note.hidden = false;
      note.textContent = "✓ Solved — this is your passing solution. Tweak it and hit Check to retry anytime.";
    } else {
      note.hidden = true;
      note.textContent = "";
    }
  }

  function runCode() {
    var ta = $("js-editor");
    if (!ta) return;
    var level = LEVELS[STATE.currentLevel];
    if (!level) {
      showToast("Case data not loaded yet — try again in a moment.", true);
      return;
    }
    evaluateUserCodeAsync(ta.value, level.setUp).then(function (result) {
      renderConsole(result.logs);
      if (result.error) {
        renderResult({
          state: "error",
          icon: "⚠️",
          title: errorLabel(result.error.kind),
          text: errorText(result.error),
        });
      } else {
        renderResult(null);
        var noLogs = !result.logs || result.logs.length === 0;
        if (noLogs) {
          var consoleEl = $("jsd-console");
          if (consoleEl) {
            consoleEl.innerHTML = "";
            var hint = document.createElement("div");
            hint.className = "jsd-console-empty";
            hint.textContent = "Code ran successfully. Click Check to verify your solution.";
            consoleEl.appendChild(hint);
          }
          showToast("Code executed. Click Check to verify.", false);
        }
      }
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
    if (!level) {
      // Never silently swallow a Check click. If the level data is still
      // loading, wait for it and re-run; otherwise surface a clear message.
      ensureLevels(function () {
        if (LEVELS.length === 0) {
          showToast("Case data not loaded yet — reload the page if this persists.", true);
        } else {
          checkAnswer();
        }
      });
      return;
    }
    STATE.thinking = true;
    setButtonsDisabled(true);

    evaluateUserCodeAsync(ta.value, level.setUp).then(function (result) {
      // Reset the busy state before doing anything else so a check can never
      // leave the buttons wedged, even if a later step misbehaves.
      STATE.thinking = false;
      setButtonsDisabled(false);
      renderConsole(result.logs);

      if (result.error) {
        var msg = errorText(result.error);
        renderResult({
          state: "error",
          icon: "⚠️",
          title: errorLabel(result.error.kind),
          text: msg,
        });
        showToast(msg, true);
        return;
      }

      var crashed = result.logs.some(function (l) { return l.isError; });
      if (crashed) {
        renderResult({
          state: "error",
          icon: "⚠️",
          title: "Console Error",
          text: "Your code logged an error — read the console and fix it.",
        });
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
        if (ta) STATE.solutions[STATE.currentLevel] = ta.value;
        if (STATE.completed[STATE.currentLevel]) {
          // Revisiting a solved case: show a clear result, never auto-advance,
          // and never award XP twice.
          renderResult({
            state: "pass",
            icon: "✓",
            title: "Still Correct!",
            text: "This case was already solved — your solution still passes, so no extra XP.",
          });
          showToast("Still correct! This case was already solved.", false);
          return;
        }
        renderResult({
          state: "pass",
          icon: "✓",
          title: "Solved!",
          text: "All checks passed. Great work, detective.",
        });
        completeLevel();
      } else {
        renderResult({
          state: "fail",
          icon: "✕",
          title: "Not Solved Yet",
          text: randomItem(WRONG_MSGS),
        });
        showToast(randomItem(WRONG_MSGS), true);
      }
    }).catch(function () {
      // Belt and braces: ensure the UI never stays locked after an edge-case
      // failure in the async chain above.
      STATE.thinking = false;
      setButtonsDisabled(false);
      showToast("Something went wrong running your code — try again.", true);
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

  function renderHintArea(level, hintEl) {
    // Hints are nudges hidden behind a reveal button on every tier. There is no
    // daily limit on reveals — a hint is only shown after the button is tapped.
    var reveal = document.createElement("button");
    reveal.type = "button";
    reveal.className = "jsd-hint-reveal";
    reveal.textContent = "\uD83D\uDCA1 Show Hint";
    reveal.onclick = function () {
      hintEl.innerHTML = "";
      var spark = document.createElement("span");
      spark.textContent = "\uD83D\uDCA1 ";
      hintEl.appendChild(spark);
      var label = document.createElement("strong");
      label.textContent = "Hint: ";
      hintEl.appendChild(label);
      var hintSpan = document.createElement("span");
      hintSpan.innerHTML = level.hint;
      hintEl.appendChild(hintSpan);
      updateSolvedNote();
      handleInput();
    };
    hintEl.appendChild(reveal);
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

    // Hints are nudges, hidden behind a reveal button on every tier.
    if (hintEl) {
      hintEl.innerHTML = "";
      renderHintArea(level, hintEl);
    }

    if (diffEl) {
      diffEl.textContent = tierLabel(level.tier);
      diffEl.className = "jsd-level-difficulty " + level.tier;
    }
    if (ta) {
      ta.value =
        STATE.completed[STATE.currentLevel] && STATE.solutions[STATE.currentLevel]
          ? STATE.solutions[STATE.currentLevel]
          : level.starter || "";
      ta.placeholder = level.isFinal ? "Fix the boss case, detective!" : "Write your JavaScript here...";
    }
    if (pb) { pb.disabled = STATE.currentLevel === 0; pb.style.opacity = STATE.currentLevel === 0 ? "0.4" : "1"; }
    if (nb) { nb.disabled = false; nb.classList.toggle("ready", !!STATE.completed[STATE.currentLevel]); }
    if (cb) { cb.disabled = false; cb.classList.toggle("ready", !!STATE.completed[STATE.currentLevel]); }

    renderProgress();
    renderConsole([]);
    renderResult(null);
    updateSolvedNote();
    renderLineNumbers();
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
    if (ta) { ta.value = ""; renderLineNumbers(); }

    var nb = $("next-btn");
    if (nb) { nb.disabled = true; nb.classList.remove("ready"); }
    var pb = $("prev-btn");
    if (pb) { pb.disabled = false; pb.style.opacity = "1"; }
    var cb = $("check-btn");
    if (cb) cb.classList.remove("ready");

    hideOverlay();
    renderResult(null);
    var solvedNote = $("jsd-solved-note");
    if (solvedNote) { solvedNote.hidden = true; solvedNote.textContent = ""; }
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
    renderLineNumbers();
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
    renderResult(null);
    hideToast();
    if (STATE.completed[STATE.currentLevel]) {
      delete STATE.solutions[STATE.currentLevel];
      STATE.completed[STATE.currentLevel] = false;
      STATE.score = Math.max(0, STATE.score - pointsForLevel(level));
      var s = $("score-display");
      if (s) s.textContent = "Score: " + STATE.score;
      var nb = $("next-btn");
      if (nb) nb.classList.remove("ready");
      var cb = $("check-btn");
      if (cb) cb.classList.remove("ready");
      updateSolvedNote();
      renderProgress();
      emitProgress();
      publishState();
    }
  }

  function handleKey(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      checkAnswer();
      return;
    }
    var ta = $("js-editor");
    if (e.key === "Tab" && ta && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      var selStart = ta.selectionStart != null ? ta.selectionStart : ta.value.length;
      var selEnd = ta.selectionEnd != null ? ta.selectionEnd : ta.value.length;
      var before = ta.value.slice(0, selStart);
      var after = ta.value.slice(selEnd);
      ta.value = before + "  " + after;
      try {
        ta.selectionStart = ta.selectionEnd = before.length + 2;
      } catch (err) { /* non-editable stub environments */ }
      handleInput();
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
      ta.removeEventListener("scroll", syncEditorScroll);
      ta.addEventListener("scroll", syncEditorScroll);
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
    STATE.solutions = {};
    STATE.hintsDate = null;
    STATE.hintsUsed = 0;

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