import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { botReply, chatStarter, type ChatMessage } from "@/lib/chatbot";
import type { Service } from "@/types";

export function ChatBot({ services }: { services: Service[] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "starter",
      role: "bot",
      text: chatStarter,
    },
  ]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: 9e9 });
  }, [messages, open]);

  function send() {
    const t = draft.trim();
    if (!t) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: t,
    };
    const reply = botReply(t, services);
    setMessages((m) => [...m, userMsg, reply]);
    setDraft("");
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-nepal-blue to-nepal-red text-2xl text-white shadow-cyber transition-transform hover:scale-105"
        aria-label="chatbot"
        title="सहायक"
      >
        💬
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[28rem] w-[22rem] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-cyber dark:border-zinc-800 dark:bg-zinc-900 sm:w-[24rem]">
          <div className="flex items-center justify-between border-b border-zinc-200 bg-gradient-to-r from-nepal-blue to-nepal-red p-3 text-white dark:border-zinc-800">
            <div className="font-bold">सजिलो सहायक</div>
            <button
              onClick={() => setOpen(false)}
              className="rounded p-1 hover:bg-white/20"
              aria-label="close"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-nepal-blue text-white"
                      : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  }`}
                >
                  {m.text}
                  {m.matches && m.matches.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {m.matches.map((s) => (
                        <li key={s.id}>
                          <Link
                            to={`/services/${s.slug}`}
                            onClick={() => setOpen(false)}
                            className="block rounded-lg bg-white/80 px-2 py-1 text-xs font-semibold text-nepal-blue hover:bg-white dark:bg-zinc-900/80 dark:text-blue-300"
                          >
                            → {s.titleNe}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 border-t border-zinc-200 p-2 dark:border-zinc-800">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="यहाँ टाइप गर्नुहोस्…"
              lang="ne"
              className="input"
            />
            <button onClick={send} className="btn-primary">
              पठाउनुहोस्
            </button>
          </div>
        </div>
      )}
    </>
  );
}
