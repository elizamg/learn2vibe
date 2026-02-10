import { Link } from "react-router-dom";

const LESSONS = [
  {
    to: "/quiz",
    title: "JSON List Quiz",
    description: "Build a quiz game by editing JSON. Learn about arrays, variables, and if/else logic.",
  },
  {
    to: "/story",
    title: "Story Maker",
    description: "Create stories with dropdowns and template literals. Learn about state, events, and string templates.",
  },
];

export default function LessonsHome() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>BuildBuddy</h1>
        <span className="tagline">Learn to code by building!</span>
      </header>

      <main className="lessons-home">
        <h2>Lessons</h2>
        <div className="lesson-cards">
          {LESSONS.map((lesson) => (
            <Link to={lesson.to} key={lesson.to} className="lesson-card">
              <h3>{lesson.title}</h3>
              <p>{lesson.description}</p>
              <span className="lesson-start">Start</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
