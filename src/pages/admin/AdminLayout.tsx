import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export function AdminLayout() {
  const { user, role, isDemo } = useAuth();

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-md px-4">
        <div className="card p-6 text-center">
          <h1 className="mb-2 text-xl font-bold">एडमिन प्यानल</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            पहिले लगइन गर्नुहोस्।
          </p>
          <Link to="/login" className="btn-primary mt-4">
            लगइन
          </Link>
        </div>
      </div>
    );
  }

  if (role === "viewer") {
    return (
      <div className="mx-auto w-full max-w-md px-4">
        <div className="card p-6 text-center">
          <h1 className="mb-2 text-xl font-bold">पहुँच निषेध</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            तपाईंलाई एडमिन/सम्पादक भूमिका तोकिएको छैन।
            {!isDemo && (
              <>
                {" "}
                कृपया <code>VITE_ADMIN_EMAILS</code> वा{" "}
                <code>VITE_EDITOR_EMAILS</code> मा आफ्नो इमेल थप्नुहोस्।
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 md:grid-cols-[220px_1fr]">
      <aside className="md:sticky md:top-20 md:self-start">
        <div className="card p-4">
          <div className="mb-2 text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            एडमिन प्यानल
          </div>
          <div className="mb-4 text-sm">
            <div className="font-semibold">
              {"displayName" in user && user.displayName
                ? user.displayName
                : user.email}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              भूमिका: <span className="badge-blue">{role}</span>
              {isDemo && <span className="badge-red ml-1">डेमो</span>}
            </div>
          </div>
          <nav className="flex flex-col gap-1 text-sm">
            <SideLink to="/admin" label="पृष्ठांकन" exact />
            <SideLink to="/admin/services" label="सेवा प्रबन्धन" />
            <SideLink to="/admin/ministries" label="मन्त्रालय" />
            <SideLink to="/admin/documents" label="कागजात/PDF अपलोड" />
          </nav>
        </div>
      </aside>
      <section>
        <Outlet />
      </section>
    </div>
  );
}

function SideLink({
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
        `rounded-lg px-3 py-2 font-semibold ${
          isActive
            ? "bg-nepal-blue text-white"
            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
