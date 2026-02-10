import { useState, useCallback } from "react";
import ChatPanel from "../components/ChatPanel";
import type { AgentAction } from "../components/ChatPanel";
import CodeEditor from "../components/CodeEditor";
import LessonShell from "../components/LessonShell";
import type { ChatMessage } from "../types";

// ---- Types ----

interface StoryConfig {
  characters: string[];
  storyTypes: string[];
  templates: Record<string, string>;
}

// ---- Default code shown in the editor (real TypeScript/React) ----

const DEFAULT_STORY_CODE = `// ===== STORY MAKER — Edit this code! =====

// ARRAY: a list of characters to choose from
const CHARACTERS = ["Wizard", "Astronaut", "Detective"];

// ARRAY: a list of story genres
const STORY_TYPES = ["Adventure", "Mystery", "Funny"];

// STATE: React remembers which character & genre you picked
const [character, setCharacter] = useState(CHARACTERS[0]);
const [storyType, setStoryType] = useState(STORY_TYPES[0]);

// IF/ELSE + TEMPLATE LITERALS: build a story string
function generateStory(character: string, storyType: string) {
  if (storyType === "Adventure") {
    return \`\${character} set off on a wild adventure through the Enchanted Forest. \${character} found a glowing map inside a hollow tree. Following it, \${character} discovered a mountain made of crystals!\`;
  } else if (storyType === "Mystery") {
    return \`\${character} noticed the town clock had stopped at midnight. \${character} found a golden key under the clock tower steps. It opened a secret room full of old journals!\`;
  } else {
    return \`\${character} accidentally wore mismatched shoes to the Grand Gala. \${character} started a silly dance that made everyone laugh. Mismatched shoes became the hottest trend!\`;
  }
}

// DERIVED UI: the story updates whenever state changes
const story = generateStory(character, storyType);
`;

// ---- Parsing: extract config from the TypeScript code ----

function parseStoryCode(code: string): StoryConfig | null {
  try {
    // Extract CHARACTERS array
    const charsMatch = code.match(/const CHARACTERS\s*=\s*\[([^\]]+)\]/);
    if (!charsMatch) return null;
    const characters = charsMatch[1]
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
    if (characters.length === 0) return null;

    // Extract STORY_TYPES array
    const typesMatch = code.match(/const STORY_TYPES\s*=\s*\[([^\]]+)\]/);
    if (!typesMatch) return null;
    const storyTypes = typesMatch[1]
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
    if (storyTypes.length === 0) return null;

    // Extract template literal strings from if/else branches
    const templates: Record<string, string> = {};
    const branchRegex = /(?:if|else if)\s*\(storyType\s*===\s*["']([^"']+)["']\)\s*\{[^`]*`([^`]*)`/g;
    let match;
    while ((match = branchRegex.exec(code)) !== null) {
      // Replace ${character} placeholders with {character} for rendering
      templates[match[1]] = match[2].replace(/\$\{character\}/g, "{character}");
    }

    // Extract the else branch (the fallback)
    const elseMatch = code.match(/\}\s*else\s*\{[^`]*`([^`]*)`/);
    if (elseMatch) {
      // Find the first storyType that doesn't have a template yet
      const unmatched = storyTypes.find((t) => !templates[t]);
      if (unmatched) {
        templates[unmatched] = elseMatch[1].replace(/\$\{character\}/g, "{character}");
      }
    }

    return { characters, storyTypes, templates };
  } catch {
    return null;
  }
}

function renderStory(config: StoryConfig, character: string, storyType: string): string {
  const template = config.templates[storyType];
  if (!template) return `${character} is ready for a ${storyType} story — but no template was found! Add an if/else branch in the code editor.`;
  return template.replace(/\{character\}/g, character);
}

// ---- Serialize config back to TypeScript code ----

function configToCode(config: StoryConfig): string {
  const charList = config.characters.map((c) => `"${c}"`).join(", ");
  const typeList = config.storyTypes.map((t) => `"${t}"`).join(", ");

  // Build if/else branches
  const branches = config.storyTypes.map((type, i) => {
    const tmpl = (config.templates[type] || `\${character} goes on a ${type} story!`)
      .replace(/\{character\}/g, "${character}");
    if (i === 0) {
      return `  if (storyType === "${type}") {\n    return \`${tmpl}\`;\n  }`;
    } else if (i < config.storyTypes.length - 1) {
      return ` else if (storyType === "${type}") {\n    return \`${tmpl}\`;\n  }`;
    } else {
      return ` else {\n    return \`${tmpl}\`;\n  }`;
    }
  });

  return `// ===== STORY MAKER — Edit this code! =====

// ARRAY: a list of characters to choose from
const CHARACTERS = [${charList}];

// ARRAY: a list of story genres
const STORY_TYPES = [${typeList}];

// STATE: React remembers which character & genre you picked
const [character, setCharacter] = useState(CHARACTERS[0]);
const [storyType, setStoryType] = useState(STORY_TYPES[0]);

// IF/ELSE + TEMPLATE LITERALS: build a story string
function generateStory(character: string, storyType: string) {
${branches.join("")}
}

// DERIVED UI: the story updates whenever state changes
const story = generateStory(character, storyType);
`;
}

// ---- Chat helpers ----

let msgId = 0;
function buddyMsg(text: string): ChatMessage {
  return { id: ++msgId, sender: "buddy", text };
}
function kidMsg(text: string): ChatMessage {
  return { id: ++msgId, sender: "kid", text };
}

// ---- Agent actions ----

const STORY_ACTIONS: AgentAction[] = [
  { id: "add_character", label: "Add a character" },
  { id: "add_genre", label: "Add a genre" },
  { id: "randomize", label: "Randomize" },
];

function applyAddCharacter(config: StoryConfig): StoryConfig {
  const NEW_CHARS = ["Pirate", "Robot", "Dragon", "Ninja", "Chef", "Alien"];
  const available = NEW_CHARS.filter((c) => !config.characters.includes(c));
  const pick = available.length > 0 ? available[0] : "Hero";
  return { ...config, characters: [...config.characters, pick] };
}

function applyAddGenre(config: StoryConfig): StoryConfig {
  const NEW_GENRES: Record<string, string> = {
    Scary:
      "{character} crept through a dark, creaky old mansion. Every shadow seemed to move. Then {character} heard footsteps behind them... but it was just a friendly cat! {character} laughed with relief.",
    "Sci-Fi":
      "{character} boarded a rocket ship headed for Planet Zorp. The aliens spoke in colors instead of words. {character} learned to say hello by turning bright purple. An intergalactic friendship began!",
    Fairytale:
      "{character} found a golden bean in the garden. Overnight it grew into a beanstalk reaching the clouds. {character} climbed up and discovered a castle made of candy. The sweetest adventure ever!",
  };
  const available = Object.keys(NEW_GENRES).filter((g) => !config.storyTypes.includes(g));
  if (available.length === 0) return config;
  const pick = available[0];
  return {
    ...config,
    storyTypes: [...config.storyTypes, pick],
    templates: { ...config.templates, [pick]: NEW_GENRES[pick] },
  };
}

// ---- Key concept slides (match the code in the editor) ----

const STORY_SLIDES = [
  {
    title: "State with useState",
    bullets: [
      "useState stores the current selection",
      "When state changes, the page re-renders",
      "We have two pieces of state: character and storyType",
    ],
    code: `const [character, setCharacter]
  = useState(CHARACTERS[0]);
const [storyType, setStoryType]
  = useState(STORY_TYPES[0]);`,
  },
  {
    title: "Arrays",
    bullets: [
      "CHARACTERS and STORY_TYPES are arrays (lists)",
      "Arrays hold multiple values in order",
      "You can add or remove items from the list",
    ],
    code: `const CHARACTERS = [
  "Wizard", "Astronaut", "Detective"
];
const STORY_TYPES = [
  "Adventure", "Mystery", "Funny"
];`,
  },
  {
    title: "IF / ELSE + Template Literals",
    bullets: [
      "if/else picks which story template to use",
      "Template literals (\`...\`) let you embed variables",
      "${character} gets replaced with the real value",
    ],
    code: `if (storyType === "Adventure") {
  return \`\${character} set off
    on a wild adventure...\`;
} else if (storyType === "Mystery") {
  return \`\${character} noticed
    something strange...\`;
}`,
  },
  {
    title: "Derived UI",
    bullets: [
      "The story is computed from state, not stored separately",
      "Every time character or storyType changes, it recalculates",
      "This is called derived state — it comes from other values",
    ],
    code: `// story updates automatically:
const story = generateStory(
  character, storyType
);`,
  },
];

// ---- Component ----

export default function StoryLesson() {
  const initialConfig = parseStoryCode(DEFAULT_STORY_CODE)!;
  const [editorText, setEditorText] = useState(DEFAULT_STORY_CODE);
  const [config, setConfig] = useState<StoryConfig>(initialConfig);
  const [parseError, setParseError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const [character, setCharacter] = useState(initialConfig.characters[0]);
  const [storyType, setStoryType] = useState(initialConfig.storyTypes[0]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    buddyMsg("Hi! I'm BuildBuddy. Pick a character and story type, or use my buttons to add new ones!"),
  ]);

  const story = renderStory(config, character, storyType);

  const handleEditorChange = useCallback(
    (value: string) => {
      setEditorText(value);
      const parsed = parseStoryCode(value);
      if (parsed) {
        setConfig(parsed);
        setParseError(null);
        if (!parsed.characters.includes(character)) setCharacter(parsed.characters[0]);
        if (!parsed.storyTypes.includes(storyType)) setStoryType(parsed.storyTypes[0]);
      } else {
        setParseError("Hmm, that doesn't look quite right. Check your code and try again!");
      }
    },
    [character, storyType]
  );

  const applyTransform = useCallback(
    (transform: (c: StoryConfig) => StoryConfig) => {
      const next = transform(config);
      setConfig(next);
      setEditorText(configToCode(next));
      setParseError(null);
    },
    [config]
  );

  const handleAction = useCallback(
    (action: string) => {
      switch (action) {
        case "add_character":
          applyTransform(applyAddCharacter);
          setMessages((prev) => [
            ...prev,
            kidMsg("Add a character!"),
            buddyMsg(
              "Done! I added a new string to the CHARACTERS array. Look at the code — arrays use square brackets [] and commas to hold a list of values!"
            ),
          ]);
          setEditorOpen(true);
          break;
        case "add_genre":
          applyTransform(applyAddGenre);
          setMessages((prev) => [
            ...prev,
            kidMsg("Add a genre!"),
            buddyMsg(
              "New genre added! I updated STORY_TYPES and wrote a new if/else branch with a template literal. The `${character}` placeholder gets replaced with the real character name!"
            ),
          ]);
          setEditorOpen(true);
          break;
        case "randomize": {
          const rc = config.characters[Math.floor(Math.random() * config.characters.length)];
          const rs = config.storyTypes[Math.floor(Math.random() * config.storyTypes.length)];
          setCharacter(rc);
          setStoryType(rs);
          setMessages((prev) => [
            ...prev,
            kidMsg("Randomize!"),
            buddyMsg(
              `Random pick: ${rc} + ${rs}! I called setCharacter() and setStoryType() — updating STATE re-renders the story automatically. That's derived UI!`
            ),
          ]);
          break;
        }
      }
    },
    [applyTransform, config]
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
    <ChatPanel
      messages={messages}
      onSend={handleSend}
      actions={STORY_ACTIONS}
      onAction={handleAction}
    />
  );

  const rightContent = (
    <>
      <div className="collapsible">
        <button className="collapse-toggle" onClick={() => setEditorOpen(!editorOpen)}>
          {editorOpen ? "Hide Code Editor" : "Show Code Editor"}
        </button>
        {editorOpen && (
          <CodeEditor
            value={editorText}
            onChange={handleEditorChange}
            error={parseError}
            language="typescript"
            hint="Edit the React code below — the story updates live!"
          />
        )}
      </div>

      <div className="story-output">
        <h3>Your Story</h3>
        <div className="story-selects">
          <label className="story-label">
            Character
            <select value={character} onChange={(e) => setCharacter(e.target.value)}>
              {config.characters.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="story-label">
            Story Type
            <select value={storyType} onChange={(e) => setStoryType(e.target.value)}>
              {config.storyTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="story-text">{story}</p>
      </div>
    </>
  );

  return (
    <LessonShell
      title="Story Maker"
      leftContent={leftContent}
      rightContent={rightContent}
      conceptSlides={STORY_SLIDES}
    />
  );
}
