import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Service } from "@/types";
import { buildIndex, searchServices } from "@/lib/search";

interface Props {
  services: Service[];
  initial?: string;
  large?: boolean;
}

export function SearchBar({ services, initial = "", large = false }: Props) {
  const [q, setQ] = useState(initial);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const index = useMemo(() => buildIndex(services), [services]);
  const suggestions = useMemo(
    () => (q.trim() ? searchServices(index, q, 6) : []),
    [q, index],
  );

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  function submit(query?: string) {
    const t = (query ?? q).trim();
    if (!t) return;
    navigate(`/services?q=${encodeURIComponent(t)}`);
    setOpen(false);
    inputRef.current?.blur();
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      <div
        className={`flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-4 shadow-cyber dark:border-zinc-700 dark:bg-zinc-900 ${
          large ? "py-4" : "py-2.5"
        }`}
      >
        <span className="text-zinc-400">🔍</span>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") setOpen(false);
          }}
          lang="ne"
          inputMode="text"
          placeholder="कुनै सेवा खोज्नुहोस्… (उदाहरण: नागरिकता, राहदानी, पान कार्ड)"
          className={`w-full bg-transparent placeholder:text-zinc-400 focus:outline-none ${
            large ? "text-lg" : "text-base"
          }`}
        />
        <button onClick={() => submit()} className="btn-primary">
          खोज्नुहोस्
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-auto rounded-2xl border border-zinc-200 bg-white p-2 shadow-cyber dark:border-zinc-800 dark:bg-zinc-900">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => {
                  navigate(`/services/${s.slug}`);
                  setOpen(false);
                }}
                className="flex w-full flex-col items-start rounded-xl px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <div className="font-semibold">{s.titleNe}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {s.category} • {s.estimatedTimeNe}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
