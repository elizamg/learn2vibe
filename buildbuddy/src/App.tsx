import { Routes, Route } from "react-router-dom";
import LessonsHome from "./pages/LessonsHome";
import QuizLesson from "./pages/QuizLesson";
import StoryLesson from "./pages/StoryLesson";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LessonsHome />} />
      <Route path="/quiz" element={<QuizLesson />} />
      <Route path="/story" element={<StoryLesson />} />
    </Routes>
  );
}
