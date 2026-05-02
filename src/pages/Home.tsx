import { Link } from "react-router-dom";
import type { Category, Service } from "@/types";
import { SearchBar } from "@/components/SearchBar";
import { ServiceCard } from "@/components/ServiceCard";

const FEATURED: { label: string; cat: Category; icon: string }[] = [
  { label: "नागरिकता", cat: "नागरिकता", icon: "🪪" },
  { label: "राहदानी", cat: "राहदानी", icon: "📘" },
  { label: "जग्गा", cat: "जग्गा", icon: "🏞" },
  { label: "सवारी", cat: "सवारी", icon: "🛵" },
  { label: "शिक्षा", cat: "शिक्षा", icon: "🎓" },
  { label: "कर / पान", cat: "कर", icon: "💼" },
];

interface Props {
  services: Service[];
  isDemo: boolean;
}

export function Home({ services, isDemo }: Props) {
  const popular = services.slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-grid p-6 sm:p-10 dark:border-zinc-800">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-nepal-blue/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-nepal-red/15 blur-3xl" />
        <div className="relative z-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="badge-red">नेपाल</span>
            <span className="badge-blue">सरकारी सेवा</span>
            {isDemo && <span className="chip">डेमो मोड</span>}
          </div>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            कुनै पनि सरकारी काम — कुन कार्यालय, कुन प्रक्रिया, कुन कागजात?
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
            नागरिकता, राहदानी, जग्गा नामसारी, पान कार्ड, सवारी चालक अनुमतिपत्र
            लगायतका सेवा — एकै ठाउँमा, सजिलो भाषामा।
          </p>

          <div className="mt-6 max-w-3xl">
            <SearchBar services={services} large />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {FEATURED.map((f) => (
              <Link
                key={f.cat}
                to={`/services?cat=${encodeURIComponent(f.cat)}`}
                className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat n={services.length} label="कुल सेवा" />
        <Stat n={7} label="मन्त्रालय" />
        <Stat n={10} label="कार्यालय" />
        <Stat n={9} label="श्रेणी" />
      </section>

      {/* Popular services */}
      <section className="mt-10">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-extrabold">लोकप्रिय सेवाहरू</h2>
          <Link to="/services" className="text-sm font-semibold text-nepal-blue">
            सबै हेर्नुहोस् →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="card p-4">
      <div className="text-3xl font-extrabold text-nepal-blue dark:text-blue-300">
        {n}
      </div>
      <div className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
    </div>
  );
}
