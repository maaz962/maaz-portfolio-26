/* ==========================================================================
   PHP PLAYGROUND — Level Data (16 levels across 4 difficulty tiers)
   Sets window.__phpPlaygroundLevels for the browser. game.js re-reads it
   lazily and polls until the data arrives, so script order is safe.
   Points come from the tier (POINTS in game.js), not per-level here.
   passValue is the exact trimmed stdout the Check button must match.
   ========================================================================== */
window.__phpPlaygroundLevels = [
  /* ------------------------- EASY ------------------------- */
  {
    id: 1,
    tier: "easy",
    title: "City Greeting",
    concept: "variables",
    concepts: ["variables"],
    shortDesc: "Declare a variable and echo it.",
    instruction:
      'Declare <code>$city = "Lahore"</code> and <code>echo</code> it so the output is exactly <code>Lahore</code>.',
    hint: "Variables start with <code>$</code>. Assign with <code>=</code>, then <code>echo $city;</code>",
    starter: "<?php\n\n",
    passValue: "Lahore",
    isFinal: false,
  },
  {
    id: 2,
    tier: "easy",
    title: "Type Check",
    concept: "data types",
    concepts: ["data types", "gettype"],
    shortDesc: "Reveal the type of each value.",
    instruction:
      'Print the type of each value with <code>gettype()</code>, space-separated: the string <code>"PHP"</code>, the float <code>3.14</code>, the boolean <code>true</code>, and the array <code>[1, 2]</code>. Expect: <code>string double boolean array</code>.',
    hint: "Chain the calls with the concatenation operator: <code>gettype(\"...\")</code> then <code>. \" \"</code> between each.",
    starter: "<?php\n\n",
    passValue: "string double boolean array",
    isFinal: false,
  },
  {
    id: 3,
    tier: "easy",
    title: "Order of Operations",
    concept: "operators",
    concepts: ["operators"],
    shortDesc: "Use arithmetic operators correctly.",
    instruction:
      'Using <code>$a = 12</code>, <code>$b = 8</code> and <code>$c = 4</code>, print the result of <code>$a * $b + $c</code>.',
    hint: "PHP follows normal math precedence — multiplication before addition.",
    starter: "<?php\n\n",
    passValue: "100",
    isFinal: false,
  },
  {
    id: 4,
    tier: "easy",
    title: "The Greater One",
    concept: "if/else",
    concepts: ["if/else", "comparison"],
    shortDesc: "Branch on a comparison.",
    instruction:
      'Given <code>$a = 5</code> and <code>$b = 11</code>, use an <code>if/else</code> to print the greater number. You should see <code>11</code>.',
    hint: 'Compare with <code>&gt;</code>, and remember <code>==</code> is "equal to", <code>=</code> is assignment.',
    starter: "<?php\n\n",
    passValue: "11",
    isFinal: false,
  },
  {
    id: 5,
    tier: "easy",
    title: "City Loop",
    concept: "loops (foreach)",
    concepts: ["foreach"],
    shortDesc: "Loop through an array of strings.",
    instruction:
      'Print each city from <code>$cities = ["Lahore", "Karachi", "Islamabad"]</code>, one per line, with a <code>foreach</code> loop.',
    hint: "Write <code>foreach ($cities as $c)</code> and end each <code>echo</code> with <code>\"\\n\"</code>.",
    starter: "<?php\n\n",
    passValue: "Lahore\nKarachi\nIslamabad",
    isFinal: false,
  },

  /* ------------------------- INTERMEDIATE ------------------------- */
  {
    id: 6,
    tier: "intermediate",
    title: "Greet Function",
    concept: "functions",
    concepts: ["functions", "parameters"],
    shortDesc: "Write and call your first function.",
    instruction:
      'Write a function <code>greet($name)</code> that prints <code>Hello, NAME!</code>, then call it with <code>"PHP"</code>. Output must be exactly <code>Hello, PHP!</code>.',
    hint: 'Define <code>function greet($name)</code> that echoes <code>"Hello, " . $name . "!"</code>, then call <code>greet("PHP");</code>',
    starter: "<?php\n\n",
    passValue: "Hello, PHP!",
    isFinal: false,
  },
  {
    id: 7,
    tier: "intermediate",
    title: "Array Stats",
    concept: "arrays",
    concepts: ["arrays", "count", "array_sum"],
    shortDesc: "Use array helpers to summarize data.",
    instruction:
      'Print <code>count()</code> and <code>array_sum()</code> of <code>$prices = [10, 20, 30]</code>, space-separated. Expected: <code>3 60</code>.',
    hint: "Both are built-ins — <code>echo count($prices) . \" \" . array_sum($prices);</code>",
    starter: "<?php\n\n",
    passValue: "3 60",
    isFinal: false,
  },
  {
    id: 8,
    tier: "intermediate",
    title: "Clean & Shout",
    concept: "string functions",
    concepts: ["strtoupper", "trim"],
    shortDesc: "Nest string functions.",
    instruction:
      'The recovered phrase was written in a sloppy hand: the word "php" with stray spaces surrounding it. Print it back out clean and LOUD. First strip the leading and trailing whitespace using the <code>trim</code> function, then shout the result using the uppercase function. The returned output must be exactly "PHP".',
    hint: "Trim first (removes the spaces), then uppercase. Nesting order matters.",
    starter: "<?php\n\n",
    passValue: "PHP",
    isFinal: false,
  },
  {
    id: 9,
    tier: "intermediate",
    title: "Profile Card",
    concept: "associative arrays",
    concepts: ["associative arrays"],
    shortDesc: "Read values from a keyed array.",
    instruction:
      'From <code>$user = ["name" =&gt; "Maaz", "age" =&gt; 22]</code>, print the name then a space then the age. Output: <code>Maaz 22</code>.',
    hint: 'Access by key: <code>$user["name"]</code> and <code>$user["age"]</code>.',
    starter: "<?php\n\n",
    passValue: "Maaz 22",
    isFinal: false,
  },
  {
    id: 10,
    tier: "intermediate",
    title: "Skip Threes",
    concept: "loops (for + continue)",
    concepts: ["for", "continue"],
    shortDesc: "Loop with a skip condition.",
    instruction:
      'Print the numbers <code>1</code> to <code>10</code>, skipping every multiple of <code>3</code>, each followed by a space. Expected: <code>1 2 4 5 7 8 10</code>.',
    hint: '<code>for ($i = 1; $i &lt;= 10; $i++)</code> and use <code>continue</code> when <code>$i % 3 === 0</code>.',
    starter: "<?php\n\n",
    passValue: "1 2 4 5 7 8 10",
    isFinal: false,
  },

  /* ------------------------- HARD ------------------------- */
  {
    id: 11,
    tier: "hard",
    title: "URL Greeting",
    concept: "superglobals",
    concepts: ["$_GET", "superglobals"],
    shortDesc: "Read data from the request URL.",
    instruction:
      'Print <code>Hi, NAME</code> where the name comes from <code>$_GET["name"]</code> in the page URL, falling back to <code>guest</code> when it is missing. Expected here: <code>Hi, guest</code>.',
    hint: 'The null-coalescing operator handles missing keys: <code>$_GET["name"] ?? "guest"</code>',
    starter: "<?php\n\n",
    passValue: "Hi, guest",
    isFinal: false,
  },
  {
    id: 12,
    tier: "hard",
    title: "Comma Splitter",
    concept: "string functions",
    concepts: ["explode", "implode"],
    shortDesc: "Split a string, then rejoin it.",
    instruction:
      'Turn <code>$csv = "apple,banana,mango"</code> into <code>apple | banana | mango</code>.',
    hint: "Split on the comma with <code>explode</code>, rejoin with <code>implode</code> using <code>\" | \"</code>.",
    starter: "<?php\n\n",
    passValue: "apple | banana | mango",
    isFinal: false,
  },
  {
    id: 13,
    tier: "hard",
    title: "Safe Copy",
    concept: "null coalescing",
    concepts: ["??", "operators"],
    shortDesc: "Default values with the null coalescing operator.",
    instruction:
      'Given <code>$config = ["theme" =&gt; "dark"]</code>, print <code>$config["timezone"]</code> using <code>??</code> so it defaults to <code>"default"</code>. The expected output is <code>default</code>.',
    hint: "Write <code>$config[\"timezone\"] ?? \"default\"</code> — the <code>??</code> only kicks in when the key is missing.",
    starter: "<?php\n\n",
    passValue: "default",
    isFinal: false,
  },

  /* ------------------------- MOST HARD ------------------------- */
  {
    id: 14,
    tier: "mostHard",
    title: "Shout Fruits",
    concept: "array functions",
    concepts: ["array_map", "implode"],
    shortDesc: "Transform every item in an array.",
    instruction:
      'Uppercase every fruit in <code>$fruits = ["apple", "banana", "mango"]</code> with <code>array_map()</code>, then join the result with a single space. Expected: <code>APPLE BANANA MANGO</code>.',
    hint: '<code>array_map("strtoupper", $fruits)</code> returns a new array — feed it to <code>implode(" ", ...)</code>.',
    starter: "<?php\n\n",
    passValue: "APPLE BANANA MANGO",
    isFinal: false,
  },
  {
    id: 15,
    tier: "mostHard",
    title: "Only Evens",
    concept: "array functions",
    concepts: ["array_filter", "arrow functions"],
    shortDesc: "Filter an array with a callback.",
    instruction:
      'Build the array <code>1..10</code> with <code>range()</code>, keep only the even numbers with <code>array_filter()</code>, and print them space-separated. Expected: <code>2 4 6 8 10</code>.',
    hint: "The filter callback keeps items where the test is true: <code>fn($n) =&gt; $n % 2 === 0</code>.",
    starter: "<?php\n\n",
    passValue: "2 4 6 8 10",
    isFinal: false,
  },
  {
    id: 16,
    tier: "mostHard",
    title: "Big Total",
    concept: "array functions",
    concepts: ["array_reduce"],
    shortDesc: "Fold an array down to a single value.",
    instruction:
      'Total <code>$nums = [10, 20, 30, 40]</code> using <code>array_reduce()</code> with an arrow function. Expected output: <code>100</code>.',
    hint: 'The callback adds each value to a running total, starting at <code>0</code>: <code>fn($carry, $n) =&gt; $carry + $n</code>, then pass <code>0</code> as the third argument.',
    starter: "<?php\n\n",
    passValue: "100",
    isFinal: true,
  },
];