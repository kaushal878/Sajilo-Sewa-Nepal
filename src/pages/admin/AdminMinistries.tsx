import { useState } from "react";
import type { Ministry, Office } from "@/types";
import {
  deleteMinistry,
  deleteOffice,
  upsertMinistry,
  upsertOffice,
} from "@/lib/store";
import { useAuth } from "@/lib/auth";

interface Props {
  ministries: Ministry[];
  offices: Office[];
}

export function AdminMinistries({ ministries, offices }: Props) {
  const { role } = useAuth();
  const canDelete = role === "admin";

  const [draftM, setDraftM] = useState<Ministry | null>(null);
  const [draftO, setDraftO] = useState<Office | null>(null);

  return (
    <div className="space-y-6">
      <header className="card p-5">
        <h1 className="text-xl font-extrabold">मन्त्रालय र कार्यालय</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Manage ministries and offices.
        </p>
      </header>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">मन्त्रालयहरू</h2>
          <button
            onClick={() =>
              setDraftM({
                id: `m-${crypto.randomUUID().slice(0, 6)}`,
                nameNe: "",
                nameEn: "",
                shortNe: "",
                website: "",
                description: "",
              })
            }
            className="btn-primary"
          >
            + नयाँ मन्त्रालय
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left dark:bg-zinc-800/50">
              <tr>
                <th className="px-3 py-2 font-semibold">नेपाली</th>
                <th className="px-3 py-2 font-semibold">English</th>
                <th className="px-3 py-2 font-semibold">वेबसाइट</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {ministries.map((m) => (
                <tr
                  key={m.id}
                  className="border-t border-zinc-200 dark:border-zinc-800"
                >
                  <td className="px-3 py-2 font-semibold">{m.nameNe}</td>
                  <td className="px-3 py-2">{m.nameEn ?? "—"}</td>
                  <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">
                    {m.website ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => setDraftM(m)}
                      className="btn-outline mr-1"
                    >
                      सम्पादन
                    </button>
                    {canDelete && (
                      <button
                        onClick={async () => {
                          if (
                            confirm(`मन्त्रालय "${m.nameNe}" मेट्न निश्चित?`)
                          )
                            await deleteMinistry(m.id);
                        }}
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
        </div>
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">कार्यालयहरू</h2>
          <button
            onClick={() =>
              setDraftO({
                id: `o-${crypto.randomUUID().slice(0, 6)}`,
                nameNe: "",
                nameEn: "",
                ministryId: ministries[0]?.id ?? "",
              })
            }
            className="btn-primary"
          >
            + नयाँ कार्यालय
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left dark:bg-zinc-800/50">
              <tr>
                <th className="px-3 py-2 font-semibold">नेपाली</th>
                <th className="px-3 py-2 font-semibold">मन्त्रालय</th>
                <th className="px-3 py-2 font-semibold">ठेगाना</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {offices.map((o) => {
                const m = ministries.find((x) => x.id === o.ministryId);
                return (
                  <tr
                    key={o.id}
                    className="border-t border-zinc-200 dark:border-zinc-800"
                  >
                    <td className="px-3 py-2 font-semibold">{o.nameNe}</td>
                    <td className="px-3 py-2">{m?.nameNe ?? o.ministryId}</td>
                    <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">
                      {o.addressNe ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => setDraftO(o)}
                        className="btn-outline mr-1"
                      >
                        सम्पादन
                      </button>
                      {canDelete && (
                        <button
                          onClick={async () => {
                            if (
                              confirm(`कार्यालय "${o.nameNe}" मेट्न निश्चित?`)
                            )
                              await deleteOffice(o.id);
                          }}
                          className="btn-danger"
                        >
                          मेट्नुहोस्
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {draftM && (
        <ModalForm
          title="मन्त्रालय सम्पादन"
          onClose={() => setDraftM(null)}
          onSubmit={async () => {
            if (!draftM.nameNe.trim()) return;
            await upsertMinistry(draftM);
            setDraftM(null);
          }}
        >
          <Field label="नाम (नेपाली)">
            <input
              required
              value={draftM.nameNe}
              onChange={(e) => setDraftM({ ...draftM, nameNe: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="नाम (English)">
            <input
              value={draftM.nameEn ?? ""}
              onChange={(e) => setDraftM({ ...draftM, nameEn: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="छोटो नाम">
            <input
              value={draftM.shortNe ?? ""}
              onChange={(e) =>
                setDraftM({ ...draftM, shortNe: e.target.value })
              }
              className="input"
            />
          </Field>
          <Field label="वेबसाइट">
            <input
              value={draftM.website ?? ""}
              onChange={(e) =>
                setDraftM({ ...draftM, website: e.target.value })
              }
              className="input"
            />
          </Field>
          <Field label="विवरण">
            <textarea
              rows={3}
              value={draftM.description ?? ""}
              onChange={(e) =>
                setDraftM({ ...draftM, description: e.target.value })
              }
              className="input"
            />
          </Field>
        </ModalForm>
      )}

      {draftO && (
        <ModalForm
          title="कार्यालय सम्पादन"
          onClose={() => setDraftO(null)}
          onSubmit={async () => {
            if (!draftO.nameNe.trim()) return;
            await upsertOffice(draftO);
            setDraftO(null);
          }}
        >
          <Field label="नाम (नेपाली)">
            <input
              required
              value={draftO.nameNe}
              onChange={(e) => setDraftO({ ...draftO, nameNe: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="नाम (English)">
            <input
              value={draftO.nameEn ?? ""}
              onChange={(e) => setDraftO({ ...draftO, nameEn: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="मन्त्रालय">
            <select
              value={draftO.ministryId}
              onChange={(e) =>
                setDraftO({ ...draftO, ministryId: e.target.value })
              }
              className="input"
            >
              {ministries.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nameNe}
                </option>
              ))}
            </select>
          </Field>
          <Field label="ठेगाना">
            <input
              value={draftO.addressNe ?? ""}
              onChange={(e) =>
                setDraftO({ ...draftO, addressNe: e.target.value })
              }
              className="input"
            />
          </Field>
          <Field label="फोन">
            <input
              value={draftO.phone ?? ""}
              onChange={(e) => setDraftO({ ...draftO, phone: e.target.value })}
              className="input"
            />
          </Field>
        </ModalForm>
      )}
    </div>
  );
}

function ModalForm({
  title,
  children,
  onSubmit,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onSubmit: () => Promise<void>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 sm:p-8">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await onSubmit();
          } finally {
            setBusy(false);
          }
        }}
        className="card max-h-[88vh] w-full max-w-2xl space-y-3 overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">{title}</h2>
          <button type="button" onClick={onClose} className="btn-ghost">
            ✕
          </button>
        </div>
        {children}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">
            रद्द
          </button>
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? "..." : "सुरक्षित"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
