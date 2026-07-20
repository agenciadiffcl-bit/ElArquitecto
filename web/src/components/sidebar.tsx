"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections: Array<{
  label: string | null;
  items: Array<{ href: string; label: string }>;
}> = [
  {
    label: null,
    items: [{ href: "/dashboard", label: "Dashboard" }],
  },
  {
    label: "Gestión",
    items: [
      { href: "/vehiculos", label: "Vehículos" },
      { href: "/leads", label: "Leads" },
      { href: "/embudo", label: "Embudo" },
      { href: "/control-ventas", label: "Control de Ventas" },
    ],
  },
  {
    label: "Marketing",
    items: [{ href: "/campanas", label: "Campañas" }],
  },
  {
    label: "Administración",
    items: [{ href: "/asistente", label: "Asistente IA" }],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-line bg-surface">
      <div className="px-6 pb-6 pt-7">
        <Link href="/dashboard" className="block">
          <span className="text-lg font-bold tracking-[0.25em] text-cream">
            DIFF
          </span>
          <span className="ml-1.5 text-lg font-light tracking-[0.25em] text-accent">
            MOTORS
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        {sections.map((section) => (
          <div key={section.label ?? "root"} className="mb-5">
            {section.label && (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded-lg px-3 py-2 text-[13.5px] transition-colors ${
                        active
                          ? "bg-accent-soft font-semibold text-accent"
                          : "text-silver hover:bg-surface-2 hover:text-cream"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-6 py-4">
        <p className="text-[13px] font-medium text-cream">Marketcar</p>
        <p className="text-[11.5px] text-muted">Los Trapenses · demo</p>
      </div>
    </aside>
  );
}
