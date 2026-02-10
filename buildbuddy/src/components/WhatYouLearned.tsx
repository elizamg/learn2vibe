import type { ConceptLabel } from "../types";

const ALL_CONCEPTS: { label: ConceptLabel; description: string }[] = [
  {
    label: "VARIABLE / STATE",
    description:
      "A variable stores a value (like your score or quiz title). State is a variable that can change while your app runs!",
  },
  {
    label: "IF / ELSE",
    description:
      "IF something is true, do one thing. ELSE (otherwise), do something different. That's how the quiz checks your answers!",
  },
  {
    label: "ARRAY / LIST",
    description:
      "An array is a list of items — like your list of questions. You can add, remove, or loop through them!",
  },
];

export default function WhatYouLearned() {
  return (
    <div className="what-you-learned">
      <h3>Key Concepts</h3>
      <ul>
        {ALL_CONCEPTS.map((c) => (
          <li key={c.label}>
            <strong>{c.label}</strong>
            <p>{c.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
