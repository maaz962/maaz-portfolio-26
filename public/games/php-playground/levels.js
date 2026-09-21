/* PHP Playground — 8 levels. Same vanilla contract as the other games: the
 * page loads this file + game.js; game.js exposes __initPhpPlayground /
 * __resumePhpPlayground / __onPhpPlaygroundProgress and renders each level's
 * starter code into the PHP editor via window.__phpPlaygroundCode(). The
 * runtime (seanmorris php-wasm, WebAssembly PHP) is booted lazily ONLY when
 * the player presses Run — while it boots we show "Setting up PHP engine…".
 */
window.__phpPlaygroundLevels = [
  {
    id: 1,
    tier: "easy",
    title: "My First Echo",
    concept: "echo",
    xp: 9,
    instruction:
      'Write PHP that prints the exact text: PHP Coding Playground',
    seedCode: '<?php\n\n// Write the echo statement below.\n',
    seedErr: 'Use echo followed by the exact text in quotes.',
    seedHint: '<?php echo "PHP Coding Playground";',
  },
  {
    id: 2,
    tier: "easy",
    title: "Variable Ventures",
    concept: "variables",
    xp: 9,
    instruction:
      'Declare a variable $greeting holding the text "Hi there!" and print it.',
    seedCode: '<?php\n\n// Declare $greeting and echo it.\n',
    seedErr: 'Declare $greeting with the text "Hi there!" then echo it.',
    seedHint: '<?php $greeting = "Hi there!"; echo $greeting;',
  },
  {
    id: 3,
    tier: "easy",
    title: "Conditional Crossroads",
    concept: "if/else",
    xp: 9,
    instruction:
      'Using the $number variable below, print "Even" if it is even, otherwise print "Odd".',
    seedCode: '<?php\n$number = 7;\n\n// print "Even" or "Odd"\n',
    seedErr: 'Use an if/else that checks $number % 2 === 0.',
    seedHint: 'if ($number % 2 === 0) { echo "Even"; } else { echo "Odd"; }',
  },
  {
    id: 4,
    tier: "easy",
    title: "Loop Land",
    concept: "arrays + foreach",
    xp: 9,
    instruction:
      'Print each fruit from the $fruits array below, one per line.',
    seedCode: '<?php\n$fruits = ["Apple", "Mango", "Banana"];\n\n// loop and print each fruit\n',
    seedErr: 'Use a foreach to go over $fruits and echo each item followed by a newline.',
    seedHint: 'foreach ($fruits as $fruit) { echo $fruit . "\\n"; }',
  },
  {
    id: 5,
    tier: "intermediate",
    title: "Function Junction",
    concept: "functions",
    xp: 11,
    instruction:
      'Write a function greet($name) that prints "Hello, NAME!" and call it with "PHP".',
    seedCode: '<?php\n\n// write the greet function then call it\n',
    seedErr: 'Define a greet($name) function that echoes "Hello, " . $name . "!" then call greet("PHP").',
    seedHint: 'function greet($name) { echo "Hello, " . $name . "!"; } greet("PHP");',
  },
  {
    id: 6,
    tier: "intermediate",
    title: "String Symphony",
    concept: "string functions",
    xp: 11,
    instruction:
      'Print the result of strtoupper("php") — it must be "PHP".',
    seedCode: '<?php\n\n// print strtoupper("php")\n',
    seedErr: 'Echo the result of strtoupper("php").',
    seedHint: 'echo strtoupper("php");',
  },
  {
    id: 7,
    tier: "hard",
    title: "Array Assault",
    concept: "associative arrays",
    xp: 13,
    instruction:
      'From the $user array below, print the name followed by a space then the age.',
    seedCode: '<?php\n$user = ["name" => "Maaz", "age" => 22];\n\n// print "Maaz 22"\n',
    seedErr: 'Access the array keys $user["name"] and $user["age"].',
    seedHint: 'echo $user["name"] . " " . $user["age"];',
  },
  {
    id: 8,
    tier: "mostHard",
    title: "Array Avenue",
    concept: "array functions",
    xp: 15,
    instruction:
      'Print the total of the $prices array below using array_sum().',
    seedCode: '<?php\n$prices = [10, 20, 30];\n\n// print the total\n',
    seedErr: 'Use array_sum($prices) to add up all the values.',
    seedHint: 'echo array_sum($prices);',
  },
];
