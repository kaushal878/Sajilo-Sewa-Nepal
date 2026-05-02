import { Link } from "react-router-dom";
import type { Service } from "@/types";
import { ministryMap, officeMap } from "@/data/ministries";
import { isBookmarked, toggleBookmark } from "@/lib/bookmarks";
import { useEffect, useState } from "react";

export function ServiceCard({ service }: { service: Service }) {
  const ministry = ministryMap.get(service.ministryId);
  const office = officeMap.get(service.officeId);
  const [marked, setMarked] = useState(isBookmarked(service.id));

  useEffect(() => {
    function refresh() {
      setMarked(isBookmarked(service.id));
    }
    window.addEventListener("ssn:bookmarks", refresh);
    return () => window.removeEventListener("ssn:bookmarks", refresh);
  }, [service.id]);

  return (
    <article className="card flex flex-col gap-3 p-5 transition-shadow hover:shadow-cyber">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/services/${service.slug}`} className="block">
          <h3 className="text-lg font-bold leading-snug">{service.titleNe}</h3>
          {service.titleEn && (
            <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {service.titleEn}
            </div>
          )}
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleBookmark(service.id);
            setMarked((b) => !b);
          }}
          className="btn-ghost h-9 w-9 px-0"
          aria-label="bookmark"
          title={marked ? "बुकमार्क हटाउनुहोस्" : "बुकमार्क गर्नुहोस्"}
        >
          {marked ? "★" : "☆"}
        </button>
      </div>

      <p className="line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">
        {service.summaryNe}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="badge-blue">{service.category}</span>
        {ministry && (
          <span className="chip">{ministry.shortNe ?? ministry.nameNe}</span>
        )}
        {office && <span className="chip">{office.nameNe}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <span>⏱ {service.estimatedTimeNe}</span>
        <span>💵 {service.feeNe}</span>
      </div>

      <Link
        to={`/services/${service.slug}`}
        className="btn-outline mt-2 self-start"
      >
        विस्तारमा हेर्नुहोस् →
      </Link>
    </article>
  );
}
