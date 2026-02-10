import { useState, useCallback, useRef } from "react";
import ChatPanel from "../components/ChatPanel";
import type { AgentAction } from "../components/ChatPanel";
import QuizPreview from "../components/QuizPreview";
import CodeEditor from "../components/CodeEditor";
import LessonShell from "../components/LessonShell";
import { DEFAULT_KID_ZONE } from "../defaultConfig";
import type { QuizConfig, ChatMessage } from "../types";

function stripComments(text: string): string {
  return text.replace(/\/\/.*$/gm, "");
}

function parseConfig(text: string): QuizConfig | null {
  try {
    const cleaned = stripComments(text);
    const obj = JSON.parse(cleaned);
    if (
      typeof obj.title === "string" &&
      typeof obj.pointsPerQuestion === "number" &&
      Array.isArray(obj.questions)
    ) {
      return obj as QuizConfig;
    }
    return null;
  } catch {
    return null;
  }
}

const TEMPLATE_QUESTION = {
  prompt: "What color is the sky?",
  choices: ["Green", "Blue", "Red", "Yellow"],
  correctIndex: 1,
};

const TRICK_QUESTION = {
  prompt: "Which of these is NOT a real animal?",
  choices: ["Axolotl", "Quokka", "Snipe", "Grumblepuff"],
  correctIndex: 3,
};

const THEMES = [
  { title: "Space Explorer Quiz 🚀" },
  { title: "Ocean Adventure Quiz 🐙" },
  { title: "Dino Discovery Quiz 🦕" },
  { title: "Robot Lab Quiz 🤖" },
];

function applyAddQuestion(config: QuizConfig): QuizConfig {
  return { ...config, questions: [...config.questions, { ...TEMPLATE_QUESTION }] };
}

function applyMakeHarder(config: QuizConfig): QuizConfig {
  return {
    ...config,
    pointsPerQuestion: config.pointsPerQuestion + 5,
    questions: [...config.questions, { ...TRICK_QUESTION }],
  };
}

function applyChangeTheme(config: QuizConfig): QuizConfig {
  const available = THEMES.filter((t) => t.title !== config.title);
  const pick = available[Math.floor(Math.random() * available.length)];
  return { ...config, title: pick.title };
}

function configToKidZone(config: QuizConfig): string {
  const lines = [
    `{`,
    `  // --- Code Editor ---`,
    `  // "title" is a VARIABLE — it stores the name of your quiz!`,
    `  "title": ${JSON.stringify(config.title)},`,
    ``,
    `  // "pointsPerQuestion" is a VARIABLE that tracks STATE (your score).`,
    `  // Every correct answer adds this many points.`,
    `  "pointsPerQuestion": ${config.pointsPerQuestion},`,
    ``,
    `  // "questions" is an ARRAY (a list!) of question objects.`,
    `  // Each question uses IF/ELSE logic:`,
    `  //   IF you pick the correct answer → you earn points`,
    `  //   ELSE → no points, try the next one!`,
    `  "questions": ${JSON.stringify(config.questions, null, 4)}`,
    `}`,
  ];
  return lines.join("\n");
}

let msgId = 0;
function buddyMsg(text: string): ChatMessage {
  return { id: ++msgId, sender: "buddy", text };
}
function kidMsg(text: string): ChatMessage {
  return { id: ++msgId, sender: "kid", text };
}

const QUIZ_SLIDES = [
  {
    title: "Arrays of Objects",
    bullets: [
      "questions is an array — a list of items",
      "Each item is an object with prompt, choices, correctIndex",
      "You can add or remove items from the list",
    ],
    code: `"questions": [\n  { "prompt": "...", "choices": [...] }\n]`,
  },
  {
    title: "Rendering Choices",
    bullets: [
      "We loop over the choices array with .map()",
      "Each choice becomes a clickable button",
      "The index tells us which button was clicked",
    ],
    code: `choices.map((choice, i) =>\n  <button onClick={() => pick(i)}>\n    {choice}\n  </button>\n)`,
  },
  {
    title: "IF / ELSE Logic",
    bullets: [
      "IF the picked index matches correctIndex → correct!",
      "ELSE → wrong answer, show the right one",
      "This is how computers make decisions",
    ],
    code: `if (picked === correctIndex) {\n  score = score + points  // correct!\n} else {\n  // show right answer\n}`,
  },
  {
    title: "Score State",
    bullets: [
      "score is a state variable — it changes over time",
      "useState(0) starts the score at zero",
      "Each correct answer adds pointsPerQuestion",
    ],
    code: `const [score, setScore] = useState(0)\n\n// on correct answer:\nsetScore(score + pointsPerQuestion)`,
  },
];

const QUIZ_ACTIONS: AgentAction[] = [
  { id: "add_question", label: "Add a question" },
  { id: "make_harder", label: "Make it harder" },
  { id: "change_theme", label: "Change theme" },
];

export default function QuizLesson() {
  const initialConfig = parseConfig(DEFAULT_KID_ZONE)!;
  const [editorText, setEditorText] = useState(DEFAULT_KID_ZONE);
  const [config, setConfig] = useState<QuizConfig>(initialConfig);
  const [parseError, setParseError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    buddyMsg("Hi! I'm BuildBuddy. Try the buttons below to build your quiz!"),
  ]);
  const [editorOpen, setEditorOpen] = useState(false);
  const quizKeyRef = useRef(0);

  const handleEditorChange = useCallback((value: string) => {
    setEditorText(value);
    const parsed = parseConfig(value);
    if (parsed) {
      setConfig(parsed);
      setParseError(null);
      quizKeyRef.current++;
    } else {
      setParseError("Hmm, that doesn't look quite right. Check your JSON and try again!");
    }
  }, []);

  const applyTransform = useCallback(
    (transform: (c: QuizConfig) => QuizConfig) => {
      const next = transform(config);
      setConfig(next);
      const text = configToKidZone(next);
      setEditorText(text);
      setParseError(null);
      quizKeyRef.current++;
    },
    [config]
  );

  const handleAction = useCallback(
    (action: string) => {
      switch (action) {
        case "add_question":
          applyTransform(applyAddQuestion);
          setMessages((prev) => [
            ...prev,
            kidMsg("Add a question!"),
            buddyMsg(
              'Done! I added a new question to your ARRAY (list). An array holds multiple items — here it\'s your list of questions. Check the code to see the new entry!'
            ),
          ]);
          setEditorOpen(true);
          break;
        case "make_harder":
          applyTransform(applyMakeHarder);
          setMessages((prev) => [
            ...prev,
            kidMsg("Make it harder!"),
            buddyMsg(
              "I bumped up pointsPerQuestion (that's a VARIABLE tracking your score STATE) and added a tricky question. The quiz uses IF/ELSE: IF correct -> add points, ELSE -> no points!"
            ),
          ]);
          setEditorOpen(true);
          break;
        case "change_theme":
          applyTransform(applyChangeTheme);
          setMessages((prev) => [
            ...prev,
            kidMsg("Change the theme!"),
            buddyMsg(
              "New theme applied! I changed the title VARIABLE. Variables are like labeled boxes — you can swap what's inside anytime!"
            ),
          ]);
          setEditorOpen(true);
          break;
      }
    },
    [applyTransform]
  );

  const handleSend = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      kidMsg(text),
      buddyMsg(
        "Great question! Try clicking one of my action buttons below to see me write code for you."
      ),
    ]);
  }, []);

  const leftContent = (
    <>
      <ChatPanel messages={messages} onSend={handleSend} actions={QUIZ_ACTIONS} onAction={handleAction} />
    </>
  );

  const rightContent = (
    <>
      <div className="collapsible">
        <button className="collapse-toggle" onClick={() => setEditorOpen(!editorOpen)}>
          {editorOpen ? "Hide Code Editor" : "Show Code Editor"}
        </button>
        {editorOpen && (
          <CodeEditor value={editorText} onChange={handleEditorChange} error={parseError} />
        )}
      </div>

      <QuizPreview key={quizKeyRef.current} config={config} />
    </>
  );

  return (
    <LessonShell
      title="JSON List Quiz"
      leftContent={leftContent}
      rightContent={rightContent}
      conceptSlides={QUIZ_SLIDES}
    />
  );
}
