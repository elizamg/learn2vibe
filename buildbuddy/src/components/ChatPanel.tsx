import { useState } from "react";
import type { ChatMessage } from "../types";

export interface AgentAction {
  id: string;
  label: string;
}

interface Props {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  actions: AgentAction[];
  onAction: (actionId: string) => void;
}

export default function ChatPanel({ messages, onSend, actions, onAction }: Props) {
  const [input, setInput] = useState("");

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput("");
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h2>BuildBuddy Chat</h2>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-msg ${msg.sender}`}>
            <span className="sender-label">
              {msg.sender === "buddy" ? "BuildBuddy" : "You"}
            </span>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      <div className="agent-actions">
        <span className="actions-label">Ask BuildBuddy:</span>
        {actions.map((a) => (
          <button key={a.id} onClick={() => onAction(a.id)}>{a.label}</button>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
