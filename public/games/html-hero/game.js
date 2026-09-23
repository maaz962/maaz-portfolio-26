(function () {
  "use strict";

  var LEVELS = [
    {
      id: 1,
      title: "Hello, World!",
      difficulty: "easy",
      instruction:
        "Every webpage starts with a heading. Write an <h1> tag that says \"Hello World\".",
      hint: "Create the tag with <code>&lt;h1&gt;</code>, put the text in the middle, then close it with <code>&lt;/h1&gt;</code>.",
      accept: { tags: ["h1"], textContains: "hello world" },
      starter: "",
      placeholder: "Write your HTML here...",
    },
    {
      id: 2,
      title: "Tell Your Story",
      difficulty: "easy",
      instruction:
        "Add a paragraph of text about yourself using the <p> tag.",
      hint: "Wrap a sentence in <code>&lt;p&gt;...&lt;/p&gt;</code>. Try to make it at least 15 characters long.",
      accept: { tags: ["p"], minTextLength: 15 },
      starter: "",
      placeholder: "Write your HTML here...",
    },
    {
      id: 3,
      title: "Bullet the Facts",
      difficulty: "easy",
      instruction:
        "Make an unordered list (<ul>) with at least two bullet points (<li>).",
      hint: "Use <code>&lt;ul&gt;</code> for the list and a <code>&lt;li&gt;</code> inside it for every point.",
      accept: { tags: ["ul"], count: [{ tag: "li", min: 2 }] },
      starter: "",
      placeholder: "Write your HTML here...",
    },
    {
      id: 4,
      title: "Link It Up",
      difficulty: "easy",
      instruction:
        "Create a link using the <a> tag. It needs an href so clicking it actually goes somewhere.",
      hint: "Write <code>&lt;a href=\"https://...\"&gt;Link text&lt;/a&gt;</code>. The address goes inside the quotes.",
      accept: { tags: ["a"], attrs: [{ tag: "a", attr: "href" }] },
      starter: "",
      placeholder: "Write your HTML here...",
    },
    {
      id: 5,
      title: "Picture Perfect",
      difficulty: "easy",
      instruction:
        "Show an image on your page with the <img> tag. A real image needs a src.",
      hint: "Use <code>&lt;img src=\"https://...\"&gt;</code>. Img is a self-closing tag, so no closing tag is needed.",
      accept: { tags: ["img"], attrs: [{ tag: "img", attr: "src" }] },
      starter: "",
      placeholder: "Write your HTML here...",
    },
    {
      id: 6,
      title: "Numbered Steps",
      difficulty: "intermediate",
      instruction:
        "Give your visitor ordered steps using an ordered list (<ol>) with at least two items.",
      hint: "An <code>&lt;ol&gt;</code> numbers its items automatically. Put <code>&lt;li&gt;</code> items inside.",
      accept: { tags: ["ol"], count: [{ tag: "li", min: 2 }] },
      starter: "",
      placeholder: "Write your HTML here...",
    },
    {
      id: 7,
      title: "Shout & Whisper",
      difficulty: "intermediate",
      instruction:
        "Make one word <strong>bold</strong> and another <em>italic</em> inside a paragraph.",
      hint: "<code>&lt;strong&gt;</code> makes text bold, <code>&lt;em&gt;</code> makes it italic.",
      accept: { tags: ["strong", "em", "p"] },
      starter: "",
      placeholder: "Write your HTML here...",
    },
    {
      id: 8,
      title: "Climb the Headings",
      difficulty: "intermediate",
      instruction:
        "Headings have levels! Use <h1>, <h2> and <h3>, biggest first.",
      hint: "<code>&lt;h1&gt;</code> is the biggest, <code>&lt;h2&gt;</code> smaller, <code>&lt;h3&gt;</code> smaller still. Structure your page as a news site would.",
      accept: { tags: ["h1", "h2", "h3"] },
      starter: "",
      placeholder: "Write your HTML here...",
    },
    {
      id: 9,
      title: "Table Time",
      difficulty: "intermediate",
      instruction:
        "Build a mini table with <table>, row(s) with <tr> and cells with <td>. Aim for at least 4 cells.",
      hint: "A table has <code>&lt;table&gt;</code> → <code>&lt;tr&gt;</code> (row) → <code>&lt;td&gt;</code> (cell). Define all cells first.",
      accept: { tags: ["table"], count: [{ tag: "td", min: 4 }] },
      starter: "",
      placeholder: "Write your HTML here...",
    },
    {
      id: 10,
      title: "Press the Button",
      difficulty: "intermediate",
      instruction:
        "Add a clickable <button> to your page so visitors can take action.",
      hint: "Write <code>&lt;button&gt;Click me&lt;/button&gt;</code>. The text between the tags is what people see.",
      accept: { tags: ["button"] },
      starter: "",
      placeholder: "Write your HTML here...",
    },
    {
      id: 11,
      title: "Boxes Everywhere",
      difficulty: "intermediate",
      instruction:
        "Use <div> to group things into a box and <span> to highlight a small piece of text inline.",
      hint: "<code>&lt;div&gt;</code> is a block container, <code>&lt;span&gt;</code> wraps text inline. Both need closing tags.",
      accept: { tags: ["div", "span"] },
      starter: "",
      placeholder: "Write your HTML here...",
    },
    {
      id: 12,
      title: "Nav Time",
      difficulty: "intermediate",
      instruction:
        "Build a navigation. Wrap at least two links in a <nav> tag.",
      hint: "A <code>&lt;nav&gt;</code> holds the site menus. Put <code>&lt;a href=\"...\"&gt;</code> links inside it.",
      accept: {
        tags: ["nav", "a"],
        attrs: [{ tag: "a", attr: "href" }],
        count: [{ tag: "a", min: 2 }],
      },
      starter: "",
      placeholder: "Write your HTML here...",
    },
    {
      id: 13,
      title: "Ask & Collect",
      difficulty: "advanced",
      instruction:
        "Create a form with <form>, an <input> field and a <label> that points to it with a for attribute.",
      hint: "Give the input an id and let the label's <code>for</code> match it. That links them together.",
      accept: {
        tags: ["form", "input", "label"],
        attrs: [{ tag: "label", attr: "for" }],
      },
      starter: "",
      placeholder: "Write your HTML here...",
    },
    {
      id: 14,
      title: "Options Abound",
      difficulty: "advanced",
      instruction:
        "Give visitors a dropdown (<select>) with at least three <option>s, plus a <textarea> to write long answers.",
      hint: "<code>&lt;select&gt;</code> holds <code>&lt;option&gt;</code> choices. <code>&lt;textarea&gt;</code> is a big multiline input.",
      accept: {
        tags: ["select", "textarea"],
        count: [{ tag: "option", min: 3 }],
      },
      starter: "",
      placeholder: "Write your HTML here...",
    },
    {
      id: 15,
      title: "Semantic Structure",
      difficulty: "advanced",
      instruction:
        "Structure a real page with <header>, <main>, a <section> and a <footer>.",
      hint: "Semantic tags give meaning: <code>&lt;header&gt;</code> top, <code>&lt;main&gt;</code> middle, <code>&lt;footer&gt;</code> bottom. Sections split content.",
      accept: { tags: ["header", "main", "section", "footer", "h1"] },
      starter: "",
      placeholder: "Write your HTML here...",
    },
    {
      id: 16,
      title: "The Full Masterpiece",
      difficulty: "advanced",
      instruction:
        "FINAL CHALLENGE! Build a complete page: header, nav, main, section, article, footer, plus an img, a list, a link and a button.",
      hint: "Combine everything you've learned. Use <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;article&gt;</code>, <code>&lt;footer&gt;</code>, <code>&lt;h1&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;img&gt;</code>, <code>&lt;ul&gt;</code>, <code>&lt;a&gt;</code> and a <code>&lt;button&gt;</code>.",
      accept: {
        tags: [
          "header", "nav", "main", "section", "article", "footer",
          "h1", "p", "img", "ul", "a", "button",
        ],
      },
      starter: "",
      placeholder: "A complete page. You got this!",
      isFinal: true,
    },
  ];

  var SUCCESS_MSGS = [
    "That's exactly right! Your page does exactly what it should.",
    "Perfect! Look how it renders in the preview. That's HTML magic.",
    "Nailed it! You really understand this tag.",
    "Spot on! The browser renders it beautifully.",
    "Great work! You're becoming an HTML hero!",
    "That's it! Real HTML, real webpages, real power.",
    "Wonderful! Keep this up and you'll master the markup!",
    "Exactly right! See? HTML isn't so scary after all.",
    "You got it! Each tag unlocks a new part of the page.",
    "Beautiful! That's a clean, correct tag.",
  ];

  var WRONG_MSGS = [
    "Not quite right yet. Compare your tags with the hint and try again!",
    "Hmm, that doesn't solve this level. Check the hint below.",
    "Almost! You're on the right track, but the page still doesn't match the task.",
    "Nope, wrong code! Look at the hint and fix your tags.",
    "Not yet! Make sure your HTML contains what the task is asking for.",
  ];

  var STATE = { currentLevel: 0, score: 0, completed: {} };

  var POINTS = { easy: 3, intermediate: 7, advanced: 9 };

  function pointsForLevel(level) {
    return POINTS[level.difficulty] || 3;
  }

  function emitProgress() {
    if (typeof window !== "undefined" && typeof window.__onHtmlHeroProgress === "function") {
      window.__onHtmlHeroProgress({
        currentLevel: STATE.currentLevel,
        score: STATE.score,
        completed: STATE.completed,
        totalLevels: LEVELS.length,
      });
    }
    publishState();
  }

  function publishState() {
    if (typeof window === "undefined") return;
    try {
      window.dispatchEvent(
        new CustomEvent("hh-state", {
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
    if (typeof saved.currentLevel === "number" && saved.currentLevel >= 0 && saved.currentLevel < LEVELS.length) {
      STATE.currentLevel = Math.floor(saved.currentLevel);
    }
    if (typeof saved.score === "number") STATE.score = saved.score;
    if (saved.completed && typeof saved.completed === "object") STATE.completed = saved.completed;
    var s = $("score-display");
    if (s) s.textContent = "Score: " + STATE.score;
    renderLevel();
    publishState();
  }

  function $(id) { return document.getElementById(id); }
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  var VOID_TAGS = [
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "source", "track", "wbr",
  ];

  function escHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function parseDoc(html) {
    try {
      return new DOMParser().parseFromString(html || "", "text/html");
    } catch (e) {
      return null;
    }
  }

  function checkCompletion(html) {
    var level = LEVELS[STATE.currentLevel];
    if (!level) return false;
    var doc = parseDoc(html);
    if (!doc || !doc.body) return false;

    var acc = level.accept;

    for (var i = 0; i < acc.tags.length; i++) {
      if (doc.body.querySelectorAll(acc.tags[i]).length === 0) return false;
    }

    var attrs = acc.attrs || [];
    for (var a = 0; a < attrs.length; a++) {
      var els = doc.body.querySelectorAll(attrs[a].tag);
      var found = false;
      for (var e = 0; e < els.length; e++) {
        if (els[e].hasAttribute(attrs[a].attr)) { found = true; break; }
      }
      if (!found) return false;
    }

    var counts = acc.count || [];
    for (var c = 0; c < counts.length; c++) {
      if (doc.body.querySelectorAll(counts[c].tag).length < counts[c].min) return false;
    }

    if (acc.textContains) {
      var text = (doc.body.textContent || "").toLowerCase();
      if (text.indexOf(acc.textContains.toLowerCase()) === -1) return false;
    }

    if (acc.minTextLength) {
      var bodyText = (doc.body.textContent || "").trim();
      if (bodyText.length < acc.minTextLength) return false;
    }

    return true;
  }

  function tagIssues(html) {
    var stack = [];
    var re = /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9-]*)([^<>]*?)(\/)?\s*>/g;
    var m;
    while ((m = re.exec(html)) !== null) {
      var closing = m[1] === "/";
      var name = (m[2] || "").toLowerCase();
      var selfClose = m[4] === "/";
      if (!name) continue;
      if (VOID_TAGS.indexOf(name) !== -1) continue;
      if (selfClose) continue;
      if (closing) {
        var prev = stack.pop();
        if (prev !== name) {
          return prev !== undefined
            ? { mismatch: name, expected: prev }
            : { stray: name };
        }
      } else {
        if (/<\/?script/i.test(m[0])) continue;
        stack.push(name);
      }
    }
    if (stack.length) return { unclosed: stack[stack.length - 1] };
    return null;
  }

  // Structural syntax gate (runs BEFORE the forgiving DOM check). Browsers
  // auto-correct malformed markup, so without this a submission like
  // '<h1>hello world /h1>', missing the '<' on the closing tag, would pass
  // by rendering as-if valid. Returns a message string, or null when OK.
  function htmlSyntaxError(html) {
    var text = html || "";
    if (!text.trim()) return null;
    if (text.indexOf("<") === -1) {
      return "That doesn't look like HTML. Tags live between < and >. Try one from the hint.";
    }

    // A closing tag typed without its '<' (e.g. "/h1>" inside text). The
    // lookbehind skips properly-written </tags>, so only truly bare closes are
    // matched; the open-check ensures it's really a tag the author opened.
    var bareClose = /(?<!<)\/([a-zA-Z][a-zA-Z0-9-]*)\s*[^<>]*>/g;
    var m;
    while ((m = bareClose.exec(text)) !== null) {
      var name = (m[1] || "").toLowerCase();
      if (VOID_TAGS.indexOf(name) !== -1) continue;
      var openRe = new RegExp("<\\s*" + name + "\\b", "i");
      if (openRe.test(text)) {
        return "Your closing tag is missing '<'. It should be `</" + name + ">`, not `/" + name + ">`.";
      }
    }

    var voidCloseRe = /<\s*\/\s*(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)\s*>/i;
    var vm = voidCloseRe.exec(text);
    if (vm) {
      return "A void tag like <" + vm[1] + "> doesn't need a closing tag. Remove the </" + vm[1] + ">.";
    }

    var issue = tagIssues(text);
    if (issue) {
      if (issue.unclosed) {
        return "'<" + issue.unclosed + ">' isn't closed. Every opening tag needs a matching </" + issue.unclosed + ">.";
      }
      if (issue.mismatch) {
        return "Oops! '</" + issue.mismatch + ">' doesn't close the last tag you opened ('<" + issue.expected + ">'). Check your nesting.";
      }
      if (issue.stray) {
        return "You have a closing '</" + issue.stray + ">' tag, but I don't see an opening one. Check your code.";
      }
    }
    return null;
  }

  function getError(html) {
    var text = html || "";
    if (!text.trim()) {
      return "You haven't written any HTML yet. Type your code, then press Check!";
    }
    if (text.indexOf("<") === -1) {
      return "That doesn't look like HTML. Tags live between < and >. Try one from the hint.";
    }
    var issue = tagIssues(text);
    if (issue) {
      if (issue.unclosed) {
        return "'<" + issue.unclosed + ">' isn't closed. Every opening tag needs a matching </" + issue.unclosed + ">.";
      }
      if (issue.mismatch) {
        return "Oops! '</" + issue.mismatch + ">' doesn't close the last tag you opened ('<" + issue.expected + ">'). Check your nesting.";
      }
      if (issue.stray) {
        return "You have a closing '</" + issue.stray + ">' tag, but I don't see an opening one. Check your code.";
      }
    }

    var level = LEVELS[STATE.currentLevel];
    var doc = parseDoc(text);
    var acc = level.accept;

    var missingTags = [];
    for (var i = 0; i < acc.tags.length; i++) {
      if (!doc || !doc.body || doc.body.querySelectorAll(acc.tags[i]).length === 0) {
        missingTags.push(acc.tags[i]);
      }
    }
    if (missingTags.length === 1) {
      return "Almost! You're still missing a <" + missingTags[0] + "> tag.";
    }
    if (missingTags.length > 1) {
      return "Almost! You're missing these tags: <" + missingTags.join(">, <") + ">.";
    }

    var attrs = acc.attrs || [];
    var missingAttr = null;
    for (var a = 0; a < attrs.length; a++) {
      var els = doc.body.querySelectorAll(attrs[a].tag);
      var found = false;
      for (var e = 0; e < els.length; e++) {
        if (els[e].hasAttribute(attrs[a].attr)) { found = true; break; }
      }
      if (!found) { missingAttr = { tag: attrs[a].tag, attr: attrs[a].attr }; break; }
    }
    if (missingAttr) {
      return "Close! Your <" + missingAttr.tag + "> tag needs a '" + missingAttr.attr + "' attribute. Add it inside the <" + missingAttr.tag + ">.";
    }

    var counts = acc.count || [];
    for (var c = 0; c < counts.length; c++) {
      var cnt = doc.body.querySelectorAll(counts[c].tag).length;
      if (cnt < counts[c].min) {
        return "You have " + cnt + " <" + counts[c].tag + "> tag(s) but this level wants at least " + counts[c].min + ".";
      }
    }

    if (acc.textContains) {
      var text2 = (doc.body.textContent || "").toLowerCase();
      if (text2.indexOf(acc.textContains.toLowerCase()) === -1) {
        return "The tags are right, but the page should say \"" + acc.textContains + "\" somewhere.";
      }
    }

    if (acc.minTextLength) {
      var bodyText = (doc.body.textContent || "").trim();
      if (bodyText.length < acc.minTextLength) {
        return "Add a bit more text. Your paragraph should be at least " + acc.minTextLength + " characters.";
      }
    }

    return randomItem(WRONG_MSGS);
  }

  function applyHTML(html) {
    var frame = $("html-preview");
    if (!frame) return;
    var h = html || "";
    // Feed the raw source into srcdoc so the preview mirrors exactly what was
    // typed; no re-serialization/auto-correction of the user's characters.
    var full = /<\s*(html|!doctype)[\s>]/i.test(h)
      ? h
      : "<!DOCTYPE html><html><head><meta charset=\"utf-8\">" +
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
        "</head><body>" + h + "</body></html>";
    frame.srcdoc = full;
  }

  function showToast(msg, isError) {
    var t = $("toast");
    if (!t) return;
    t.textContent = (isError ? "\u2715 " : "\u2713 ") + msg;
    t.className = "hh-status-toast " + (isError ? "error" : "success");
    t.style.display = "flex";
    t.style.opacity = "1";
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.style.opacity = "0"; }, isError ? 5000 : 2500);
  }

  function hideToast() {
    var t = $("toast");
    if (t) { t.style.opacity = "0"; clearTimeout(t._timer); }
  }

  function renderResult(o) {
    var el = $("hh-result");
    if (!el) return;
    el.innerHTML = "";
    if (!o || !o.text) {
      el.hidden = true;
      el.className = "hh-result";
      return;
    }
    el.hidden = false;
    el.className = "hh-result " + (o.state || "");
    var icon = document.createElement("span");
    icon.className = "hh-result-icon";
    icon.textContent = o.icon || "";
    var body = document.createElement("span");
    body.className = "hh-result-body";
    if (o.title) {
      var title = document.createElement("strong");
      title.textContent = o.title + " ";
      body.appendChild(title);
    }
    body.appendChild(document.createTextNode(o.text));
    el.appendChild(icon);
    el.appendChild(body);
  }

  function updateSolvedNote() {
    var note = $("hh-solved-note");
    if (!note) return;
    if (STATE.completed[STATE.currentLevel]) {
      note.hidden = false;
      note.textContent = "Solved! Answers are saved - you can return to this level anytime.";
    } else {
      note.hidden = true;
      note.textContent = "";
    }
  }

  function handleRun() {
    var ta = $("html-editor");
    if (!ta) return;
    applyHTML(ta.value);
    hideToast();
  }

  function showOverlay(title, sub, msg, btnText, action) {
    var o = $("overlay");
    if (!o) return;
    var t = qs(".hh-complete-text", o);
    var s = qs(".hh-complete-sub", o);
    var m = qs(".hh-complete-msg", o);
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

  function completeLevel() {
    if (STATE.completed[STATE.currentLevel]) return;
    STATE.completed[STATE.currentLevel] = true;
    STATE.score += pointsForLevel(LEVELS[STATE.currentLevel]);

    var s = $("score-display");
    if (s) s.textContent = "Score: " + STATE.score;

    var nb = $("next-btn");
    if (nb) { nb.disabled = false; nb.classList.add("ready"); }

    renderProgress();
    emitProgress();
    updateSolvedNote();
    renderResult({
      state: "pass",
      icon: "✓",
      title: "Correct!",
      text: "+" + pointsForLevel(LEVELS[STATE.currentLevel]) + " XP · Your page renders perfectly. Nice work.",
    });

    showToast("\u2713 Correct! Your page renders beautifully. See it in the preview.", false);

    setTimeout(function () {
      showOverlay(
        "Case Solved!",
        "Great job, code wrangler!",
        "+" + pointsForLevel(LEVELS[STATE.currentLevel]) + " XP · Saved to your profile",
        LEVELS[STATE.currentLevel].isFinal ? "Finish & See Results \u2B50" : "Next Level \u2192",
        function () { nextLevel(); }
      );
    }, 1500);
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

  function isLevelUnlocked(i) {
    return i >= 0 && i < LEVELS.length;
  }

  function gotoLevel(index) {
    var i = index | 0;
    if (i < 0 || i >= LEVELS.length) return;
    if (!isLevelUnlocked(i)) {
      showToast("This level is locked - solve the earlier levels to unlock it.", true);
      return;
    }
    STATE.currentLevel = i;
    renderLevel();
    emitProgress();
  }

  function nextHandler() {
    nextLevel();
  }

  function checkAnswer() {
    var ta = $("html-editor");
    if (!ta) return;
    var text = ta.value;
    applyHTML(text);
    if (STATE.completed[STATE.currentLevel]) {
      nextLevel();
      return;
    }
    var syntaxErr = htmlSyntaxError(text);
    if (syntaxErr) {
      renderResult({
        state: "error",
        icon: "⚠️",
        title: "Syntax Error",
        text: syntaxErr,
      });
      showToast(syntaxErr, true);
      return;
    }
    if (checkCompletion(text)) {
      completeLevel();
    } else {
      var err = getError(text);
      renderResult({
        state: "fail",
        icon: "✕",
        title: "Not Quite",
        text: err,
      });
      showToast(err, true);
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
        "hh-progress-dot" +
        (i === STATE.currentLevel ? " current" : "") +
        (STATE.completed[i] ? " done" : "");
      d.setAttribute("aria-label", "Level " + (i + 1) + (STATE.completed[i] ? " (completed)" : ""));
      d.title = "Level " + (i + 1) + (STATE.completed[i] ? " \u2713" : "");
      if (STATE.completed[i]) {
        d.innerHTML = "\u2713";
      } else {
        d.textContent = String(i + 1);
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
    var ta = $("html-editor");
    var nb = $("next-btn");
    var pb = $("prev-btn");
    var cb = $("check-btn");

    if (titleEl) titleEl.textContent = level.title;
    if (numEl) numEl.textContent = level.id;
    if (instrEl) instrEl.innerHTML = "Task: " + escHtml(level.instruction);
    if (hintEl) hintEl.innerHTML = "Hint: " + level.hint;
    if (diffEl) {
      diffEl.textContent = level.difficulty.charAt(0).toUpperCase() + level.difficulty.slice(1);
      diffEl.className = "hh-difficulty " + level.difficulty;
    }
    if (ta) {
      ta.value = level.starter || "";
      ta.placeholder = level.placeholder || "";
    }
    if (pb) { pb.disabled = STATE.currentLevel === 0; pb.style.opacity = STATE.currentLevel === 0 ? "0.4" : "1"; }
    if (nb) {
      var done = STATE.completed[STATE.currentLevel];
      nb.disabled = false;
      nb.classList.toggle("ready", !!done);
    }
    if (cb) { cb.disabled = false; cb.classList.toggle("ready", !!STATE.completed[STATE.currentLevel]); }

    renderProgress();
    applyHTML(level.starter || "");
    updateSolvedNote();
    renderResult(null);
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
    if (i) i.textContent = "Task: You wrote HTML for real. You're officially an HTML Master!";
    if (h) h.innerHTML = "Hint: You can now build any kind of webpage. Share your score with friends!";
    if (d) { d.textContent = "Master"; d.className = "hh-difficulty advanced"; }

    var frame = $("html-preview");
    if (frame) {
      frame.removeAttribute("srcdoc");
      frame.srcdoc =
        "<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'>" +
        "<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;background:linear-gradient(135deg,#312e81,#4c1d95);color:#fff;text-align:center;padding:24px;box-sizing:border-box}" +
        ".t{font-size:4rem;margin-bottom:10px}.a{font-size:2rem}.b{font-weight:800;font-size:1.4rem;margin:10px 0}.c{opacity:.8;font-size:.9rem;max-width:340px;line-height:1.6}</style></head>" +
        "<body><div><div class='t'>" + stars + "</div><div class='a'>\uD83C\uDF89\uD83E\uDDD9\u200D\u2642\uFE0F\uD83C\uDF89</div>" +
        "<div class='b'>HTML Master!</div><div class='c'>You finished all " + LEVELS.length + " levels. Score: " + STATE.score + " | Levels: " + done + "/" + LEVELS.length + "</div></div></body></html>";
    }

    hideOverlay();
    var ta = $("html-editor");
    if (ta) ta.value = "";
    var nb = $("next-btn");
    if (nb) { nb.disabled = true; nb.classList.remove("ready"); }
    var pb = $("prev-btn");
    if (pb) { pb.disabled = false; pb.style.opacity = "1"; }
    renderProgress();
  }

  function handleInput() {
    var ta = $("html-editor");
    if (!ta) return;
    applyHTML(ta.value);
    if (STATE.completed[STATE.currentLevel]) {
      hideToast();
    }
  }

  function handleReset() {
    var level = LEVELS[STATE.currentLevel];
    var ta = $("html-editor");
    if (!ta) return;
    ta.value = level.starter || "";
    hideToast();
    applyHTML(level.starter || "");
    if (STATE.completed[STATE.currentLevel]) {
      STATE.completed[STATE.currentLevel] = false;
      STATE.score = Math.max(0, STATE.score - pointsForLevel(level));
      var s = $("score-display");
      if (s) s.textContent = "Score: " + STATE.score;
      var nb = $("next-btn");
      if (nb) nb.classList.remove("ready");
      renderProgress();
      emitProgress();
    }
  }

  function handleClear() {
    var level = LEVELS[STATE.currentLevel];
    var ta = $("html-editor");
    if (!ta) return;
    ta.value = level.starter || "";
    hideToast();
    applyHTML(level.starter || "");
  }

  function initGame() {
    var ta = $("html-editor");
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
    if (rb) { rb.removeEventListener("click", handleRun); rb.addEventListener("click", handleRun); }
    if (cb) { cb.removeEventListener("click", checkAnswer); cb.addEventListener("click", checkAnswer); }
    if (nb) {
      nb.removeEventListener("click", nextHandler);
      nb.addEventListener("click", nextHandler);
    }
    var clr = $("clear-btn");
    if (clr) { clr.removeEventListener("click", handleClear); clr.addEventListener("click", handleClear); }

    STATE.currentLevel = 0;
    STATE.score = 0;
    STATE.completed = {};

    var s = $("score-display");
    if (s) s.textContent = "Score: 0";

    renderLevel();
  }

  function handleKey(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      checkAnswer();
    }
  }

  if (typeof window !== "undefined") {
    window.__initHtmlHero = function () { initGame(); };
    window.__resumeHtmlHero = function (saved) { resumeGame(saved); };
    window.__getHtmlHeroState = function () {
      return {
        currentLevel: STATE.currentLevel,
        score: STATE.score,
        completed: STATE.completed,
        totalLevels: LEVELS.length,
      };
    };
    window.__getHtmlHeroLevels = function () {
      return LEVELS.map(function (lv) {
        return { id: lv.id, title: lv.title, difficulty: lv.difficulty };
      });
    };
    window.__goToHtmlHeroLevel = function (index) { gotoLevel(index); };
  }
})();