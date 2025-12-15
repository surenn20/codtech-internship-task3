import { useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import "./Editor.css";

const socket = io("http://localhost:3001");

export default function Editor() {
  const [quill, setQuill] = useState(null);

  useEffect(() => {
    const q = new Quill("#editor", {
      theme: "snow",
      placeholder: "Start typing here...",
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["clean"]
        ]
      }
    });
    setQuill(q);
  }, []);

  // Send changes
  useEffect(() => {
    if (!quill) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handler);
    return () => quill.off("text-change", handler);
  }, [quill]);

  // Receive changes
  useEffect(() => {
    if (!quill) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", handler);
    return () => socket.off("receive-changes", handler);
  }, [quill]);

  return (
    <div className="page">
      {/* APP NAME HEADER */}
      <header className="app-header">
        📝 <span>SyncWrite</span>
      </header>

      {/* EDITOR */}
      <div className="editor-wrapper">
        <div id="editor"></div>
      </div>
    </div>
  );
}