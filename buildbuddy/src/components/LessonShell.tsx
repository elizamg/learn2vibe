import { Link } from "react-router-dom";
import KeyConcepts from "./KeyConcepts";
import type { ConceptSlide } from "./KeyConcepts";
import type { ReactNode } from "react";

interface Props {
  title: string;
  leftContent: ReactNode;
  rightContent: ReactNode;
  conceptSlides: ConceptSlide[];
}

export default function LessonShell({ title, leftContent, rightContent, conceptSlides }: Props) {
  return (
    <div className="app">
      <header className="app-header">
        <h1>{title}</h1>
        <Link to="/" className="back-link">Back to Lessons</Link>
      </header>

      <main className="app-main">
        <div className="col-left">
          {leftContent}
        </div>

        <div className="col-right">
          <KeyConcepts slides={conceptSlides} />
          {rightContent}
        </div>
      </main>
    </div>
  );
}
