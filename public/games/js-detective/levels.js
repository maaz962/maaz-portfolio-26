/* ==========================================================================
   JS DETECTIVE: Level Data (18 cases across 4 difficulty tiers:
   Beginner, Easy, Intermediate, Most Hard. No Hard tier.)
   Sets window.LJS_LEVELS for the browser. game.js no longer depends on this
   executing first; it re-reads window.LJS_LEVELS lazily and polls until the
   data arrives, so script execution order between the two files is safe.
   Also usable from Node (module.exports) so levels can be validated
   headlessly with the same stubs + check functions the browser uses.
   ========================================================================== */

/* ---------- DOM/BOM/fetch stubs used by the harder levels ---------- */

function mkElement(tag) {
  var el = {
    tagName: String(tag || "div").toUpperCase(),
    children: [],
    parent: null,
    attrs: {},
    listeners: {},
    _classes: [],
    _className: "",
    textContent: "",
    innerHTML: "",
    style: {},
    setAttribute: function (k, v) { el.attrs[k] = String(v); return el; },
    getAttribute: function (k) { return k in el.attrs ? el.attrs[k] : null; },
    hasAttribute: function (k) { return k in el.attrs; },
    appendChild: function (child) {
      if (child && child.parent === el) { el.removeChild(child); }
      if (child) { child.parent = el; el.children.push(child); }
      return child;
    },
    removeChild: function (child) {
      var i = el.children.indexOf(child);
      if (i > -1) el.children.splice(i, 1);
      if (child) child.parent = null;
      return child;
    },
    remove: function () { if (el.parent) el.parent.removeChild(el); return el; },
    addEventListener: function (type, fn) {
      (el.listeners[type] = el.listeners[type] || []).push(fn);
      return el;
    },
    dispatch: function (type, opts) {
      var target = opts && opts.target ? opts.target : el;
      var st = {
        type: type,
        target: target,
        currentTarget: null,
        defaultPrevented: false,
        preventDefault: function () { st.defaultPrevented = true; },
      };
      var node = target;
      while (node) {
        st.currentTarget = node;
        (node.listeners[type] || []).slice().forEach(function (fn) { fn(st); });
        node = node.parent;
      }
      return st;
    },
  };
  el._syncClassName = function () {
    el._className = el._classes.join(" ");
  };
  Object.defineProperty(el, "className", {
    get: function () { return el._className; },
    set: function (v) {
      el._className = String(v || "");
      el._classes = el._className.length ? el._className.split(/\s+/) : [];
    },
  });
  Object.defineProperty(el, "classList", {
    get: function () {
      return {
        add: function (c) {
          c = String(c);
          if (el._classes.indexOf(c) === -1) { el._classes.push(c); el._syncClassName(); }
          return el;
        },
        remove: function (c) {
          var i = el._classes.indexOf(String(c));
          if (i > -1) { el._classes.splice(i, 1); el._syncClassName(); }
          return el;
        },
        toggle: function (c, force) {
          var on = force !== undefined ? !!force : el._classes.indexOf(String(c)) === -1;
          if (on) el.classList.add(c); else el.classList.remove(c);
          return on;
        },
        contains: function (c) { return el._classes.indexOf(String(c)) > -1; },
      };
    },
  });
  return el;
}

function mkDocument(specs) {
  var byId = {};
  var body = mkElement("body");
  (specs || []).forEach(function (s) {
    var id = typeof s === "string" ? s : s.id;
    var tag = typeof s === "string" ? "div" : s.tag;
    var el = mkElement(tag);
    el._id = id;
    byId[id] = el;
  });
  return {
    body: body,
    elements: byId,
    getElementById: function (id) { return byId[id] || null; },
    createElement: function (tag) { return mkElement(tag); },
    querySelector: function (sel) {
      if (!sel) return null;
      if (sel.charAt(0) === "#") return byId[sel.slice(1)] || null;
      if (sel === "body") return body;
      return null;
    },
    dispatch: function (type, opts) { return body.dispatch(type, opts); },
  };
}

function mkStorage(seed) {
  var map = {};
  for (var k in (seed || {})) {
    if (Object.prototype.hasOwnProperty.call(seed, k)) map[k] = seed[k];
  }
  return {
    getItem: function (k) { return k in map ? map[k] : null; },
    setItem: function (k, v) { map[k] = String(v); },
    removeItem: function (k) { delete map[k]; },
  };
}

function mkWindow() {
  var w = {
    navigator: {
      userAgent: "JSDetectiveAgent/1.0 (headless-test)",
      platform: "Test",
      language: "en",
    },
    location: { href: "/case/1", hostname: "detective.test", pathname: "/case/1" },
    localStorage: mkStorage({}),
    sessionStorage: mkStorage({}),
    innerWidth: 1280,
    innerHeight: 800,
  };
  w.history = {
    len: 1,
    pushState: function (state, title, url) {
      w.history.len++;
      if (typeof url === "string") {
        w.location.href = url;
        w.location.pathname = url;
      }
    },
  };
  return w;
}

function mkFetch(data) {
  return function (url) {
    var bad = false;
    if (url && (String(url).indexOf("fail") > -1 || String(url).indexOf("broken") > -1)) bad = true;
    if (bad) return Promise.reject(new Error("Network error"));
    return Promise.resolve({
      ok: true,
      status: 200,
      json: function () { return Promise.resolve(data); },
      text: function () { return Promise.resolve(String(data)); },
    });
  };
}

/* ---------- Level data ---------- */

var LJS_LEVELS = [
  {
    id: 1,
    title: "Your First Clue",
    tier: "beginner",
    concepts: ["console", "strings"],
    shortDesc: "first console.log",
    instruction:
      'Your first day on the force. The department just wants proof the console can speak. Log the exact message <code>Hello, Detective!</code> on its own line.',
    hint:
      'Use <code>console.log(...)</code> and put the exact text <code>Hello, Detective!</code> between quotes. The console prints whatever string you hand it, cleanly, on one line.',
    starter: "",
    check: function (ctx, logs) {
      return logs.some(function (l) { return String(l.value) === "Hello, Detective!"; });
    },
    successNote: "console.log is how a detective announces clues: one line, exactly the message asked for.",
  },
  {
    id: 2,
    title: "The Missing Word",
    tier: "beginner",
    concepts: ["strings", "operators"],
    shortDesc: "joining strings with +",
    instruction:
      'Two fragments of a clue have been recovered: <code>"The suspect is "</code> and <code>"Ada"</code>. Join them into one string with the <code>+</code> operator and log the full sentence. It must print <code>The suspect is Ada</code>.',
    hint:
      'A <code>+</code> between two strings stitches them into one. Log the joined result on a single line. The trailing space inside the first fragment keeps the words apart.',
    starter: "",
    check: function (ctx, logs) {
      return logs.some(function (l) { return String(l.value) === "The suspect is Ada"; });
    },
    successNote: "The + operator glues strings together. Order and spacing decide the sentence.",
  },
  {
    id: 3,
    title: "The Safe Combination",
    tier: "beginner",
    concepts: ["numbers", "operators"],
    shortDesc: "arithmetic with numbers",
    instruction:
      'The safe opens at a three-number combination. Log the result of <code>6 * 7</code>, then the result of <code>10 - 3</code>, then the result of <code>20 / 4</code>. Three lines, in that order.',
    hint:
      'One <code>console.log</code> per expression. JavaScript does the arithmetic for you. Hand each whole expression to the log and read the computed result.',
    starter: "",
    check: function (ctx, logs) {
      return !!logs && logs.length >= 3 &&
        logs[0].value === 42 &&
        logs[1].value === 7 &&
        logs[2].value === 5;
    },
    successNote: "*, - and / do the math; each console.log prints the calculated result, not the equation.",
  },
  {
    id: 4,
    title: "The Suspect File",
    tier: "beginner",
    concepts: ["variables"],
    shortDesc: "declare + log variables",
    instruction:
      'Create a new suspect file. Declare a variable <code>suspect</code> holding the string <code>"Riley"</code>, then declare <code>evidence</code> holding the number <code>12</code>. Log <code>suspect</code> first, then <code>evidence</code>. Two lines in total.',
    hint:
      'Use <code>let</code> or <code>const</code> to store a value under a name, then put that name inside <code>console.log(...)</code>. Two declarations, two logs, in order.',
    starter: "",
    check: function (ctx, logs) {
      return !!logs && logs.length >= 2 &&
        String(logs[0].value) === "Riley" &&
        logs[1].value === 12;
    },
    successNote: "Variables give values reusable names. The next tier puts them to work.",
  },
  {
    id: 5,
    title: "First Prints",
    tier: "easy",
    concepts: ["variables", "data-types"],
    shortDesc: "Variables + first console output",
    instruction:
      'Our very first case. Declare a variable <code>name</code> holding the string "Ada" and a variable <code>age</code> holding the number 36. Then log the sentence <code>Ada is 36</code> using <em>any</em> string-building technique.',
    hint:
      'Store <code>name</code> and <code>age</code> in variables first, then print one sentence reading <code>Ada is 36</code>. You can join values with <code>+</code>, or drop them into a template literal with <code>${...}</code>. Either way works.',
    starter: "",
    check: function (ctx, logs) {
      return logs.some(function (l) { return String(l.value) === "Ada is 36"; });
    },
    successNote: "Variables store data you can reuse. Everything else builds on this.",
  },
  {
    id: 6,
    title: "The Type Trap",
    tier: "easy",
    concepts: ["data-types", "operators"],
    shortDesc: "typeof traps: [] and null",
    instruction:
      "Every detective should know their data types. Log the result of <code>typeof []</code>, <code>typeof null</code>, <code>typeof 42</code>, and <code>typeof \"hi\"</code>. One per line, in that order. Then log the string <code>typeof [] is object</code>.",
    hint:
      'Five lines in total: four <code>typeof</code> results in the given order, then the exact sentence. Run the four types and read the output. <code>[]</code> and <code>null</code> have a well-known surprise.',
    starter: "",
    check: function (ctx, logs) {
      var expect = ["object", "object", "number", "string"];
      if (!logs || logs.length < 5) return false;
      for (var i = 0; i < 4; i++) {
        if (logs[i].value !== expect[i]) return false;
      }
      return logs.some(function (l) { return String(l.value) === "typeof [] is object"; });
    },
    successNote: "typeof tells you a value's type, but [] and null are famous traps.",
  },
  {
    id: 7,
    title: "Strict or Loose",
    tier: "easy",
    concepts: ["operators", "data-types"],
    shortDesc: "== vs === and coercion",
    instruction:
      'The corner store hands you two IDs that look identical at a glance: a variable <code>str</code> holding the string "10", and a variable <code>num</code> holding the number 10. Compare them exactly twice, logging both results in order. For the first comparison use the loose equality operator, the one that converts types before comparing. For the second use the strict equality operator, which never converts. The two operators will not agree here, and your job is to run both and see which is which.',
    hint:
      'Both variables are handed to you. Compare them twice in the required order. One test uses <code>==</code>, the other <code>===</code>. Only one operator refuses to convert types before comparing.',
    starter: "",
    setUp: 'ctx.str = "10";\nctx.num = 10;',
    check: function (ctx, logs) {
      return !!logs && logs[0] && logs[0].value === true && logs[1] && logs[1].value === false;
    },
    successNote: "=== never coerces. When in doubt, prefer the strict triple-equals.",
  },
  {
    id: 8,
    title: "The Grade Defector",
    tier: "easy",
    concepts: ["control-flow"],
    shortDesc: "if/else chain + switch",
    instruction:
      'Write a function <code>grade(score)</code> that returns "A" for 90+, "B" for 80+, "C" for 70+, and "F" otherwise (use an if/else chain with nested branches). Log <code>grade(85)</code>, <code>grade(91)</code>, and <code>grade(69)</code> in order. Next, a <code>badge</code> variable equals "silver". Use a <code>switch</code> so "gold" logs "rank 1", "silver" logs "rank 2", anything else logs "unranked". Then log the result.',
    hint:
      'Write <code>grade</code> step by step. Start with the highest range (90+) and work downwards, returning early. For the second half, <code>badge</code> is already set up for you; a <code>switch</code> lists each rank as its own <code>case</code>, each ending with <code>break</code>.',
    starter: "",
    setUp: 'ctx.badge = "silver";',
    check: function (ctx, logs) {
      return !!logs && logs.length >= 4 &&
        String(logs[0].value) === "B" &&
        String(logs[1].value) === "A" &&
        String(logs[2].value) === "F" &&
        String(logs[3].value) === "rank 2";
    },
    successNote: "if/else chains steer your code; switch handles many fixed cases cleanly.",
  },
  {
    id: 9,
    title: "Count Every Step",
    tier: "intermediate",
    concepts: ["loops"],
    shortDesc: "for + while loops",
    instruction:
      "Count the steps. Log the numbers 1 through 5 with a <code>for</code> loop (one per line). Then use a <code>while</code> loop to add up 1 + 2 + 3 + 4 + 5 and log the total. It must print 15.",
    hint:
      'Two loops: a <code>for</code> that prints 1 through 5 one per line, then a <code>while</code> that keeps adding into a running total. Log the total only after the loop finishes. It must be 15.',
    starter: "",
    check: function (ctx, logs) {
      if (!logs || logs.length < 6) return false;
      for (var i = 0; i < 5; i++) {
        if (logs[i].value !== i + 1) return false;
      }
      return logs.some(function (l) { return l.value === 15; });
    },
    successNote: "for repeats a known count; while repeats while a condition holds.",
  },
  {
    id: 10,
    title: "Clue Upgrade",
    tier: "intermediate",
    concepts: ["arrays", "arrow-functions"],
    shortDesc: "push, map, filter",
    instruction:
      'The evidence list <code>clues</code> is already in your hands. It needs one more piece of evidence: add the string "lock" to the end of the array using the <code>push</code> method. Then use the <code>map</code> method to re-print every clue in ALL CAPS and log the result. It should read as three uppercase entries. Finally, use the <code>filter</code> method so only the clues whose uppercase text contains the letter "K" survive. Exactly two entries should pass. Log that trimmed result too.',
    hint:
      '<code>clues</code> is provided as a two-item array. <code>push</code> appends one more item; <code>map</code> runs a transform on every element (uppercase here); <code>filter</code> keeps only elements that pass a test such as <code>includes("K")</code>.',
    starter: "",
    setUp: 'ctx.clues = ["key", "map"];',
    check: function (ctx, logs) {
      var arrA = false, arrB = false;
      logs.forEach(function (l) {
        var v = l.value;
        if (Array.isArray(v) && v.length === 3 && v[0] === "KEY" && v[1] === "MAP" && v[2] === "LOCK") arrA = true;
        if (Array.isArray(v) && v.length === 2 && v[0] === "KEY" && v[1] === "LOCK") arrB = true;
      });
      return arrA && arrB;
    },
    successNote: "push grows an array; map transforms it; filter keeps only what passes a test.",
  },
  {
    id: 11,
    title: "Words & Defaults",
    tier: "intermediate",
    concepts: ["functions", "arrow-functions", "operators"],
    shortDesc: "arrow functions, defaults, ternary",
    instruction:
      'Every clue here needs a spoken description. Write an arrow function <code>describe</code> that takes an animal name and the sound that animal makes. But if no sound is handed in, it should fall back on the default "meow". It should return one sentence in the form <code>&lt;animal&gt; says &lt;sound&gt;</code>. Call it once for a cat without supplying a sound, and once for a dog with the sound "woof". Then write a second arrow function <code>big</code> that judges a number and reports "big" whenever the number exceeds 10, and "small" otherwise. Pick the conditional operator for the judgment. Call <code>big</code> once with 20 and once with 5. Log all four results, in the order they appear above.',
    hint:
      'An arrow function can give its second parameter a default like <code>sound = &quot;meow&quot;</code>. For <code>big</code>, a ternary picks between <code>&quot;big&quot;</code> and <code>&quot;small&quot;</code> based on one comparison against 10. Log all four results in the required order.',
    starter: "",
    check: function (ctx, logs) {
      return !!logs && logs.length >= 4 &&
        String(logs[0].value) === "cat says meow" &&
        String(logs[1].value) === "dog says woof" &&
        String(logs[2].value) === "big" &&
        String(logs[3].value) === "small";
    },
    successNote: "Arrow functions are concise; default params and ternaries shrink boilerplate.",
  },
  {
    id: 12,
    title: "Suspect Object",
    tier: "intermediate",
    concepts: ["objects", "arrow-functions"],
    shortDesc: "object methods + arrow this",
    instruction:
      'Build a <code>counter</code> object with a method <code>step</code> that increments <code>this.count</code> and returns it. Call <code>counter.step()</code> and log <code>counter.count</code> (must print 1). Then build <code>boss</code> = { name: "Chief", items: ["a", "b"] } and give it a method <code>list</code> that maps items using an ARROW callback that reads <code>this.name</code>. The arrow keeps the method\'s <code>this</code>. Log <code>boss.list()</code> (must print <code>["Chief: a","Chief: b"]</code>).',
    hint:
      'Give <code>counter</code> a method that bumps and returns <code>this.count</code>. For <code>boss</code>, the <code>list</code> method maps over its own <code>items</code>. Put the arrow callback INSIDE the method so it inherits the right <code>this</code>.',
    starter: "",
    check: function (ctx, logs) {
      var arrOk = false, countOk = false;
      logs.forEach(function (l) {
        var v = l.value;
        if (Array.isArray(v) && v.length === 2 && v[0] === "Chief: a" && v[1] === "Chief: b") arrOk = true;
        if (v === 1) countOk = true;
      });
      return arrOk && countOk;
    },
    successNote: "this in a regular method points to the object; arrows inherit the surrounding this.",
  },
  {
    id: 13,
    title: "Copy, Swap, Rest",
    tier: "intermediate",
    concepts: ["objects", "operators", "data-types"],
    shortDesc: "shorthand, spread, rest, destructure, ??",
    instruction:
      'Six modern-syntax drills, one case file. Work through them IN ORDER. Later steps build on the values from earlier ones. 1) Store "Ada" in a variable named <code>name</code> and 12 in a variable named <code>solved</code>. Then build an object named <code>agent</code> using <strong>property shorthand</strong>, so the two variables automatically become keys on the object. Log <code>agent.name</code>. 2) Make a one-off copy of <code>agent</code> and, on that copy, add a new <code>rank</code> key holding 1. The <strong>spread operator</strong> is the way to make the copy. Log the rank value read back off that new object; it should be 1. 3) Unpack <code>agent</code>\'s fields into two fresh variables using <strong>destructuring</strong>, renaming as you split: the name field into <code>code</code>, the solved field into <code>num</code>. (Nothing to log this step.) 4) Write an arrow function <code>squad</code> that takes one leading member and bundles every additional argument into a single <strong>rest</strong> array. It should return the count of how many additional members came along. Log the result of calling it with one leader plus two followers. 5) The object <code>cfg</code> has a <code>mode</code> key deliberately set to <code>undefined</code>. Log <code>cfg</code>\'s mode so that, thanks to the <strong>nullish-coalescing operator</strong>, a nullish value falls back to the string "auto". 6) Copy <code>agent</code> into a fresh plain object <code>copy</code> using a <strong>for...in</strong> loop, then log <code>copy</code> as a JSON string to prove it matches the original.',
    hint:
      'One package of modern syntax. Do it in order so the later steps have data to work with. Build <code>agent</code> first; the shorthand collides with existing variables; spread creates copies; <code>??</code> only kicks in when the left side is literally <code>undefined</code>.',
    starter: "",
    check: function (ctx, logs) {
      var need = ["Ada", "auto", '{"name":"Ada","solved":12}'];
      var needNums = [1, 2];
      return need.every(function (str) {
        return logs.some(function (l) { return String(l.value) === str; });
      }) && needNums.every(function (n) {
        return logs.some(function (l) { return Number(l.value) === n; });
      });
    },
    successNote: "Shorthand, spread, rest, destructuring and ?? are everyday modern JS.",
  },
  {
    id: 14,
    title: "The Records Room",
    tier: "intermediate",
    concepts: ["arrays", "functions"],
    shortDesc: "filter, find, sort, reduce",
    instruction:
      'The array <code>people</code> holds suspect records with <code>name</code> and <code>age</code>. 1) Count the adults (<code>age &gt;= 40</code>) with <code>filter</code> and log the number. It prints 3. 2) <code>find</code> "Grace" and log <code>"Grace is 45"</code>. 3) Sort a COPY (<code>[...people]</code>) by age ascending and log only the names. It prints <code>["Ada","Alan","Grace","Linus"]</code>. 4) <code>reduce</code> all ages to a total and log it. It prints 174.',
    hint:
      '<code>people</code> is provided. <code>filter</code> can count the adults; <code>find</code> returns the first match; sorting must happen on a COPY (<code>[...people]</code>) so the original stays put; <code>reduce</code> totals every age starting from 0.',
    starter: "",
    setUp:
      'ctx.people = ' +
      '[{ name: "Ada", age: 36 }, { name: "Linus", age: 52 }, { name: "Grace", age: 45 }, { name: "Alan", age: 41 }];',
    check: function (ctx, logs) {
      var adultCount = false, graceOk = false, orderOk = false, totalOk = false;
      logs.forEach(function (l) {
        var v = l.value;
        if (v === 3) adultCount = true;
        if (String(v) === "Grace is 45") graceOk = true;
        if (Array.isArray(v) && v.length === 4 && v[0] === "Ada" && v[1] === "Alan" && v[2] === "Grace" && v[3] === "Linus") orderOk = true;
        if (v === 174) totalOk = true;
      });
      return adultCount && graceOk && orderOk && totalOk;
    },
    successNote: "filter, find, sort and reduce cover 90% of real data work.",
  },
  {
    id: 15,
    title: "The Hoisted Alibi",
    tier: "intermediate",
    concepts: ["variables", "functions", "loops"],
    shortDesc: "debug hoisting + closure counter",
    instruction:
      'The starter was written to print three lines: <code>"classified"</code>, then the numbers <code>1</code> and <code>2</code>. Run it and you\'ll see something else entirely: the first line reads <code>undefined</code>, and the script then crashes with <code>TypeError: next is not a function</code>. There are two planted bugs behind this. Diagnose each one by reading the code, then fix the file so it prints exactly <code>"classified"</code>, <code>1</code>, <code>2</code>.',
    hint:
      'First bug: compare <em>where</em> a variable is used against <em>where</em> it is declared. Order matters. Second bug: ask what <code>makeCounter()</code> actually returns right now, and what <code>next</code> must be in order for <code>next()</code> to be callable.',
    starter:
      '// BUG 1\n' +
      'console.log(secret);\n' +
      'var secret = "classified";\n' +
      '\n' +
      '// BUG 2\n' +
      'function makeCounter() {\n' +
      '}\n' +
      'let next = makeCounter();\n' +
      'console.log(next());\n' +
      'console.log(next());\n',
    check: function (ctx, logs) {
      return !!logs && logs.length >= 3 &&
        String(logs[0].value) === "classified" &&
        logs[1].value === 1 &&
        logs[2].value === 2;
    },
    successNote: "var hoists declarations; closures keep private state alive between calls.",
  },
  {
    id: 16,
    title: "The Delegation Gambit",
    tier: "mostHard",
    concepts: ["dom", "events"],
    shortDesc: "event delegation + preventDefault",
    instruction:
      'A stubbed <code>document</code> contains <code>#evidence-box</code> (with three <code>.entry</code> children), <code>#output</code>, and <code>#report-form</code>. Attach ONE click listener to the CONTAINER (<code>#evidence-box</code>), not to each entry, that uses event delegation and sets <code>#output</code>\'s textContent to the clicked entry\'s text. Then attach a "submit" listener on <code>#report-form</code> that calls <code>e.preventDefault()</code> and sets <code>#output</code> to "blocked".',
    hint:
      'One click listener goes on the CONTAINER and reads <code>e.target</code>. Attaching to each child fails the check. The form listener must call <code>e.preventDefault()</code>, then overwrite the output text. The check clicks the first entry and submits the form.',
    starter: "",
    setUp: function (ctx) {
      ctx.document = mkDocument(["output", "evidence-box", "report-form"]);
      var box = ctx.document.getElementById("evidence-box");
      ["Bit 1: the key", "Bit 2: the safe", "Bit 3: the vault"].forEach(function (t) {
        var e = ctx.document.createElement("section");
        e.textContent = t;
        e.classList.add("entry");
        box.appendChild(e);
      });
    },
    check: function (ctx, logs) {
      var doc = ctx.document;
      var box = doc.getElementById("evidence-box");
      var output = doc.getElementById("output");
      var form = doc.getElementById("report-form");
      if (!box || !output || !form) return false;
      if (!box.children || !box.children.length) return false;
      if (!box.listeners.click || !box.listeners.click.length) return false;
      var childListeners = box.children.some(function (c) { return !!(c.listeners.click && c.listeners.click.length); });
      if (childListeners) return false;
      var firstEntry = box.children[0];
      box.dispatch("click", { target: firstEntry });
      if (output.textContent !== firstEntry.textContent) return false;
      var submitEvt = form.dispatch("submit", { target: form });
      return submitEvt.defaultPrevented === true && output.textContent === "blocked";
    },
    successNote: "Delegation listens once on a parent; preventDefault stops a form's default submit.",
  },
  {
    id: 17,
    title: "Window to the Case",
    tier: "mostHard",
    concepts: ["bom", "operators"],
    shortDesc: "BOM: navigator, storage, history, ??",
    instruction:
      'A stubbed <code>window</code> is your case file. It carries four separate pieces of browser evidence to log. 1) Log the browser\'s user agent string, which lives on the <code>navigator</code> object reachable from <code>window</code>. 2) Save a player record, <code>{ name: "Maaz", level: 3 }</code>, into <strong>localStorage</strong> under the key "player". Store it in JSON form (you\'ll need to stringify it on the way in and parse it on the way back out). Then read it back and log the saved name through the <strong>nullish-coalescing operator</strong>, so an absent value falls back to "unknown". The saved name is "Maaz". 3) <strong>sessionStorage</strong> already holds a clue under the key "hint". Read it and log whatever is stored there. 4) Push a fresh entry onto the <strong>history</strong> stack for the path "/case/2", then log the URL you now land on (read from <code>location</code>) and the browser\'s new history length. Both should be different from their starting values.',
    hint:
      'A stubbed <code>window</code> is provided. Storing is <code>setItem</code>, reading is <code>getItem</code>, and JSON goes through <code>JSON.stringify</code>/<code>JSON.parse</code>. <code>pushState</code> moves both <code>history.len</code> and <code>location.href</code>. <code>?? &quot;unknown&quot;</code> only fires when the left side is nullish.',
    starter: "",
    setUp: function (ctx) {
      ctx.window = mkWindow();
      ctx.window.sessionStorage.setItem("hint", "look left");
    },
    check: function (ctx, logs) {
      var win = ctx.window;
      if (!win) return false;
      var ua = false, nameOk = false, hrefOk = false, hintOk = false, histOk = false;
      logs.forEach(function (l) {
        var v = l.value;
        if (String(v).indexOf("JSDetective") > -1) ua = true;
        if (String(v) === "Maaz") nameOk = true;
        if (String(v) === "/case/2") hrefOk = true;
        if (String(v) === "look left") hintOk = true;
        if (typeof v === "number" && v >= 2) histOk = true;
      });
      return ua && nameOk && hrefOk && hintOk && histOk &&
        win.location.href === "/case/2" &&
        win.history.len >= 2 &&
        win.localStorage.getItem("player") !== null;
    },
    successNote: "navigator, location, storage and history are the browser window's gadgets.",
  },
  {
    id: 18,
    title: "The Async Heist",
    tier: "mostHard",
    concepts: ["async", "functions", "objects"],
    shortDesc: "async/await, fetch, try/catch, Promise.all",
    instruction:
      "The department hands you three asynchronous mini-cases. A stubbed <code>fetch</code> is provided. 1) Inside an <strong>async</strong> function, request the evidence endpoint, parse the JSON that comes back, and log the number of suspects it lists. The JSON describes its own suspects. Read it to see how many. 2) The \"/broken\" endpoint is a honey trap: it always rejects. In a second async function, request it anyway, but tame the failure with <strong>try/catch</strong> and log \"recovered\" whenever the call throws. 3) Two provided promises, <code>first</code> and <code>second</code>, each resolve with a single word. Whip them into order with <strong>Promise.all</strong>, then log both words combined into one line with a hyphen between them. Keep the logs to three lines in total: the suspect count, \"recovered\", and the combined pair.",
    hint:
      '<code>fetch("/evidence")</code> always succeeds while <code>/broken</code> always rejects. The second one is your <code>try/catch</code> lesson. <code>Promise.all</code> collects both promises into one array; join it with <code>"-"</code> inside a <code>.then</code>.',
    starter: "",
    setUp: function (ctx) {
      ctx.fetch = mkFetch({
        suspects: [
          { name: "Ada", bounty: 250 },
          { name: "Grace", bounty: 150 },
        ],
      });
      ctx.first = Promise.resolve("first");
      ctx.second = Promise.resolve("second");
    },
    check: function (ctx, logs) {
      var countOk = false, recOk = false, allOk = false;
      logs.forEach(function (l) {
        var v = l.value;
        if (v === 2) countOk = true;
        if (String(v) === "recovered") recOk = true;
        if (String(v) === "first-second") allOk = true;
      });
      return countOk && recOk && allOk;
    },
    isFinal: true,
    successNote: "THE FINAL CASE: await pauses until a promise settles, try/catch tames rejections and Promise.all runs many at once. Detective rank: MASTER.",
  },
];

/* ---------- Export (browser + Node) ---------- */

if (typeof module !== "undefined" && module.exports) {
  module.exports = LJS_LEVELS;
} else if (typeof window !== "undefined") {
  window.LJS_LEVELS = LJS_LEVELS;
}