/* Query Quest — level data (matches game.js contract).
 * Seeds a students/courses/enrollments database in sql.js and defines, for
 * each level, the expected result columns + rows (exact order) against which
 * a returned table is compared.
 */
window.__queryQuestLevels = [
  {
    id: 1,
    tier: "easy",
    title: "See Everything",
    concept: "SELECT",
    xp: 9,
    instruction:
      "Write a query that returns ALL columns and ALL rows from the students table.",
    expectedColumns: ["id", "name", "city", "age"],
    expectedRows: [
      [1, "Ali", "Lahore", 19],
      [2, "Sara", "Karachi", 20],
      [3, "Bilal", "Lahore", 22],
      [4, "Ayesha", "Islamabad", 18],
      [5, "Usman", "Lahore", 21],
      [6, "Fatima", "Karachi", 23]
    ],
    seedErr: "Did you forget a column or a row? SELECT all four columns (*) and every row.",
    seedHint:
      "SELECT * FROM students;",
  },
  {
    id: 2,
    tier: "easy",
    title: "Use Your Eyes",
    concept: "SELECT columns",
    xp: 9,
    instruction:
      "Return ONLY the name and city columns from students, in that exact order.",
    expectedColumns: ["name", "city"],
    expectedRows: [
      ["Ali", "Lahore"],
      ["Sara", "Karachi"],
      ["Bilal", "Lahore"],
      ["Ayesha", "Islamabad"],
      ["Usman", "Lahore"],
      ["Fatima", "Karachi"]
    ],
    seedErr: "Only name and city should appear, and name must come first.",
    seedHint: "SELECT name, city FROM students;",
  },
  {
    id: 3,
    tier: "easy",
    title: "Filter the Class",
    concept: "WHERE",
    xp: 9,
    instruction:
      "Show only the students who live in the city of Lahore. Return all their columns.",
    expectedColumns: ["id", "name", "city", "age"],
    expectedRows: [
      [1, "Ali", "Lahore", 19],
      [3, "Bilal", "Lahore", 22],
      [5, "Usman", "Lahore", 21]
    ],
    seedErr: "You need a WHERE clause to filter by city.",
    seedHint: "SELECT * FROM students WHERE city = 'Lahore';",
  },
  {
    id: 4,
    tier: "easy",
    title: "Sort It Out",
    concept: "ORDER BY",
    xp: 9,
    instruction:
      "Return the name and age of every student, sorted oldest first (age descending).",
    expectedColumns: ["name", "age"],
    expectedRows: [
      ["Fatima", 23],
      ["Bilal", 22],
      ["Usman", 21],
      ["Sara", 20],
      ["Ali", 19],
      ["Ayesha", 18]
    ],
    seedErr: "Add ORDER BY age DESC to sort from oldest to youngest.",
    seedHint: "SELECT name, age FROM students ORDER BY age DESC;",
  },
  {
    id: 5,
    tier: "intermediate",
    title: "Find That Row",
    concept: "WHERE (unique key)",
    xp: 11,
    instruction:
      "Somebody left a CS folder behind. Find the course with id 3 and return all its columns.",
    expectedColumns: ["id", "title", "category"],
    expectedRows: [[3, "Data Structures", "CS"]],
    seedErr: "Use a WHERE clause on the course's unique id.",
    seedHint: "SELECT * FROM courses WHERE id = 3;",
  },
  {
    id: 6,
    tier: "intermediate",
    title: "Through the Looking Table",
    concept: "JOIN",
    xp: 11,
    instruction:
      "Join students with enrollments, then courses. Show each student's name paired with their course title, but ONLY for courses in the 'CS' category.",
    expectedColumns: ["name", "title"],
    expectedRows: [
      ["Ali", "Data Structures"],
      ["Ali", "Algorithms"],
      ["Sara", "Networks"]
    ],
    seedErr:
      "You need a JOIN. students link to enrollments via id = student_id, and enrollments to courses via course_id = id. Filter with WHERE category = 'CS'.",
    seedHint:
      "SELECT s.name, c.title FROM students s JOIN enrollments e ON s.id = e.student_id JOIN courses c ON e.course_id = c.id WHERE c.category = 'CS';",
  },
  {
    id: 7,
    tier: "hard",
    title: "Change the Story",
    concept: "INSERT",
    xp: 13,
    instruction:
      "Class size just grew! Add a new student: name 'Hamza', city 'Multan', age 20. (The id column is primary-key auto — you don't need to supply it.)",
    expectedColumns: ["name", "city", "age"],
    expectedRows: [["Hamza", "Multan", "20"]],
    seedErr:
      "Use INSERT INTO students (name, city, age). Leave out the id — it's auto.",
    seedHint: "INSERT INTO students (name, city, age) VALUES ('Hamza', 'Multan', 20);",
  },
  {
    id: 8,
    tier: "mostHard",
    title: "The Big Count",
    concept: "GROUP BY + COUNT",
    xp: 15,
    instruction:
      "For each city, count how many students live there. Return two columns: the city and its count, ordered by count DESC (largest class first).",
    expectedColumns: ["city", "COUNT(*)"],
    expectedRows: [
      ["Lahore", 3],
      ["Karachi", 2],
      ["Islamabad", 1]
    ],
    seedErr:
      "Use COUNT(*) with GROUP BY city, then ORDER BY the count descending.",
    seedHint:
      "SELECT city, COUNT(*) FROM students GROUP BY city ORDER BY COUNT(*) DESC;",
  },
];
