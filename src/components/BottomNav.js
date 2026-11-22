"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "হোম", icon: "home" },
  { href: "/saved", label: "সেভ করা", icon: "saved" },
  { href: "/profile", label: "প্রোফাইল", icon: "profile" },
];

function NavIcon({ type }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {type === "home" && (
        <>
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v11h14V9" />
          <path d="M9 20v-7h6v7" />
        </>
      )}

      {type === "saved" && (
        <path d="M6 3h12v18l-6-4-6 4V3Z" />
      )}

      {type === "profile" && (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
        </>
      )}
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  const profilePages = ["/profile", "/about", "/contact", "/privacy"];

  return (
    <>
      <div
        aria-hidden="true"
        className="md:hidden"
        style={{ height: "calc(88px + env(safe-area-inset-bottom))" }}
      />

      <nav
        aria-label="মূল নেভিগেশন"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e4eae7] bg-white md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto grid max-w-lg grid-cols-3 px-3 py-2">
          {items.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/" || pathname.startsWith("/doctors/")
                : item.href === "/profile"
                ? profilePages.includes(pathname)
                : pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-sm ${
                  active
                    ? "bg-[#edf6f1] font-semibold text-[#16735d]"
                    : "text-[#66766e]"
                }`}
              >
                <NavIcon type={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}