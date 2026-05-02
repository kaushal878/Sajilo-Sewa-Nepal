import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

export function Header() {
  const { user, role, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const loc = useLocation();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800/70 dark:bg-nepal-ink/80">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-nepal-blue to-nepal-red text-white shadow-cyber">
            <span className="text-lg font-extrabold">स</span>
          </div>
          <div className="leading-tight">
            <div className="text-base font-extrabold">सजिलो सेवा नेपाल</div>
            <div className="text-[11px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Sajilo Sewa Nepal
            </div>
          </div>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <NavItem to="/" label="गृह" exact />
          <NavItem to="/services" label="सेवाहरू" />
          <NavItem to="/ministries" label="मन्त्रालयहरू" />
          <NavItem to="/bookmarks" label="बुकमार्क" />
          <NavItem to="/admin" label="एडमिन" />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggle}
            className="btn-outline"
            aria-label="theme toggle"
            title={theme === "dark" ? "लाइट मोड" : "डार्क मोड"}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="chip">
                <span className="hidden lg:inline">
                  {"displayName" in user && user.displayName
                    ? user.displayName
                    : user.email}
                </span>
                <span className="badge-blue ml-1">{role}</span>
              </span>
              <button onClick={() => logout()} className="btn-ghost">
                बाहिरिनुहोस्
              </button>
            </div>
          ) : (
            !loc.pathname.startsWith("/login") && (
              <Link to="/login" className="btn-primary">
                लगइन
              </Link>
            )
          )}
        </div>
      </div>
      <MobileNav />
    </header>
  );
}

function NavItem({
  to,
  label,
  exact,
}: {
  to: string;
  label: string;
  exact?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
          isActive
            ? "bg-nepal-blue text-white"
            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

function MobileNav() {
  return (
    <div className="overflow-x-auto border-t border-zinc-200/70 bg-white/80 dark:border-zinc-800/70 dark:bg-nepal-ink/80 md:hidden">
      <div className="flex min-w-max items-center gap-1 px-3 py-2">
        <NavItem to="/" label="गृह" exact />
        <NavItem to="/services" label="सेवाहरू" />
        <NavItem to="/ministries" label="मन्त्रालयहरू" />
        <NavItem to="/bookmarks" label="बुकमार्क" />
        <NavItem to="/admin" label="एडमिन" />
      </div>
    </div>
  );
}
