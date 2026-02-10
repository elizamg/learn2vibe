import { useState } from "react";

export interface ConceptSlide {
  title: string;
  bullets: string[];
  code: string;
}

interface Props {
  slides: ConceptSlide[];
}

export default function KeyConcepts({ slides }: Props) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  return (
    <div className="key-concepts">
      <div className="kc-header">
        <h3>Key Concepts</h3>
        <span className="kc-counter">
          {index + 1} / {slides.length}
        </span>
      </div>

      <div className="kc-slide">
        <h4>{slide.title}</h4>
        <ul>
          {slide.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
        <pre className="kc-code">{slide.code}</pre>
      </div>

      <div className="kc-nav">
        <button disabled={index === 0} onClick={() => setIndex(index - 1)}>
          Prev
        </button>
        <button disabled={index === slides.length - 1} onClick={() => setIndex(index + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
