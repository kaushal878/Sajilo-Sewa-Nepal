import { Link } from "react-router-dom";
import type { Ministry, Service } from "@/types";

interface Props {
  ministries: Ministry[];
  services: Service[];
}

export function MinistriesPage({ ministries, services }: Props) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <h1 className="mb-3 text-2xl font-extrabold">मन्त्रालयहरू</h1>
      <p className="mb-6 max-w-2xl text-zinc-600 dark:text-zinc-300">
        प्रत्येक मन्त्रालय अन्तर्गत पर्ने सेवाहरू र कार्यालयहरू।
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ministries.map((m) => {
          const count = services.filter((s) => s.ministryId === m.id).length;
          return (
            <article key={m.id} className="card flex flex-col gap-2 p-5">
              <h3 className="text-lg font-bold leading-tight">{m.nameNe}</h3>
              {m.nameEn && (
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {m.nameEn}
                </div>
              )}
              {m.description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  {m.description}
                </p>
              )}
              <div className="mt-auto flex items-center gap-2">
                <span className="badge-blue">{count} सेवा</span>
                {m.website && (
                  <a
                    href={m.website}
                    className="text-xs text-nepal-blue hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    वेबसाइट ↗
                  </a>
                )}
              </div>
              <Link
                to={`/services?ministry=${m.id}`}
                className="btn-outline mt-2 self-start"
              >
                सेवा हेर्नुहोस् →
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
