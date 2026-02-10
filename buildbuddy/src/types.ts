export interface Question {
  prompt: string;
  choices: string[];
  correctIndex: number;
}

export interface QuizConfig {
  title: string;
  pointsPerQuestion: number;
  questions: Question[];
}

export interface ChatMessage {
  id: number;
  sender: "kid" | "buddy";
  text: string;
}

export type ConceptLabel = "VARIABLE / STATE" | "IF / ELSE" | "ARRAY / LIST";
