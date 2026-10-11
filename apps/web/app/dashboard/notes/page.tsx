"use client";

import { useEffect, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Editor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || "<p></p>",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm max-w-none focus:outline-none min-h-[300px] text-white/70 leading-relaxed",
      },
    },
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-1 flex-wrap">
        {[
          { label: "B", action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive("bold") },
          { label: "I", action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive("italic") },
          { label: "S", action: () => editor?.chain().focus().toggleStrike().run(), active: editor?.isActive("strike") },
          { label: "H1", action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), active: editor?.isActive("heading", { level: 1 }) },
          { label: "H2", action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive("heading", { level: 2 }) },
          { label: "•", action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive("bulletList") },
          { label: "1.", action: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive("orderedList") },
          { label: "</>", action: () => editor?.chain().focus().toggleCode().run(), active: editor?.isActive("code") },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
              btn.active
                ? "bg-[#C8A96E]/20 text-[#C8A96E] border border-[#C8A96E]/30"
                : "text-white/30 hover:text-white/60 hover:bg-white/5 border border-transparent"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
      <div className="border-t border-white/[0.06]" />
      <EditorContent editor={editor} />
    </div>
  );
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveTimeout, setSaveTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setNotes(list);
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0].id);
        setTitle(list[0].title);
        setContent(list[0].content);
      }
    } catch (e) {
      console.error("Failed to fetch notes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
    }
  }, [selectedId]);

  const saveNote = useCallback(
    async (id: string, newTitle: string, newContent: string) => {
      setSaving(true);
      try {
        await fetch(`/api/notes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle, content: newContent }),
        });
        setNotes((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, title: newTitle, content: newContent, updatedAt: new Date().toISOString() } : n
          )
        );
      } catch (e) {
        console.error("Failed to save note:", e);
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!selectedId) return;
    if (saveTimeout) clearTimeout(saveTimeout);
    setSaveTimeout(setTimeout(() => saveNote(selectedId, newTitle, content), 1000));
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (!selectedId) return;
    if (saveTimeout) clearTimeout(saveTimeout);
    setSaveTimeout(setTimeout(() => saveNote(selectedId, title, newContent), 1000));
  };

  const handleNewNote = async () => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled", content: "" }),
      });
      const note = await res.json();
      setNotes((prev) => [note, ...prev]);
      setSelectedId(note.id);
      setTitle(note.title);
      setContent(note.content);
    } catch (e) {
      console.error("Failed to create note:", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      const remaining = notes.filter((n) => n.id !== id);
      setNotes(remaining);
      if (selectedId === id) {
        setSelectedId(remaining[0]?.id ?? null);
        setTitle(remaining[0]?.title ?? "");
        setContent(remaining[0]?.content ?? "");
      }
    } catch (e) {
      console.error("Failed to delete note:", e);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">

      {/* Sidebar */}
      <div className="w-60 shrink-0 border-r border-white/[0.06] flex flex-col bg-[#0a0a0a]">
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06]">
          <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">Notes</span>
          <button
            onClick={handleNewNote}
            className="w-6 h-6 rounded-md bg-[#C8A96E]/10 border border-[#C8A96E]/20 flex items-center justify-center hover:bg-[#C8A96E]/20 transition"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v8M1 5h8" stroke="#C8A96E" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="flex flex-col gap-1 px-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-white/[0.03] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 gap-2">
              <p className="text-white/20 text-xs text-center">No notes yet.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedId(note.id)}
                className={`mx-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all group flex flex-col gap-0.5 ${
                  selectedId === note.id
                    ? "bg-[#C8A96E]/10 border border-[#C8A96E]/20"
                    : "hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <span className={`text-sm font-medium truncate ${
                  selectedId === note.id ? "text-white" : "text-white/60"
                }`}>
                  {note.title || "Untitled"}
                </span>
                <span className="text-xs text-white/20">{timeAgo(note.updatedAt)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedNote ? (
          <>
            <div className="flex items-center justify-between px-8 py-4 border-b border-white/[0.06] shrink-0">
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Note title..."
                className="flex-1 bg-transparent text-lg font-semibold text-white placeholder-white/20 focus:outline-none"
              />
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/20">
                  {saving ? "Saving..." : "Saved"}
                </span>
                <button
                  onClick={() => handleDelete(selectedNote.id)}
                  className="text-xs text-rose-400/40 hover:text-rose-400 transition"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <Editor key={selectedId} content={content} onChange={handleContentChange} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <p className="text-white/20 text-sm">No note selected.</p>
            <button
              onClick={handleNewNote}
              className="text-xs text-[#C8A96E] hover:text-[#d4b87a] transition"
            >
              + Create your first note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}