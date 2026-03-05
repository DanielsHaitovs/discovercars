"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, Users, BookOpen } from "lucide-react";

const NAV_ITEMS = [
  { href: "/",          label: "Search",   icon: Car      },
  { href: "/users",     label: "Users",    icon: Users    },
  { href: "/bookings",  label: "Bookings", icon: BookOpen },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 h-12">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}