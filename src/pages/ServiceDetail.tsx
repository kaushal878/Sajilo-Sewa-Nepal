import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Service } from "@/types";
import { ministryMap, officeMap } from "@/data/ministries";
import { isBookmarked, toggleBookmark } from "@/lib/bookmarks";

interface Props {
  services: Service[];
}

export function ServiceDetail({ services }: Props) {
  const { slug = "" } = useParams();
  const service = services.find((s) => s.slug === slug);
  const [marked, setMarked] = useState(
    service ? isBookmarked(service.id) : false,
  );

  useEffect(() => {
    if (!service) return;
    setMarked(isBookmarked(service.id));
  }, [service]);

  if (!service) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="card p-8 text-center">
          <h1 className="text-xl font-bold">सेवा भेटिएन</h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            तपाईंले खोज्नुभएको सेवा उपलब्ध छैन।
          </p>
          <Link to="/services" className="btn-primary mt-4">
            सबै सेवा हेर्नुहोस्
          </Link>
        </div>
      </div>
    );
  }

  const ministry = ministryMap.get(service.ministryId);
  const office = officeMap.get(service.officeId);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: service?.titleNe,
          text: service?.summaryNe,
          url,
        });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    await navigator.clipboard.writeText(url);
    alert("लिंक प्रतिलिपि भयो!");
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <Link
        to="/services"
        className="mb-4 inline-block text-sm text-zinc-500 hover:text-nepal-blue dark:text-zinc-400"
      >
        ← सबै सेवामा फर्कनुहोस्
      </Link>

      <header className="card relative overflow-hidden p-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-nepal-blue/15 blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="badge-blue">{service.category}</span>
            {ministry && (
              <span className="chip">{ministry.shortNe ?? ministry.nameNe}</span>
            )}
            {office && <span className="chip">{office.nameNe}</span>}
          </div>
          <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            {service.titleNe}
          </h1>
          {service.titleEn && (
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              {service.titleEn}
            </div>
          )}
          <p className="mt-3 max-w-3xl text-zinc-700 dark:text-zinc-200">
            {service.summaryNe}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                toggleBookmark(service.id);
                setMarked((b) => !b);
              }}
              className={marked ? "btn-danger" : "btn-outline"}
            >
              {marked ? "★ बुकमार्क हटाउनुहोस्" : "☆ बुकमार्क"}
            </button>
            <button onClick={share} className="btn-outline">
              ↗ साझेदारी
            </button>
            {ministry?.website && (
              <a
                href={ministry.website}
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
              >
                आधिकारिक वेबसाइट
              </a>
            )}
          </div>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Info icon="⏱" title="अनुमानित समय" value={service.estimatedTimeNe} />
        <Info icon="💵" title="शुल्क / दस्तुर" value={service.feeNe} />
        <Info
          icon="🏛"
          title="कार्यालय"
          value={office?.nameNe ?? "—"}
          extra={office?.addressNe}
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-lg font-bold">प्रक्रिया (Step-by-Step)</h2>
          <ol className="mt-3 space-y-2">
            {service.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-nepal-blue text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-bold">आवश्यक कागजातहरू</h2>
          <ul className="mt-3 space-y-2">
            {service.documents.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-nepal-red">📄</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-lg font-bold">कानुनी आधार</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {service.legalRefsNe.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <h2 className="text-lg font-bold">फारम / सूचना डाउनलोड</h2>
          {service.forms && service.forms.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {service.forms.map((f) => (
                <li key={f.id}>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                  >
                    <span>📥</span>
                    <span>{f.titleNe}</span>
                    <span className="ml-auto badge-blue">{f.kind}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              यस सेवाका लागि अहिले कुनै फारम अपलोड गरिएको छैन।
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Info({
  icon,
  title,
  value,
  extra,
}: {
  icon: string;
  title: string;
  value: string;
  extra?: string;
}) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
        {icon} {title}
      </div>
      <div className="mt-1 font-semibold">{value}</div>
      {extra && (
        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {extra}
        </div>
      )}
    </div>
  );
}
