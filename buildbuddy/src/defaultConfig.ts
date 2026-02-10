// The default Code Editor content shown in the editor
export const DEFAULT_KID_ZONE = `{
  // --- Code Editor ---
  // "title" is a VARIABLE — it stores the name of your quiz!
  "title": "Animal Quiz 🐾",

  // "pointsPerQuestion" is a VARIABLE that tracks STATE (your score).
  // Every correct answer adds this many points.
  "pointsPerQuestion": 10,

  // "questions" is an ARRAY (a list!) of question objects.
  // Each question uses IF/ELSE logic:
  //   IF you pick the correct answer → you earn points
  //   ELSE → no points, try the next one!
  "questions": [
    {
      "prompt": "What sound does a cat make?",
      "choices": ["Woof", "Meow", "Moo", "Quack"],
      "correctIndex": 1
    },
    {
      "prompt": "How many legs does a spider have?",
      "choices": ["6", "8", "10", "4"],
      "correctIndex": 1
    },
    {
      "prompt": "Which animal is the tallest?",
      "choices": ["Elephant", "Giraffe", "Bear", "Horse"],
      "correctIndex": 1
    }
  ]
}`;
