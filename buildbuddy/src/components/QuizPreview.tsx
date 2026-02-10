import { useState } from "react";
import type { QuizConfig } from "../types";

interface Props {
  config: QuizConfig;
}

export default function QuizPreview({ config }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  const question = config.questions[currentQ];

  function handleAnswer(choiceIndex: number) {
    if (answered) return;
    setAnswered(true);

    // IF/ELSE: check if the answer is correct
    if (choiceIndex === question.correctIndex) {
      setScore(score + config.pointsPerQuestion);
      setFeedback("Correct! Great job!");
    } else {
      setFeedback(`Oops! The answer was: ${question.choices[question.correctIndex]}`);
    }
  }

  function handleNext() {
    if (currentQ + 1 < config.questions.length) {
      setCurrentQ(currentQ + 1);
      setFeedback(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  }

  function handleRestart() {
    setCurrentQ(0);
    setScore(0);
    setFeedback(null);
    setAnswered(false);
    setFinished(false);
  }

  if (config.questions.length === 0) {
    return <div className="quiz-preview"><p>Add some questions to get started!</p></div>;
  }

  if (finished) {
    return (
      <div className="quiz-preview">
        <h2>{config.title}</h2>
        <div className="quiz-finished">
          <p className="final-score">
            You scored {score} out of {config.questions.length * config.pointsPerQuestion}!
          </p>
          {score === config.questions.length * config.pointsPerQuestion
            ? <p className="perfect">Perfect score! You're a genius!</p>
            : <p>Nice try! Want to go again?</p>
          }
          <button className="restart-btn" onClick={handleRestart}>Play Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-preview">
      <h2>{config.title}</h2>
      <div className="quiz-progress">
        Question {currentQ + 1} of {config.questions.length}
      </div>
      <div className="quiz-score">Score: {score}</div>

      <div className="quiz-question">
        <p className="prompt">{question.prompt}</p>
        <div className="choices">
          {question.choices.map((choice, i) => (
            <button
              key={i}
              className={
                "choice-btn" +
                (answered && i === question.correctIndex ? " correct" : "") +
                (answered && i !== question.correctIndex ? " dimmed" : "")
              }
              onClick={() => handleAnswer(i)}
              disabled={answered}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className={`feedback ${feedback.startsWith("Correct") ? "correct" : "incorrect"}`}>
          {feedback}
        </div>
      )}

      {answered && (
        <button className="next-btn" onClick={handleNext}>
          {currentQ + 1 < config.questions.length ? "Next Question" : "See Results"}
        </button>
      )}
    </div>
  );
}
