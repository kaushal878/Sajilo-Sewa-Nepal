import { useState } from "react";
import type { FormDoc, Service } from "@/types";
import { upsertService, uploadDocument } from "@/lib/store";
import { useAuth } from "@/lib/auth";

interface Props {
  services: Service[];
}

type Kind = FormDoc["kind"];

export function AdminDocuments({ services }: Props) {
  const { isDemo } = useAuth();
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [titleNe, setTitleNe] = useState("");
  const [kind, setKind] = useState<Kind>("form");
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [extracted, setExtracted] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function extractPdfText(f: File): Promise<string> {
    // Lightweight, dependency-free PDF text peek: scan for `(text)` operators.
    // Good enough to display *something* without pulling pdf.js.
    const buf = await f.arrayBuffer();
    const txt = new TextDecoder("latin1").decode(buf);
    const matches = txt.match(/\(([^()\\]{2,200})\)/g) ?? [];
    return matches
      .slice(0, 80)
      .map((m) => m.slice(1, -1))
      .filter((s) => /[A-Za-z]/.test(s) || /[\u0900-\u097F]/.test(s))
      .join(" • ")
      .slice(0, 2000);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceId) return;
    if (!file && !externalUrl) {
      setMsg("कृपया फाइल अपलोड गर्नुहोस् वा बाह्य URL दिनुहोस्।");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      let url = externalUrl.trim();
      if (file) {
        url = await uploadDocument(file, "service-forms");
        if (file.type === "application/pdf") {
          try {
            setExtracted(await extractPdfText(file));
          } catch {
            /* ignore */
          }
        }
      }
      const target = services.find((x) => x.id === serviceId);
      if (!target) throw new Error("सेवा भेटिएन");
      const next: Service = {
        ...target,
        forms: [
          ...(target.forms ?? []),
          {
            id: `f-${crypto.randomUUID().slice(0, 6)}`,
            titleNe: titleNe || file?.name || "कागजात",
            url,
            kind,
          },
        ],
      };
      await upsertService(next);
      setMsg(
        `"${next.titleNe}" मा कागजात जोडियो।${
          isDemo ? " (डेमो मोडमा फाइल केवल यसै सेसनको लागि उपलब्ध हुन्छ)" : ""
        }`,
      );
      setFile(null);
      setExternalUrl("");
      setTitleNe("");
    } catch (e) {
      setMsg((e as Error).message || "अपलोड असफल");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="card p-5">
        <h1 className="text-xl font-extrabold">कागजात / PDF अपलोड</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          सेवासँग सरकारी फारम, नियम वा सूचनाका PDF फाइल जोड्नुहोस्।
        </p>
      </header>

      <form onSubmit={submit} className="card grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
        <Field label="सेवा">
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="input"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.titleNe}
              </option>
            ))}
          </select>
        </Field>
        <Field label="कागजातको शीर्षक">
          <input
            value={titleNe}
            onChange={(e) => setTitleNe(e.target.value)}
            className="input"
            placeholder="जस्तै: नागरिकता निवेदन फारम"
          />
        </Field>
        <Field label="प्रकार">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as Kind)}
            className="input"
          >
            <option value="form">फारम (form)</option>
            <option value="rule">नियम/कानुन (rule)</option>
            <option value="notice">सूचना (notice)</option>
          </select>
        </Field>
        <Field label="बाह्य लिंक (वैकल्पिक)">
          <input
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://..."
            className="input"
          />
        </Field>
        <Field label="PDF फाइल">
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="input"
          />
        </Field>
        <div className="flex items-end">
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? "अपलोड…" : "अपलोड र जोड्नुहोस्"}
          </button>
        </div>

        {msg && (
          <div className="md:col-span-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900 dark:bg-blue-900/20 dark:text-blue-100">
            {msg}
          </div>
        )}

        {extracted && (
          <div className="md:col-span-2">
            <div className="field-label">अपलोड गरिएको PDF बाट निकालिएको पाठ (झलक)</div>
            <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900">
              {extracted}
            </pre>
          </div>
        )}
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
