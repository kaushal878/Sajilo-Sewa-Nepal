import { Link } from "react-router-dom";
import type { Ministry, Service } from "@/types";

interface Props {
  services: Service[];
  ministries: Ministry[];
}

export function AdminDashboard({ services, ministries }: Props) {
  const byCat = services.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <header className="card p-5">
        <h1 className="text-xl font-extrabold">एडमिन पृष्ठांकन</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          सेवा, मन्त्रालय, र कार्यालयको त्वरित अवलोकन।
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat n={services.length} label="कुल सेवा" />
        <Stat n={ministries.length} label="मन्त्रालय" />
        <Stat n={Object.keys(byCat).length} label="सक्रिय श्रेणी" />
        <Stat
          n={services.reduce((acc, s) => acc + (s.forms?.length ?? 0), 0)}
          label="जोडिएका फारम"
        />
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-bold">श्रेणी अनुसार सेवा</h2>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Object.entries(byCat).map(([k, v]) => (
            <li
              key={k}
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
            >
              <span className="font-semibold">{k}</span>
              <span className="badge-blue">{v}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Link to="/admin/services" className="card p-5 hover:shadow-cyber">
          <div className="text-2xl">📝</div>
          <div className="mt-2 font-bold">सेवा थप/सम्पादन</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            CRUD on services
          </div>
        </Link>
        <Link to="/admin/ministries" className="card p-5 hover:shadow-cyber">
          <div className="text-2xl">🏛</div>
          <div className="mt-2 font-bold">मन्त्रालय / कार्यालय</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            ministries & offices
          </div>
        </Link>
        <Link to="/admin/documents" className="card p-5 hover:shadow-cyber">
          <div className="text-2xl">📑</div>
          <div className="mt-2 font-bold">PDF / कानुन अपलोड</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            forms, rules, notices
          </div>
        </Link>
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
