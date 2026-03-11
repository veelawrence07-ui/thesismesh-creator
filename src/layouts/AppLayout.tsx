import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/upload-data", label: "Upload Data" },
  { to: "/citation-ledger", label: "Citation Ledger" },
  { to: "/ai-audit", label: "AI Audit" },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="w-64 border-r border-slate-300 bg-white px-6 py-8">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">ThesisMesh</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Research Dashboard</h1>
          </div>
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 bg-white p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
