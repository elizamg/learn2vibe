# BuildBuddy

A kid-friendly web platform that teaches coding concepts through interactive lessons. Each lesson has a hands-on project, a chat/control sidebar, and a Key Concepts carousel.

## How to Run

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Routes

| Path | Page |
|---|---|
| `/` | Lessons home — pick a lesson |
| `/quiz` | JSON List Quiz lesson |
| `/story` | Story Maker lesson |

## Lessons

### JSON List Quiz (`/quiz`)

Build a quiz game by editing JSON config. Uses a chat sidebar with agent actions.

**Kid edits (in the Code Editor panel):**
1. Change `"title"` to rename the quiz
2. Change `"pointsPerQuestion"` to adjust scoring
3. Edit question prompts, choices, or add new question objects

**Agent actions (chat sidebar buttons):**
- **Add a question** — appends to the questions array
- **Make it harder** — increases points + adds a trick question
- **Change theme** — swaps the quiz title

### Story Maker (`/story`)

Pick a character and story type from dropdowns to generate a story using template literals.

**KID EDIT ZONE** is in `src/pages/StoryLesson.tsx` (clearly marked with comments):
- `CHARACTERS` array — add or change character names
- `STORY_TYPES` array — add or change story genres
- `generateStory()` function — edit the template literal strings

**Buttons:**
- **Randomize** — picks a random character + story type
- **Copy Story** — copies the generated story to clipboard

## Key Concepts Carousel

Both lessons include a "Key Concepts" panel on the right with Prev/Next slides. Each slide shows a concept title, bullet points, and a code snippet.

## Adding a New Lesson

1. Create `src/pages/MyLesson.tsx` — use `<LessonShell>` for consistent layout
2. Define your `conceptSlides` array (title, bullets, code per slide)
3. Add a route in `src/App.tsx`: `<Route path="/my-lesson" element={<MyLesson />} />`
4. Add a card to the `LESSONS` array in `src/pages/LessonsHome.tsx`

## Tech Stack

- React + Vite + TypeScript
- react-router-dom (client-side routing)
- Monaco Editor (quiz code editor)
- No auth, no database — everything runs client-side
