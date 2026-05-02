import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ServiceCard } from "@/components/ServiceCard";
import { getBookmarks } from "@/lib/bookmarks";
import type { Service } from "@/types";

export function BookmarksPage({ services }: { services: Service[] }) {
  const [ids, setIds] = useState<string[]>(getBookmarks());
  useEffect(() => {
    function refresh() {
      setIds(getBookmarks());
    }
    window.addEventListener("ssn:bookmarks", refresh);
    return () => window.removeEventListener("ssn:bookmarks", refresh);
  }, []);

  const list = services.filter((s) => ids.includes(s.id));

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <h1 className="mb-3 text-2xl font-extrabold">मेरा बुकमार्क</h1>
      {list.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">
            तपाईंले अहिलेसम्म कुनै सेवा बुकमार्क गर्नुभएको छैन।
          </p>
          <Link to="/services" className="btn-primary mt-4">
            सेवा खोज्नुहोस्
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}
    </div>
  );
}
