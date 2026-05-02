import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export function LoginPage() {
  const { isDemo, loginEmail, loginGoogle, loginDemo } = useAuth();
  const [email, setEmail] = useState(isDemo ? "admin@local" : "");
  const [password, setPassword] = useState(isDemo ? "admin123" : "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      if (isDemo) {
        await loginDemo(email, password);
      } else {
        await loginEmail(email, password);
      }
      navigate("/admin");
    } catch (e) {
      setErr((e as Error).message || "लगइन असफल भयो।");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4">
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">एडमिन लगइन</h1>
          {isDemo && <span className="chip">डेमो मोड</span>}
        </div>

        {isDemo && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-100">
            <strong>डेमो प्रमाणपत्र</strong>
            <div>एडमिन: <code>admin@local</code> / <code>admin123</code></div>
            <div>सम्पादक: <code>editor@local</code> / <code>editor123</code></div>
            <div className="mt-1 text-blue-800/80 dark:text-blue-200/80">
              उत्पादनमा Firebase कन्फिगर गर्न <code>.env</code> मा कुञ्जीहरू
              थप्नुहोस्।
            </div>
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="field-label">इमेल</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="admin@local"
            />
          </div>
          <div>
            <label className="field-label">पासवर्ड</label>
            <input
              type="password"
              required
              minLength={4}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>
          {err && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-200">
              {err}
            </div>
          )}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? "प्रतीक्षा…" : "लगइन"}
          </button>
        </form>

        {!isDemo && (
          <button
            onClick={async () => {
              setBusy(true);
              setErr(null);
              try {
                await loginGoogle();
                navigate("/admin");
              } catch (e) {
                setErr((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
            className="btn-outline mt-3 w-full"
          >
            Google मार्फत लगइन
          </button>
        )}

        <Link
          to="/"
          className="mt-4 block text-center text-sm text-zinc-500 hover:text-nepal-blue dark:text-zinc-400"
        >
          ← गृहपृष्ठमा फर्कनुहोस्
        </Link>
      </div>
    </div>
  );
}
