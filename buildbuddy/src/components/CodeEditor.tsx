import Editor from "@monaco-editor/react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  language?: string;
  hint?: string;
}

export default function CodeEditor({ value, onChange, error, language = "json", hint }: Props) {
  return (
    <div className="code-editor">
      <div className="editor-header">
        <h3>Code Editor</h3>
        <span className="editor-hint">{hint ?? "Edit the code below — the preview updates live!"}</span>
      </div>
      {error && <div className="editor-error">{error}</div>}
      <Editor
        height="300px"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          wordWrap: "on",
          scrollBeyondLastLine: false,
          tabSize: 2,
        }}
      />
    </div>
  );
}
