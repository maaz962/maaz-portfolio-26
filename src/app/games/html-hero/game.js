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
      placeholder: "<h1>Hello World</h1>",
    },
    {
      id: 2,
      title: "Tell Your Story",
      difficulty: "easy",
      instruction:
        "Add a paragraph of text about yourself using the <p> tag.",
      hint: "Wrap a sentence in <code>&lt;p&gt;...&lt;/p&gt;</code> — try to make it at least 15 characters long.",
      accept: { tags: ["p"], minTextLength: 15 },
      starter: "",
      placeholder: "<p>I love building things for the web!</p>",
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
      placeholder: "<ul>\n  <li>Learn HTML</li>\n  <li>Master CSS</li>\n</ul>",
    },
    {
      id: 4,
      title: "Link It Up",
      difficulty: "easy",
      instruction:
        "Create a link using the <a> tag. It needs an href so clicking it actually goes somewhere.",
      hint: "Write <code>&lt;a href=\"https://...\"&gt;Link text&lt;/a&gt;</code> — the address goes inside the quotes.",
      accept: { tags: ["a"], attrs: [{ tag: "a", attr: "href" }] },
      starter: "",
      placeholder: '<a href="https://developer.mozilla.org">Learn more</a>',
    },
    {
      id: 5,
      title: "Picture Perfect",
      difficulty: "easy",
      instruction:
        "Show an image on your page with the <img> tag. A real image needs a src.",
      hint: "Use <code>&lt;img src=\"https://...\"&gt;</code> — note: img is a self-closing tag, no closing tag needed.",
      accept: { tags: ["img"], attrs: [{ tag: "img", attr: "src" }] },
      starter: "",
      placeholder: '<img src="https://picsum.photos/200" alt="A nice photo">',
    },
    {
      id: 6,
      title: "Numbered Steps",
      difficulty: "intermediate",
      instruction:
        "Give your visitor ordered steps using an ordered list (<ol>) with at least two items.",
      hint: "An <code>&lt;ol&gt;</code> numbers its items automatically — put <code>&lt;li&gt;</code> items inside.",
      accept: { tags: ["ol"], count: [{ tag: "li", min: 2 }] },
      starter: "",
      placeholder: "<ol>\n  <li>Open the editor</li>\n  <li>Write some HTML</li>\n</ol>",
    },
    {
      id: 7,
      title: "Shout & Whisper",
      difficulty: "intermediate",
      instruction:
        "Make one word <strong>bold</strong> and another <em>italic</em> inside a paragraph.",
      hint: "<code>&lt;strong&gt;</code> makes text bold, <code>&lt;em&gt;</code> makes it italic.",
      accept: { tags: ["strong", "em", "p"] },
      starter: "<p>This is a <strong>bold</strong> word... and this is the gray one.</p>",
      placeholder: "<p>HTML is <strong>powerful</strong> and <em>elegant</em>.</p>",
    },
    {
      id: 8,
      title: "Climb the Headings",
      difficulty: "intermediate",
      instruction:
        "Headings have levels! Use <h1>, <h2> and <h3> — biggest first.",
      hint: "<code>&lt;h1&gt;</code> is the biggest, <code>&lt;h2&gt;</code> smaller, <code>&lt;h3&gt;</code> smaller still. Structure your page as a news site would.",
      accept: { tags: ["h1", "h2", "h3"] },
      starter: "<h1>My News Site</h1>",
      placeholder: "<h1>Site Title</h1>\n<h2>Section</h2>\n<h3>Story</h3>",
    },
    {
      id: 9,
      title: "Table Time",
      difficulty: "intermediate",
      instruction:
        "Build a mini table with <table>, row(s) with <tr> and cells with <td> — at least 4 cells.",
      hint: "A table has <code>&lt;table&gt;</code> → <code>&lt;tr&gt;</code> (row) → <code>&lt;td&gt;</code> (cell). Define all cells first.",
      accept: { tags: ["table"], count: [{ tag: "td", min: 4 }] },
      starter: "",
      placeholder: "<table>\n  <tr>\n    <td>Name</td>\n    <td>Skill</td>\n  </tr>\n  <tr>\n    <td>Maaz</td>\n    <td>HTML</td>\n  </tr>\n</table>",
    },
    {
      id: 10,
      title: "Press the Button",
      difficulty: "intermediate",
      instruction:
        "Add a clickable <button> to your page so visitors can take action.",
      hint: "Write <code>&lt;button&gt;Click me&lt;/button&gt;</code> — the text between the tags is what people see.",
      accept: { tags: ["button"] },
      starter: "",
      placeholder: "<button>Join the adventure</button>",
    },
    {
      id: 11,
      title: "Boxes Everywhere",
      difficulty: "intermediate",
      instruction:
        "Use <div> to group things into a box and <span> to highlight a small piece of text inline.",
      hint: "<code>&lt;div&gt;</code> is a block container, <code>&lt;span&gt;</code> wraps text inline. Both need closing tags.",
      accept: { tags: ["div", "span"] },
      starter: "<h2>My Hobbies</h2>",
      placeholder: "<div>\n  <h2>Hobbies</h2>\n  <p>I love <span>coding</span> and <span>design</span>.</p>\n</div>",
    },
    {
      id: 12,
      title: "Nav Time",
      difficulty: "intermediate",
      instruction:
        "Build a navigation — wrap at least two links in a <nav> tag.",
      hint: "A <code>&lt;nav&gt;</code> holds the site menus. Put <code>&lt;a href=\"...\"&gt;</code> links inside it.",
      accept: {
        tags: ["nav", "a"],
        attrs: [{ tag: "a", attr: "href" }],
        count: [{ tag: "a", min: 2 }],
      },
      starter: "",
      placeholder: "<nav>\n  <a href=\"#home\">Home</a>\n  <a href=\"#about\">About</a>\n</nav>",
    },
    {
      id: 13,
      title: "Ask & Collect",
      difficulty: "advanced",
      instruction:
        "Create a form with <form>, an <input> field and a <label> that points to it with a for attribute.",
      hint: "Give the input an id and let the label's <code>for</code> match it — that links them together.",
      accept: {
        tags: ["form", "input", "label"],
        attrs: [{ tag: "label", attr: "for" }],
      },
      starter: "",
      placeholder: '<form>\n  <label for="city">Your city</label>\n  <input id="city" type="text">\n</form>',
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
      placeholder: "<select>\n  <option>Tea</option>\n  <option>Coffee</option>\n  <option>Water</option>\n</select>\n<textarea rows=\"3\">Write your thoughts...</textarea>",
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
      placeholder: "<header>\n  <h1>My Portfolio</h1>\n</header>\n<main>\n  <section>\n    <h2>About</h2>\n  </section>\n</main>\n<footer>\n  <p>&copy; 2026</p>\n</footer>",
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
      starter:
        "<header>\n  <h1>Maaz the Builder</h1>\n  <nav>\n    <a href=\"#work\">Work</a>\n    <a href=\"#about\">About</a>\n  </nav>\n</header>\n<main>\n  <section>\n    <article>\n      <h2>My latest project</h2>\n      <p>I built a game that teaches HTML!</p>\n      <img src=\"https://picsum.photos/240\" alt=\"Project screenshot\">\n      <ul>\n        <li>HTML</li>\n        <li>CSS</li>\n      </ul>\n      <a href=\"#\">Read more</a>\n      <button>Get in touch</button>\n    </article>\n  </section>\n</main>\n<footer>\n  <p>Made with love</p>\n</footer>",
      placeholder: "A complete page — you got this!",
      isFinal: true,
    },
  ];

  var SUCCESS_MSGS = [
    "That's exactly right! Your page does exactly what it should.",
    "Perfect! Look how it renders in the preview — that's HTML magic.",
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
    "Almost! You're on the right track — but the page still doesn't match the task.",
    "Nope, wrong code! Look at the hint and fix your tags.",
    "Not yet! Make sure your HTML contains what the task is asking for.",
  ];

  var STATE = { currentLevel: 0, score: 0, completed: {} };

  function $(id) { return document.getElementById(id); }
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  var VOID_TAGS = [
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "source", "track", "wbr",
  ];

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

  function getError(html) {
    var text = html || "";
    if (!text.trim()) {
      return "You haven't written any HTML yet. Type your code, then press Check!";
    }
    if (text.indexOf("<") === -1) {
      return "That doesn't look like HTML. Tags live between < and > — try one from the hint.";
    }
    var issue = tagIssues(text);
    if (issue) {
      if (issue.unclosed) {
        return "'<" + issue.unclosed + ">' isn't closed — every opening tag needs a matching </" + issue.unclosed + ">.";
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
      return "Close! Your <" + missingAttr.tag + "> tag needs a '" + missingAttr.attr + "' attribute — add it inside the <" + missingAttr.tag + ">.";
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
        return "Add a bit more text — your paragraph should be at least " + acc.minTextLength + " characters.";
      }
    }

    return randomItem(WRONG_MSGS);
  }

  function applyHTML(html) {
    var frame = $("html-preview");
    if (!frame) return;
    var doc = parseDoc(html);
    var bodyHtml = doc && doc.body ? doc.body.innerHTML : html || "";
    var full = /<\s*html[^>]*>/i.test(html || "")
      ? html
      : "<!DOCTYPE html><html><head><meta charset=\"utf-8\">" +
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
        "</head><body>" + bodyHtml + "</body></html>";
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
    STATE.score += 10;

    var s = $("score-display");
    if (s) s.textContent = "Score: " + STATE.score;

    var nb = $("next-btn");
    if (nb) { nb.disabled = false; nb.classList.add("ready"); }

    renderProgress();

    showToast("\u2713 Correct! Your page renders beautifully — see it in the preview.", false);

    setTimeout(function () {
      showOverlay(
        "Level Complete!",
        "Great job, code wrangler!",
        randomItem(SUCCESS_MSGS),
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
    } else {
      renderVictory();
    }
  }

  function prevLevel() {
    if (STATE.currentLevel > 0) {
      STATE.currentLevel--;
      renderLevel();
    }
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
    if (checkCompletion(text)) {
      completeLevel();
    } else {
      showToast(getError(text), true);
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
        d.textContent = "";
      }
      (function (idx) {
        d.addEventListener("click", function () {
          if (idx === STATE.currentLevel) return;
          STATE.currentLevel = idx;
          renderLevel();
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
    if (instrEl) instrEl.innerHTML = "Task: " + level.instruction;
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
      STATE.score = Math.max(0, STATE.score - 10);
      var s = $("score-display");
      if (s) s.textContent = "Score: " + STATE.score;
      var nb = $("next-btn");
      if (nb) nb.classList.remove("ready");
      renderProgress();
    }
  }

  function initGame() {
    var ta = $("html-editor");
    var pb = $("prev-btn");
    var nb = $("next-btn");
    var cb = $("check-btn");
    var rb = $("reset-btn");

    if (ta) {
      ta.removeEventListener("input", handleInput);
      ta.addEventListener("input", handleInput);
      ta.removeEventListener("keydown", handleKey);
      ta.addEventListener("keydown", handleKey);
    }
    if (pb) { pb.removeEventListener("click", prevLevel); pb.addEventListener("click", prevLevel); }
    if (cb) { cb.removeEventListener("click", checkAnswer); cb.addEventListener("click", checkAnswer); }
    if (nb) {
      var nextHandler = function () { nextLevel(); };
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

  function handleKey(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      checkAnswer();
    }
  }

  if (typeof window !== "undefined") {
    window.__initHtmlHero = function () { initGame(); };
  }
})();