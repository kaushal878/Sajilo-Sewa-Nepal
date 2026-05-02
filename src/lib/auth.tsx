import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import {
  isFirebaseConfigured,
  onUserChange,
  signOut,
  emailSignIn,
  googleSignIn,
} from "./firebase";
import type { Role } from "@/types";

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((s: string) => s.trim().toLowerCase())
  .filter(Boolean);
const EDITOR_EMAILS = (import.meta.env.VITE_EDITOR_EMAILS || "")
  .split(",")
  .map((s: string) => s.trim().toLowerCase())
  .filter(Boolean);

const DEMO_KEY = "ssn_demo_admin_v1";

type DemoUser = {
  email: string;
  role: Role;
  displayName: string;
  isDemo: true;
};

type AuthCtx = {
  user: User | DemoUser | null;
  role: Role;
  loading: boolean;
  isDemo: boolean;
  loginEmail: (email: string, password: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  loginDemo: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

function roleFor(email: string | null | undefined): Role {
  if (!email) return "viewer";
  const e = email.toLowerCase();
  if (ADMIN_EMAILS.includes(e)) return "admin";
  if (EDITOR_EMAILS.includes(e)) return "editor";
  return "viewer";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Demo-mode bootstrap (no Firebase)
  useEffect(() => {
    if (isFirebaseConfigured) return;
    try {
      const raw = localStorage.getItem(DEMO_KEY);
      if (raw) setUser(JSON.parse(raw) as DemoUser);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  // Firebase auth subscription
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = onUserChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const isDemo = !isFirebaseConfigured;

  const role: Role = useMemo(() => {
    if (!user) return "viewer";
    if ("isDemo" in user) return user.role;
    return roleFor(user.email);
  }, [user]);

  const loginEmail = useCallback(async (email: string, password: string) => {
    await emailSignIn(email, password);
  }, []);

  const loginGoogle = useCallback(async () => {
    await googleSignIn();
  }, []);

  const loginDemo = useCallback(
    async (email: string, password: string) => {
      // Local-only demo login. Use admin@local / admin123 for admin role.
      const e = email.trim().toLowerCase();
      if (
        (e === "admin@local" && password === "admin123") ||
        (e === "editor@local" && password === "editor123")
      ) {
        const demo: DemoUser = {
          email: e,
          role: e.startsWith("admin") ? "admin" : "editor",
          displayName: e.startsWith("admin") ? "डेमो एडमिन" : "डेमो सम्पादक",
          isDemo: true,
        };
        localStorage.setItem(DEMO_KEY, JSON.stringify(demo));
        setUser(demo);
        return;
      }
      throw new Error(
        "गलत डेमो प्रमाणपत्र। admin@local / admin123 वा editor@local / editor123 प्रयोग गर्नुहोस्।",
      );
    },
    [],
  );

  const logout = useCallback(async () => {
    if (isFirebaseConfigured) {
      await signOut();
    } else {
      localStorage.removeItem(DEMO_KEY);
      setUser(null);
    }
  }, []);

  const value: AuthCtx = {
    user,
    role,
    loading,
    isDemo,
    loginEmail,
    loginGoogle,
    loginDemo,
    logout,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
