import { useEffect, useMemo, useState } from "react";
import type { Category, Ministry, Office, Service } from "@/types";
import { deleteService, upsertService } from "@/lib/store";
import { useAuth } from "@/lib/auth";

const CATEGORIES: Category[] = [
  "नागरिकता",
  "राहदानी",
  "जग्गा",
  "सवारी",
  "शिक्षा",
  "कर",
  "स्वास्थ्य",
  "वैदेशिक रोजगार",
  "अन्य",
];

interface Props {
  services: Service[];
  ministries: Ministry[];
  offices: Office[];
}

export function AdminServices({ services, ministries, offices }: Props) {
  const { role } = useAuth();
  const canDelete = role === "admin";
  const [editing, setEditing] = useState<Service | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const t = filter.trim();
    if (!t) return services;
    return services.filter((s) =>
      [s.titleNe, s.titleEn ?? "", s.category, ...(s.aliases ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(t.toLowerCase()),
    );
  }, [services, filter]);

  return (
    <div className="space-y-4">
      <header className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h1 className="text-xl font-extrabold">सेवा प्रबन्धन</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            CRUD on services. {role === "editor" ? "(मेट्न पाइँदैन — admin only)" : ""}
          </p>
        </div>
        <button
          onClick={() => setEditing(blankService(ministries[0]?.id, offices[0]?.id))}
          className="btn-primary"
        >
          + नयाँ सेवा
        </button>
      </header>

      <div>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="सेवा खोज्नुहोस्…"
          className="input"
        />
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left dark:bg-zinc-800/50">
            <tr>
              <th className="px-4 py-2 font-semibold">शीर्षक</th>
              <th className="px-4 py-2 font-semibold">श्रेणी</th>
              <th className="px-4 py-2 font-semibold">कार्यालय</th>
              <th className="px-4 py-2 font-semibold">समय</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr
                key={s.id}
                className="border-t border-zinc-200 dark:border-zinc-800"
              >
                <td className="px-4 py-2 font-semibold">{s.titleNe}</td>
                <td className="px-4 py-2">{s.category}</td>
                <td className="px-4 py-2">
                  {offices.find((o) => o.id === s.officeId)?.nameNe ?? s.officeId}
                </td>
                <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">
                  {s.estimatedTimeNe}
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => setEditing(s)}
                    className="btn-outline mr-1"
                  >
                    सम्पादन
                  </button>
                  {canDelete && (
                    <button
                      onClick={async () => {
                        if (
                          !confirm(`"${s.titleNe}" सेवा मेट्न निश्चित हुनुहुन्छ?`)
                        )
                          return;
                        setBusy(true);
                        try {
                          await deleteService(s.id);
                        } finally {
                          setBusy(false);
                        }
                      }}
                      disabled={busy}
                      className="btn-danger"
                    >
                      मेट्नुहोस्
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
            कुनै सेवा भेटिएन।
          </div>
        )}
      </div>

      {editing && (
        <ServiceFormModal
          initial={editing}
          ministries={ministries}
          offices={offices}
          categories={CATEGORIES}
          onClose={() => setEditing(null)}
          onSave={async (s) => {
            setBusy(true);
            try {
              await upsertService(s);
              setEditing(null);
            } finally {
              setBusy(false);
            }
          }}
        />
      )}
    </div>
  );
}

function blankService(ministryId?: string, officeId?: string): Service {
  return {
    id: `svc-${crypto.randomUUID().slice(0, 8)}`,
    slug: `naya-sewa-${Date.now()}`,
    titleNe: "",
    category: "अन्य",
    ministryId: ministryId ?? "moha",
    officeId: officeId ?? "ward",
    summaryNe: "",
    steps: [],
    documents: [],
    estimatedTimeNe: "",
    feeNe: "",
    legalRefsNe: [],
    forms: [],
    aliases: [],
    tags: [],
  };
}

function ServiceFormModal({
  initial,
  ministries,
  offices,
  categories,
  onClose,
  onSave,
}: {
  initial: Service;
  ministries: Ministry[];
  offices: Office[];
  categories: Category[];
  onClose: () => void;
  onSave: (s: Service) => Promise<void>;
}) {
  const [s, setS] = useState<Service>(initial);
  const [stepsText, setStepsText] = useState(initial.steps.join("\n"));
  const [docsText, setDocsText] = useState(initial.documents.join("\n"));
  const [legalText, setLegalText] = useState(initial.legalRefsNe.join("\n"));
  const [aliasText, setAliasText] = useState((initial.aliases ?? []).join(", "));

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 sm:p-8">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const parsed: Service = {
            ...s,
            steps: stepsText.split("\n").map((x) => x.trim()).filter(Boolean),
            documents: docsText.split("\n").map((x) => x.trim()).filter(Boolean),
            legalRefsNe: legalText.split("\n").map((x) => x.trim()).filter(Boolean),
            aliases: aliasText
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean),
            slug:
              s.slug ||
              (s.titleNe || "service")
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
          };
          await onSave(parsed);
        }}
        className="card max-h-[88vh] w-full max-w-3xl overflow-y-auto p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">सेवा विवरण</h2>
          <button type="button" onClick={onClose} className="btn-ghost">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="शीर्षक (नेपालीमा)">
            <input
              required
              value={s.titleNe}
              onChange={(e) => setS({ ...s, titleNe: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="शीर्षक (English)">
            <input
              value={s.titleEn ?? ""}
              onChange={(e) => setS({ ...s, titleEn: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Slug">
            <input
              value={s.slug}
              onChange={(e) => setS({ ...s, slug: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="श्रेणी">
            <select
              value={s.category}
              onChange={(e) =>
                setS({ ...s, category: e.target.value as Category })
              }
              className="input"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="मन्त्रालय">
            <select
              value={s.ministryId}
              onChange={(e) => setS({ ...s, ministryId: e.target.value })}
              className="input"
            >
              {ministries.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nameNe}
                </option>
              ))}
            </select>
          </Field>
          <Field label="कार्यालय">
            <select
              value={s.officeId}
              onChange={(e) => setS({ ...s, officeId: e.target.value })}
              className="input"
            >
              {offices.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nameNe}
                </option>
              ))}
            </select>
          </Field>
          <Field label="अनुमानित समय">
            <input
              value={s.estimatedTimeNe}
              onChange={(e) =>
                setS({ ...s, estimatedTimeNe: e.target.value })
              }
              className="input"
            />
          </Field>
          <Field label="शुल्क / दस्तुर">
            <input
              value={s.feeNe}
              onChange={(e) => setS({ ...s, feeNe: e.target.value })}
              className="input"
            />
          </Field>
        </div>

        <Field label="संक्षिप्त विवरण" className="mt-3">
          <textarea
            rows={3}
            required
            value={s.summaryNe}
            onChange={(e) => setS({ ...s, summaryNe: e.target.value })}
            className="input"
          />
        </Field>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="प्रक्रिया (एक लाइनमा एक चरण)">
            <textarea
              rows={6}
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="आवश्यक कागजात (एक लाइनमा एउटा)">
            <textarea
              rows={6}
              value={docsText}
              onChange={(e) => setDocsText(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="कानुनी आधार (एक लाइनमा एउटा)">
            <textarea
              rows={4}
              value={legalText}
              onChange={(e) => setLegalText(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="अन्य नाम / aliases (कमाले छुट्याउनुहोस्)">
            <textarea
              rows={4}
              value={aliasText}
              onChange={(e) => setAliasText(e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">
            रद्द
          </button>
          <button type="submit" className="btn-primary">
            सुरक्षित गर्नुहोस्
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
