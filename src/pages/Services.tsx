import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Category, Service } from "@/types";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SearchBar } from "@/components/SearchBar";
import { ServiceCard } from "@/components/ServiceCard";
import { buildIndex, searchServices } from "@/lib/search";
import { ministryMap } from "@/data/ministries";

interface Props {
  services: Service[];
}

export function ServicesPage({ services }: Props) {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const cat = (params.get("cat") || "all") as Category | "all";
  const ministry = params.get("ministry") || "";
  const [results, setResults] = useState<Service[]>(services);

  const index = useMemo(() => buildIndex(services), [services]);

  useEffect(() => {
    let out = q.trim() ? searchServices(index, q, 100) : services;
    if (cat !== "all") out = out.filter((s) => s.category === cat);
    if (ministry) out = out.filter((s) => s.ministryId === ministry);
    setResults(out);
  }, [q, cat, ministry, services, index]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <h1 className="mb-3 text-2xl font-extrabold">सेवाहरू</h1>
      <div className="mb-4">
        <SearchBar services={services} initial={q} />
      </div>

      {ministry && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-500">
            मन्त्रालय फिल्टर:
          </span>
          <span className="badge-blue flex items-center gap-2 py-1">
            {ministryMap.get(ministry)?.nameNe || ministry}
            <button
              onClick={() => {
                const p = new URLSearchParams(params);
                p.delete("ministry");
                setParams(p, { replace: true });
              }}
              className="ml-1 rounded-full bg-blue-600/20 px-1.5 hover:bg-blue-600/40"
              title="फिल्टर हटाउनुहोस्"
            >
              ✕
            </button>
          </span>
        </div>
      )}
      <div className="mb-5">
        <CategoryFilter
          active={cat}
          onChange={(next) => {
            const p = new URLSearchParams(params);
            if (next === "all") p.delete("cat");
            else p.set("cat", next);
            setParams(p, { replace: true });
          }}
        />
      </div>

      {results.length === 0 ? (
        <div className="card p-8 text-center text-zinc-500 dark:text-zinc-400">
          कुनै सेवा भेटिएन। अर्को शब्द (उदाहरण: नागरिकता, राहदानी) प्रयोग
          गर्नुहोस्।
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}
    </div>
  );
}
