/* ==========================================================================
   JS DETECTIVE — Level Data (16 cases across 4 difficulty tiers)
   Loaded BEFORE game.js so the engine reads window.LJS_LEVELS.
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
    classList: {
      add: function (c) { if (el._classes.indexOf(c) === -1) el._classes.push(c); return el; },
      remove: function (c) {
        var i = el._classes.indexOf(c);
        if (i > -1) el._classes.splice(i, 1);
        return el;
      },
      toggle: function (c, force) {
        var on = force !== undefined ? !!force : el._classes.indexOf(c) === -1;
        if (on) el.classList.add(c); else el.classList.remove(c);
        return on;
      },
      contains: function (c) { return el._classes.indexOf(c) > -1; },
    },
  };
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
    title: "First Prints",
    tier: "easy",
    concepts: ["variables", "data-types"],
    shortDesc: "Variables + first console output",
    instruction:
      'Our very first case. Declare a variable <code>name</code> holding the string "Ada" and a variable <code>age</code> holding the number 36. Then log the sentence <code>Ada is 36</code> using <em>any</em> string-building technique.',
    hint:
      'Write <code>let name = "Ada";</code>, <code>let age = 36;</code>, then <code>console.log(name + " is " + age);</code>. Using a template literal like <code>`${name} is ${age}`</code> also works.',
    starter: "// declare name and age here\n// then log \"Ada is 36\"\n",
    check: function (ctx, logs) {
      return logs.some(function (l) { return String(l.value) === "Ada is 36"; });
    },
    successNote: "Variables store data you can reuse — everything else builds on this.",
  },
  {
    id: 2,
    title: "The Type Trap",
    tier: "easy",
    concepts: ["data-types", "operators"],
    shortDesc: "typeof traps: [] and null",
    instruction:
      "Every detective should know their data types. Log the result of <code>typeof []</code>, <code>typeof null</code>, <code>typeof 42</code>, and <code>typeof \"hi\"</code> — one per line, in that order. Then log the string <code>typeof [] is object</code>.",
    hint:
      'Write <code>console.log(typeof []);</code> then <code>console.log(typeof null);</code>, <code>typeof 42</code>, <code>typeof "hi"</code>, and finally <code>console.log("typeof [] is object");</code>. Surprise: <code>null</code> reports "object" too!',
    starter: "// log the five lines in order\n",
    check: function (ctx, logs) {
      var expect = ["object", "object", "number", "string"];
      if (!logs || logs.length < 5) return false;
      for (var i = 0; i < 4; i++) {
        if (logs[i].value !== expect[i]) return false;
      }
      return logs.some(function (l) { return String(l.value) === "typeof [] is object"; });
    },
    successNote: "typeof tells you a value's type — but [] and null are famous traps.",
  },
  {
    id: 3,
    title: "Strict or Loose",
    tier: "easy",
    concepts: ["operators", "data-types"],
    shortDesc: "== vs === and coercion",
    instruction:
      'The corner store hands you two IDs: <code>str</code> holds "10" (a string) and <code>num</code> holds 10 (a number). Log two comparisons, in order: first <code>str == num</code>, then <code>str === num</code>. One is true, one is false — you tell me which.',
    hint:
      'Write <code>console.log(str == num);</code> then <code>console.log(str === num);</code>. The loose == coerces types; the strict === does not.',
    starter: '// str = "10" (string), num = 10 (number)\n',
    setUp: 'ctx.str = "10";\nctx.num = 10;',
    check: function (ctx, logs) {
      return !!logs && logs[0] && logs[0].value === true && logs[1] && logs[1].value === false;
    },
    successNote: "=== never coerces. When in doubt, prefer the strict triple-equals.",
  },
  {
    id: 4,
    title: "The Grade Defector",
    tier: "easy",
    concepts: ["control-flow"],
    shortDesc: "if/else chain + switch",
    instruction:
      'Write a function <code>grade(score)</code> that returns "A" for 90+, "B" for 80+, "C" for 70+, and "F" otherwise (use an if/else chain with nested branches). Log <code>grade(85)</code>, <code>grade(91)</code>, and <code>grade(69)</code> in order. Next, a <code>badge</code> variable equals "silver" — use a <code>switch</code> so "gold" logs "rank 1", "silver" logs "rank 2", anything else logs "unranked". Then log the result.',
    hint:
      'Finish <code>grade</code>: <code>function grade(s){ if (s &gt;= 90) return "A"; if (s &gt;= 80) return "B"; if (s &gt;= 70) return "C"; return "F"; }</code>, then log grade(85), grade(91), grade(69). For the switch write <code>switch(badge){ case "gold": console.log("rank 1"); break; case "silver": console.log("rank 2"); break; default: console.log("unranked"); }</code>.',
    starter: '// grade() and badge are already set up — finish them\n',
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
    id: 5,
    title: "Count Every Step",
    tier: "intermediate",
    concepts: ["loops"],
    shortDesc: "for + while loops",
    instruction:
      "Count the steps. Log the numbers 1 through 5 with a <code>for</code> loop (one per line). Then use a <code>while</code> loop to add up 1 + 2 + 3 + 4 + 5 and log the total — it must print 15.",
    hint:
      'Loop: <code>for (let i = 1; i &lt;= 5; i++) { console.log(i); }</code>. Then <code>let sum = 0, i = 1; while (i &lt;= 5) { sum += i; i++; } console.log(sum);</code>',
    starter: "// 1. for loop -> 1 2 3 4 5\n// 2. while loop -> total 15\n",
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
    id: 6,
    title: "Clue Upgrade",
    tier: "intermediate",
    concepts: ["arrays", "arrow-functions"],
    shortDesc: "push, map, filter",
    instruction:
      'The array <code>clues</code> is already defined as ["key", "map"]. Add "lock" to the end with <code>push</code>. Then use <code>.map(c =&gt; c.toUpperCase())</code> and log the result (should be <code>["KEY","MAP","LOCK"]</code>). Finally <code>filter</code> to keep only strings containing "K" and log that (should be <code>["KEY","LOCK"]</code>).',
    hint:
      "Write <code>clues.push(\"lock\");</code> <code>let upped = clues.map(c =&gt; c.toUpperCase()); console.log(upped);</code> then <code>let kept = upped.filter(c =&gt; c.includes(\"K\")); console.log(kept);</code>",
    starter: '// clues = ["key", "map"]\n',
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
    id: 7,
    title: "Words & Defaults",
    tier: "intermediate",
    concepts: ["functions", "arrow-functions", "operators"],
    shortDesc: "arrow functions, defaults, ternary",
    instruction:
      'Write an arrow function <code>describe(animal, sound = "meow")</code> that returns <code>`${animal} says ${sound}`</code>. Log <code>describe("cat")</code> then <code>describe("dog", "woof")</code>. Then write an arrow function <code>big(n)</code> using a ternary that returns "big" when <code>n &gt; 10</code> else "small". Log <code>big(20)</code> then <code>big(5)</code>.',
    hint:
      'Roughly: <code>const describe = (animal, sound = "meow") =&gt; `${animal} says ${sound}`;</code> and <code>const big = (n) =&gt; (n &gt; 10 ? "big" : "small");</code> then the four console.logs in order.',
    starter: "// four logs, in order:\n// cat says meow / dog says woof / big / small\n",
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
    id: 8,
    title: "Suspect Object",
    tier: "intermediate",
    concepts: ["objects", "arrow-functions"],
    shortDesc: "object methods + arrow this",
    instruction:
      'Build a <code>counter</code> object with a method <code>step</code> that increments <code>this.count</code> and returns it. Call <code>counter.step()</code> and log <code>counter.count</code> (must print 1). Then build <code>boss</code> = { name: "Chief", items: ["a", "b"] } and give it a method <code>list</code> that maps items using an ARROW callback that reads <code>this.name</code> — the arrow keeps the method\'s <code>this</code>. Log <code>boss.list()</code> (must print <code>["Chief: a","Chief: b"]</code>).',
    hint:
      "Counter: <code>let counter = { count: 0, step: function(){ this.count++; return this.count; } };</code>. Boss: <code>boss.list = function(){ return this.items.map(i =&gt; this.name + \": \" + i); };</code> Note the arrow must live INSIDE the method to capture this.",
    starter: "// counter + boss objects, then the two console.logs\n",
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
    id: 9,
    title: "Copy, Swap, Rest",
    tier: "hard",
    concepts: ["objects", "operators", "data-types"],
    shortDesc: "shorthand, spread, rest, destructure, ??",
    instruction:
      'One package of modern syntax. 1) Set <code>name = "Ada"</code> and <code>solved = 12</code>, then build <code>let agent = { name, solved };</code> (shorthand) and log <code>agent.name</code>. 2) Log <code>{ ...agent, rank: 1 }.rank</code> (spread + new key) — prints 1. 3) Destructure <code>const { name: code, solved: num } = agent;</code>. 4) Write <code>squad(captain, ...rest)</code> returning <code>rest.length</code>; log <code>squad("a","b","c")</code> — prints 2. 5) With <code>let cfg = { mode: undefined }</code>, log <code>cfg.mode ?? "auto"</code> — prints "auto". 6) Copy agent with a <code>for...in</code> loop into <code>copy</code> and log <code>JSON.stringify(copy)</code>.',
    hint:
      "The exact expected last line is <code>JSON.stringify(copy)</code> giving <code>{\"name\":\"Ada\",\"solved\":12}</code>. Everything else logs a single short value.",
    starter: "// shorthand, spread, rest, destructuring, ??, for...in\n",
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
    id: 10,
    title: "The Records Room",
    tier: "hard",
    concepts: ["arrays", "functions"],
    shortDesc: "filter, find, sort, reduce",
    instruction:
      'The array <code>people</code> holds suspect records with <code>name</code> and <code>age</code>. 1) Count the adults (<code>age &gt;= 40</code>) with <code>filter</code> and log the number — prints 3. 2) <code>find</code> "Grace" and log <code>"Grace is 45"</code>. 3) Sort a COPY (<code>[...people]</code>) by age ascending and log only the names — prints <code>["Ada","Alan","Grace","Linus"]</code>. 4) <code>reduce</code> all ages to a total and log it — prints 174.',
    hint:
      'Sample: <code>people.filter(p =&gt; p.age &gt;= 40).length</code>; <code>people.find(p =&gt; p.name === "Grace")</code>; <code>[...people].sort((a,b) =&gt; a.age - b.age).map(p =&gt; p.name)</code>; <code>people.reduce((sum,p) =&gt; sum + p.age, 0)</code>.',
    starter: "// people is already defined\n",
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
    id: 11,
    title: "The Hoisted Alibi",
    tier: "hard",
    concepts: ["variables", "functions", "loops"],
    shortDesc: "debug hoisting + closure counter",
    instruction:
      'The starter contains two planted bugs. First: <code>console.log(secret)</code> runs before <code>var secret = "classified"</code> is assigned, so it prints <code>undefined</code> — because <code>var</code> is hoisted. Fix it (move the assignment above the log, or switch to <code>let</code>/<code>const</code> declared first) so it prints "classified". Second: finish <code>makeCounter()</code> so it returns a closure that increments and returns a private <code>c</code> — then <code>let next = makeCounter();</code> and log <code>next()</code> twice (prints 1 then 2).',
    hint:
      'For the closure: <code>let c = 0; return function(){ c += 1; return c; };</code> inside makeCounter. Note a bare <code>let</code> in the loop section is NOT needed here — the only loop lesson is that var hoisting also matters inside loops (that\'s the alibi).',
    starter:
      '// BUG 1: log runs before the var is assigned (hoisting)\n' +
      'console.log(secret);\n' +
      'var secret = "classified";\n' +
      '\n' +
      '// BUG 2: finish makeCounter so next() -> 1, then 2\n' +
      'function makeCounter() {\n' +
      '  // return a function that increments private state\n' +
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
    id: 12,
    title: "Board the Evidence",
    tier: "hard",
    concepts: ["dom"],
    shortDesc: "DOM manipulation",
    instruction:
      "This case runs against a stubbed <code>document</code> — no real browser needed. Grab <code>#case-list</code> with getElementById, create an <code>&lt;li&gt;</code> via createElement, set its <code>textContent</code> to \"The Stolen Key\", add the class <code>solved</code>, set <code>data-id</code> to \"s1\", and append it to the list. Then set the <code>#status</code> element's <code>textContent</code> to \"online\".",
    hint:
      'Roughly: <code>let list = document.getElementById("case-list");</code> <code>let li = document.createElement("li");</code> <code>li.textContent = "The Stolen Key";</code> <code>li.classList.add("solved");</code> <code>li.setAttribute("data-id","s1");</code> <code>list.appendChild(li);</code> <code>document.getElementById("status").textContent = "online";</code>',
    starter: "// use the stubbed document to build the board\n",
    setUp: function (ctx) {
      ctx.document = mkDocument(["case-list", "status"]);
    },
    check: function (ctx, logs) {
      var doc = ctx.document;
      var list = doc.getElementById("case-list");
      var status = doc.getElementById("status");
      if (!list || !status) return false;
      if (status.textContent !== "online") return false;
      if (!list.children || !list.children.length) return false;
      var li = list.children[0];
      return li.tagName === "LI" &&
        li.textContent === "The Stolen Key" &&
        li.getAttribute("data-id") === "s1" &&
        li.classList.contains("solved") &&
        li.parent === list;
    },
    successNote: "Creating nodes, wiring classes/attributes and inserting them is the core of dynamic pages.",
  },
  {
    id: 13,
    title: "The Delegation Gambit",
    tier: "mostHard",
    concepts: ["dom", "events"],
    shortDesc: "event delegation + preventDefault",
    instruction:
      'A stubbed <code>document</code> contains <code>#evidence-box</code> (with three <code>.entry</code> children), <code>#output</code>, and <code>#report-form</code>. Attach ONE click listener to the CONTAINER (<code>#evidence-box</code>) — not to each entry — that uses event delegation and sets <code>#output</code>\'s textContent to the clicked entry\'s text. Then attach a \"submit\" listener on <code>#report-form</code> that calls <code>e.preventDefault()</code> and sets <code>#output</code> to \"blocked\".',
    hint:
      'Delegation: <code>container.addEventListener("click", function (e) { output.textContent = e.target.textContent; });</code>. Submit: <code>form.addEventListener("submit", function (e) { e.preventDefault(); output.textContent = "blocked"; });</code>. The check clicks the first entry and submits the form.',
    starter: "// delegation on the box, preventDefault on the form\n",
    setUp: function (ctx) {
      ctx.document = mkDocument(["output", "evidence-box", "report-form"]);
      var box = ctx.document.getElementById("evidence-box");
      ["Bit 1: the key", "Bit 2: the safe", "Bit 3: the vault"].forEach(function (t) {
        var e = ctx.document.createElement("section");
        e.textContent = t;
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
    id: 14,
    title: "Window to the Case",
    tier: "mostHard",
    concepts: ["bom", "operators"],
    shortDesc: "BOM: navigator, storage, history, ??",
    instruction:
      'A stubbed <code>window</code> is provided. 1) Log <code>window.navigator.userAgent</code>. 2) Write <code>window.localStorage.setItem("player", JSON.stringify({ name: "Maaz", level: 3 }))</code>; read it back, JSON.parse, and log the name with a <code>?? "unknown"</code> fallback (prints "Maaz"). 3) Log <code>window.sessionStorage.getItem("hint")</code> (prints "look left"). 4) <code>window.history.pushState("page", "", "/case/2")</code> then log <code>window.location.href</code> (now "/case/2") and <code>window.history.len</code>.',
    hint:
      "sessionStorage already contains <code>hint = \"look left\"</code>. For the name: <code>let raw = window.localStorage.getItem(\"player\"); let p = raw ? JSON.parse(raw) : null; console.log((p &amp;&amp; p.name) ?? \"unknown\");</code>",
    starter: "// use window.navigator, .localStorage, .sessionStorage, .history, .location\n",
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
    id: 15,
    title: "The Async Heist",
    tier: "mostHard",
    concepts: ["async", "functions", "objects"],
    shortDesc: "async/await, fetch, try/catch, Promise.all",
    instruction:
      "An async case with a stubbed <code>fetch</code>. 1) In an <code>async</code> function, <code>await fetch(\"/evidence\")</code>, read <code>res.json()</code>, and log <code>data.suspects.length</code> (prints 2). 2) In another async function, <code>await fetch(\"/broken\")</code> inside a <code>try/catch</code> and log \"recovered\" on error (that URL always rejects). 3) <code>Promise.all([first, second])</code> and log the array joined with \"-\" via <code>.then</code> (prints \"first-second\").",
    hint:
      "Resolve like: <code>const res = await fetch(\"/evidence\"); const data = await res.json(); console.log(data.suspects.length);</code>. <code>first</code> and <code>second</code> are already Promises.",
    starter: "// fetch is stubbed; first & second are Promises\n",
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
    successNote: "await pauses until a promise settles; try/catch tames rejections; Promise.all runs many at once.",
  },
  {
    id: 16,
    title: "The Final Boss",
    tier: "mostHard",
    concepts: ["async", "dom", "events", "arrays", "objects"],
    shortDesc: "boss: async + DOM + events + reduce",
    instruction:
      'THE FINAL BOSS. Fix the break-in script. The stubbed <code>fetch("/leads")</code> returns suspects with <code>name</code> and <code>bounty</code>. The script should: filter to <code>bounty &gt;= 150</code>, sort by bounty DESCENDING (Linus, then Grace), sum the bounties with <code>reduce</code> and log <code>"TOTAL: 500 and 2 suspects."</code>, render each as an <code>&lt;li&gt;</code> with text like <code>Linus - 250</code> into <code>#case-list</code>, and attach ONE delegated click listener on <code>#case-list</code> so clicking a row sets <code>#detail</code> to <code>"&lt;name&gt; caught"</code>. The starter has been corrupted — repair it.',
    hint:
      "Watch four things: the filter direction, the sort direction, the reduce accumulator, and the listener (it belongs on the LIST container, and reads <code>e.target.textContent</code>).",
    starter:
      "// CORRUPTED — repair the filter, sort, reduce and rendering below\n" +
      "async function loadCase() {\n" +
      "  const res = await fetch(\"/leads\");\n" +
      "  const data = await res.json();\n" +
      "  let leads = data.suspects;\n" +
      "\n" +
      "  // BUG: wrong filter\n" +
      "  leads = leads.filter((s) => s.bounty < 150);\n" +
      "\n" +
      "  // BUG: wrong sort order\n" +
      "  leads = leads.sort((a, b) => a.bounty - b.bounty);\n" +
      "\n" +
      "  // BUG: reduce never adds\n" +
      "  const total = leads.reduce((acc, s) => acc, 0);\n" +
      "  console.log(\"TOTAL: \" + total + \" and \" + leads.length + \" suspects.\");\n" +
      "\n" +
      "  const list = document.getElementById(\"case-list\");\n" +
      "  list.innerHTML = \"\";\n" +
      "  leads.forEach((s) => {\n" +
      "    const li = document.createElement(\"li\");\n" +
      "    // BUG: only renders a name, and no listener is attached\n" +
      "    li.textContent = s.name;\n" +
      "    list.appendChild(li);\n" +
      "  });\n" +
      "}\n" +
      "loadCase();\n",
    setUp: function (ctx) {
      ctx.document = mkDocument(["case-list", "detail"]);
      ctx.fetch = mkFetch({
        suspects: [
          { name: "Ada", bounty: 100 },
          { name: "Linus", bounty: 300 },
          { name: "Grace", bounty: 200 },
        ],
      });
    },
    isFinal: true,
    check: function (ctx, logs) {
      var totalOk = logs.some(function (l) { return String(l.value) === "TOTAL: 500 and 2 suspects."; });
      if (!totalOk) return false;
      var doc = ctx.document;
      var list = doc && doc.getElementById("case-list");
      var detail = doc && doc.getElementById("detail");
      if (!list || !detail) return false;
      if (!list.children || list.children.length !== 2) return false;
      if (list.children[0].textContent !== "Linus - 300" || list.children[1].textContent !== "Grace - 200") return false;
      if (!list.listeners.click || !list.listeners.click.length) return false;
      var childListeners = list.children.some(function (c) { return !!(c.listeners.click && c.listeners.click.length); });
      if (childListeners) return false;
      list.dispatch("click", { target: list.children[1] });
      return detail.textContent === "Grace caught";
    },
    successNote: "You fixed async, DOM and events in one boss case. Detective rank: MASTER.",
  },
];

/* ---------- Export (browser + Node) ---------- */

if (typeof module !== "undefined" && module.exports) {
  module.exports = LJS_LEVELS;
} else if (typeof window !== "undefined") {
  window.LJS_LEVELS = LJS_LEVELS;
}