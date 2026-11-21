import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";

const SUGGESTIONS = [
  "Siapa Yusuf?",
  "Project apa saja yang pernah dibuat?",
  "Skill apa yang dikuasai?",
  "Bagaimana cara menghubungi?",
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(id);
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending, error]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function ask(history) {
    setPending(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error || "Asisten gagal menjawab.");
      if (typeof data.reply !== "string") throw new Error("Asisten tidak memberi jawaban.");

      setMessages([...history, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.message || "Gagal menghubungi asisten.");
    } finally {
      setPending(false);
    }
  }

  function send(text) {
    const question = text.trim();
    if (!question || pending) return;

    const history = [...messages, { role: "user", content: question }];
    setMessages(history);
    setInput("");
    ask(history);
  }

  function handleSubmit(event) {
    event.preventDefault();
    send(input);
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="Asisten AI"
            className="fixed inset-x-3 bottom-3 top-20 z-[60] flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#030014]/95 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[560px] sm:max-h-[calc(100vh-8rem)] sm:w-[380px]"
          >
            <header className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-white">Asisten Yusuf</h2>
                <p className="mt-0.5 text-xs text-gray-400">Tanya soal portofolio atau hal umum</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup asisten"
                className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-gray-300">
                    Halo, aku asisten Yusuf. Tanya apa saja soal portofolio, skill, project, atau hal umum.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => send(question)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-gray-300 transition hover:border-indigo-400/40 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <p
                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white"
                        : "border border-white/10 bg-white/5 text-gray-200"
                    }`}
                  >
                    {message.content}
                  </p>
                </div>
              ))}

              {pending && (
                <div className="flex justify-start">
                  <div
                    className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5"
                    aria-label="Asisten sedang mengetik"
                  >
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={() => ask(messages)}
                    className="mt-2 text-xs font-medium text-red-100 underline underline-offset-2 hover:text-white"
                  >
                    Coba lagi
                  </button>
                </div>
              )}

              <div ref={endRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t border-white/10 p-3">
              <div className="flex items-end gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Tanya apa saja..."
                  maxLength={1000}
                  aria-label="Pesan untuk asisten"
                  className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-gray-500 focus:border-indigo-400/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40"
                />
                <button
                  type="submit"
                  disabled={pending || !input.trim()}
                  aria-label="Kirim pesan"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
                Jawaban AI bisa salah. Data penting sebaiknya dicek di bagian Contact.
              </p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka asisten AI"
          title="Tanya asisten AI"
          className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white shadow-lg shadow-indigo-500/30 transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </>
  );
}
