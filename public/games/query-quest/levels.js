/* Query Quest — level data (matches game.js contract).
 * 16 levels, 4 tiers (easy 1-5 / intermediate 6-10 / hard 11-13 / mostHard 14-16).
 * Judges compare the returned result set against expectedColumns + expectedRows
 * in EXACT column order and EXACT row order, so every expectation below is
 * order-fixed (natural scan order when no ORDER BY is stated, and a declared
 * ORDER BY where multicple row orders are possible).
 *
 * Anti-answer-leak rule (house lesson): every `starter` is left blank ("").
 * The task is stated in `instruction`/`hint` above the editor — never repeated
 * as a code comment inside the starter template.
 */
window.__queryQuestLevels = [
  /* ---------------- EASY (1-5) ---------------- */
  {
    id: 1,
    tier: "easy",
    title: "See Everything",
    concepts: ["select"],
    shortDesc: "SELECT * — the very first query",
    instruction:
      "Your first mission: return <em>every column and every row</em> from the <code>users</code> table. Yes, that includes the id, the email and the age.",
    hint: "SELECT needs two parts: the columns you want (a one-character wildcard means 'all columns') and the table you're reading from.",
    starter: "",
    seedErr: "You should be selecting from users, returning all four of its columns and every row.",
    expectedColumns: ["id", "name", "email", "city", "age"],
    expectedRows: [
      [1, "Ada Lovelace", "ada@example.com", "London", 36],
      [2, "Grace Hopper", "grace@example.com", "New York", 85],
      [3, "Alan Turing", "alan@example.com", "London", 41],
      [4, "Linus Torvalds", "linus@example.com", "Helsinki", 55],
      [5, "Barbara Liskov", "barbara@example.com", "Boston", 84],
      [6, "Margaret Hamilton", "margaret@example.com", "Boston", 88]
    ],
    isFinal: false
  },
  {
    id: 2,
    tier: "easy",
    title: "London Calls",
    concepts: ["where"],
    shortDesc: "WHERE — filter a column",
    instruction:
      "Only the Londoners, please. Return <em>every column</em> of every user who lives in <code>London</code>.",
    hint: "A WHERE clause narrows rows by a condition. Compare the city column to the text 'London'.",
    starter: "",
    seedErr: "Add a WHERE clause that keeps rows where the city column equals 'London'.",
    expectedColumns: ["id", "name", "email", "city", "age"],
    expectedRows: [
      [1, "Ada Lovelace", "ada@example.com", "London", 36],
      [3, "Alan Turing", "alan@example.com", "London", 41]
    ],
    isFinal: false
  },
  {
    id: 3,
    tier: "easy",
    title: "Oldest to Youngest",
    concepts: ["order-by"],
    shortDesc: "ORDER BY — sort your rows",
    instruction:
      "Return only the <code>name</code> and <code>age</code> of every user, sorted <em>youngest first</em> (age ascending).",
    hint: "An ORDER BY clause sorts the output. 'Youngest first' means ascending on the age column.",
    starter: "",
    seedErr: "You need ORDER BY age (ascending is the default direction). Only name and age columns.",
    expectedColumns: ["name", "age"],
    expectedRows: [
      ["Ada Lovelace", 36],
      ["Alan Turing", 41],
      ["Linus Torvalds", 55],
      ["Barbara Liskov", 84],
      ["Grace Hopper", 85],
      ["Margaret Hamilton", 88]
    ],
    isFinal: false
  },
  {
    id: 4,
    tier: "easy",
    title: "Top of the Class",
    concepts: ["limit"],
    shortDesc: "LIMIT — cap the result set",
    instruction:
      "Show the <em>3 oldest</em> users, by <code>name</code> only, oldest first.",
    hint: "Order by age the other way around, then a LIMIT stops the query after 3 rows.",
    starter: "",
    seedErr: "Sort by age descending, then limit the output to exactly three rows and keep only the name column.",
    expectedColumns: ["name"],
    expectedRows: [["Margaret Hamilton"], ["Grace Hopper"], ["Barbara Liskov"]],
    isFinal: false
  },
  {
    id: 5,
    tier: "easy",
    title: "Two-Way Filter",
    concepts: ["where", "and-or"],
    shortDesc: "WHERE with OR — combine conditions",
    instruction:
      "Show the <code>name</code> and <code>city</code> of every user who is <em>under 40</em> OR lives in <code>Boston</code>.",
    hint: "Two conditions joined by OR — one matches on age, the other on city. A row matches if either is true.",
    starter: "",
    seedErr: "WHERE needs both conditions — age less than 40, or city equal to 'Boston' — joined with OR.",
    expectedColumns: ["name", "city"],
    expectedRows: [
      ["Ada Lovelace", "London"],
      ["Barbara Liskov", "Boston"],
      ["Margaret Hamilton", "Boston"]
    ],
    isFinal: false
  },

  /* ---------------- INTERMEDIATE (6-10) ---------------- */
  {
    id: 6,
    tier: "intermediate",
    title: "Who Ordered What",
    concepts: ["join"],
    shortDesc: "INNER JOIN two tables",
    instruction:
      "Match every order to the product it bought. Return the <code>order id</code> and the <code>product name</code>, one row per order.",
    hint: "orders and products share a column — product_id. Join on it so each order picks up its product's name.",
    starter: "",
    seedErr: "Join orders to products on product_id. Select the order's id and the product's name.",
    expectedColumns: ["id", "name"],
    expectedRows: [
      [1, "Laptop"],
      [2, "Keyboard"],
      [3, "Notebook"],
      [4, "Mouse"],
      [5, "Laptop"],
      [6, "Notebook"],
      [7, "Desk Lamp"],
      [8, "Laptop"]
    ],
    isFinal: false
  },
  {
    id: 7,
    tier: "intermediate",
    title: "Keep Everyone",
    concepts: ["left-join"],
    shortDesc: "LEFT JOIN keeps unmatched rows",
    instruction:
      "Show <em>every</em> user with the ids of their orders — users who have never ordered must still appear, once, with an empty order id.",
    hint: "An inner join silently drops someone with no orders. A different join kind keeps every left-hand row.",
    starter: "",
    seedErr: "Use a LEFT JOIN (users on the left, orders on the right) so Barbara, who has no orders, still shows up as a NULL id.",
    expectedColumns: ["name", "id"],
    expectedRows: [
      ["Ada Lovelace", 1],
      ["Ada Lovelace", 2],
      ["Grace Hopper", 3],
      ["Alan Turing", 4],
      ["Alan Turing", 5],
      ["Linus Torvalds", 6],
      ["Barbara Liskov", null],
      ["Margaret Hamilton", 7],
      ["Margaret Hamilton", 8]
    ],
    isFinal: false
  },
  {
    id: 8,
    tier: "intermediate",
    title: "Count the Catalog",
    concepts: ["count"],
    shortDesc: "COUNT(*) — total rows",
    instruction:
      "How many products are in the catalog? Return a single count — nothing else.",
    hint: "COUNT is an aggregate function that counts rows. COUNT(*) counts every row in the table.",
    starter: "",
    seedErr: "Use COUNT(*) to count all rows in the products table. No other columns.",
    expectedColumns: ["COUNT(*)"],
    expectedRows: [[6]],
    isFinal: false
  },
  {
    id: 9,
    tier: "intermediate",
    title: "All The Items",
    concepts: ["sum"],
    shortDesc: "SUM — add up a column",
    instruction:
      "Every order has a <code>quantity</code>. Return the <em>total number of items</em> ordered across all orders.",
    hint: "SUM adds up a numeric column. Sum the quantity column across all rows of orders.",
    starter: "",
    seedErr: "Use SUM(quantity) over the orders table. Your answer should be a single row.",
    expectedColumns: ["SUM(quantity)"],
    expectedRows: [[17]],
    isFinal: false
  },
  {
    id: 10,
    tier: "intermediate",
    title: "City Census",
    concepts: ["group-by", "count"],
    shortDesc: "GROUP BY — count per group",
    instruction:
      "For each city, return the city name and <em>how many users live there</em>. One row per city.",
    hint: "GROUP BY collects rows that share a value into one group. Count within each group.",
    starter: "",
    seedErr: "Group by the city column, then COUNT(*) per group. Every city appears exactly once.",
    expectedColumns: ["city", "COUNT(*)"],
    expectedRows: [
      ["Boston", 2],
      ["Helsinki", 1],
      ["London", 2],
      ["New York", 1]
    ],
    isFinal: false
  },

  /* ---------------- HARD (11-13) ---------------- */
  {
    id: 11,
    tier: "hard",
    title: "The Never-Ored Product",
    concepts: ["subquery"],
    shortDesc: "Subquery — find ordered products",
    instruction:
      "List the <code>name</code> of every product that has been ordered <em>at least once</em>. One product is never ordered — it must NOT appear.",
    hint: "A subquery inside WHERE can answer 'which product ids appear in orders?', then compare each product id against it.",
    starter: "",
    seedErr: "Use WHERE id IN (SELECT ...). The inner query should return every product_id from orders.",
    expectedColumns: ["name"],
    expectedRows: [["Laptop"], ["Mouse"], ["Keyboard"], ["Desk Lamp"], ["Notebook"]],
    isFinal: false
  },
  {
    id: 12,
    tier: "hard",
    title: "Smart Watch Lands",
    concepts: ["insert"],
    shortDesc: "INSERT a new row, then prove it",
    instruction:
      "Add a product named <code>Smart Watch</code> in category <code>electronics</code> priced <code>250</code>. The id is automatic — don't supply it. Then return its <code>name</code>, <code>category</code> and <code>price</code>.",
    hint: "INSERT INTO names the target columns and VALUES lists the new data. Finish with a SELECT that shows the row you just added.",
    starter: "",
    seedErr: "INSERT INTO products (name, category, price) with the three values, then SELECT name, category, price for the new product.",
    expectedColumns: ["name", "category", "price"],
    expectedRows: [["Smart Watch", "electronics", 250]],
    isFinal: false
  },
  {
    id: 13,
    tier: "hard",
    title: "Electronics Get Pricier",
    concepts: ["update"],
    shortDesc: "UPDATE rows, then check one",
    instruction:
      "Raise every <code>electronics</code> price by <em>10%</em>, then return the <code>name</code> and new <code>price</code> of the <code>Mouse</code>.",
    hint: "UPDATE sets a column everywhere a WHERE matches. price = price * 1.1 grows a value by ten percent.",
    starter: "",
    seedErr: "UPDATE products SET price = price * 1.1 WHERE category = 'electronics', then SELECT name, price WHERE name = 'Mouse'.",
    expectedColumns: ["name", "price"],
    expectedRows: [["Mouse", 22]],
    isFinal: false
  },

  /* ---------------- MOST HARD (14-16) ---------------- */
  {
    id: 14,
    tier: "mostHard",
    title: "Cancel Perfection",
    concepts: ["delete"],
    shortDesc: "DELETE rows, then verify",
    instruction:
      "Remove every order with <code>status = 'cancelled'</code>, then return the remaining <code>order ids</code> in order.",
    hint: "DELETE removes rows that match a WHERE statement. Re-check with a SELECT so you can see what survived.",
    starter: "",
    seedErr: "DELETE FROM orders WHERE status = 'cancelled', then SELECT id FROM orders. One of the eight orders should be gone.",
    expectedColumns: ["id"],
    expectedRows: [[1], [2], [3], [4], [6], [7], [8]],
    isFinal: false
  },
  {
    id: 15,
    tier: "mostHard",
    title: "Revenue Report",
    concepts: ["join", "group-by", "sum"],
    shortDesc: "LEFT JOIN + GROUP BY + SUM",
    instruction:
      "Total revenue per user from <em>paid</em> orders only (<code>quantity &times; price</code>). Users with no paid orders show NULL — but still appear. Name the total column <code>total</code>.",
    hint: "Cross order and product for prices, but filter the paid status inside the join so non-paid users aren't dropped. Group by user so SUM works per person.",
    starter: "",
    seedErr: "LEFT JOIN orders with status filter in the ON, LEFT JOIN products for prices, GROUP BY the user's id, ORDER BY that id. SUM(quantity * price) AS total.",
    expectedColumns: ["name", "total"],
    expectedRows: [
      ["Ada Lovelace", 1360],
      ["Grace Hopper", null],
      ["Alan Turing", 20],
      ["Linus Torvalds", null],
      ["Barbara Liskov", null],
      ["Margaret Hamilton", 45]
    ],
    isFinal: false
  },
  {
    id: 16,
    tier: "mostHard",
    title: "The Final Report",
    concepts: ["group-by", "having", "avg", "order-by", "limit"],
    shortDesc: "The boss — HAVING + AVG + LIMIT",
    instruction:
      "For cities with <em>more than one</em> user: return the <code>city</code> and its <code>average age</code>, oldest average first, top 2.",
    hint: "HAVING filters whole groups (not rows). Average ages with AVG, order descending, then LIMIT the report to two cities.",
    starter: "",
    seedErr: "GROUP BY city, HAVING COUNT(*) > 1, SELECT city and AVG(age) AS avg_age, ORDER BY avg_age DESC, LIMIT 2.",
    expectedColumns: ["city", "avg_age"],
    expectedRows: [
      ["Boston", 86],
      ["London", 38.5]
    ],
    isFinal: true
  }
];