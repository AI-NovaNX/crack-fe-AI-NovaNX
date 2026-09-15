import Link from "next/link";

import { cn } from "@/lib/utils";

type AdminTab = "users" | "loans" | "books";

const tabs: Array<{ id: AdminTab; label: string; href: string }> = [
  { id: "users", label: "User List", href: "/admin/dashboard" },
  { id: "loans", label: "Borrowed List", href: "/admin/loans" },
  { id: "books", label: "Book List", href: "/admin/books" },
];

export function AdminTabs({ active }: { active: AdminTab }) {
  return (
    <nav
      aria-label="Admin management navigation"
      className="mb-7 flex w-full items-center gap-1 overflow-x-auto rounded-full border border-palette-indigo-300-20 bg-gray-200 p-1.5 shadow-[0_14px_35px_-24px_rgba(0,0,0,0.65)] sm:w-fit"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-5 py-2.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cyan-300",
              isActive
                ? "bg-gradient-to-r from-cyan-400/20 to-violet-500/20 font-extrabold text-palette-cyan-300 shadow-[inset_0_0_0_1px_rgba(77,222,255,0.28)]"
                : "font-semibold text-palette-slate-400 hover:bg-white/5 hover:text-palette-slate-50",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
