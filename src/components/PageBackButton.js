"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function PageBackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const visitedPages = useRef([]);

  useEffect(() => {
    const pages = visitedPages.current;

    if (pages[pages.length - 1] === pathname) return;

    if (pages.length > 1 && pages[pages.length - 2] === pathname) {
      pages.pop();
    } else {
      pages.push(pathname);
    }
  }, [pathname]);

  function goBack() {
    if (visitedPages.current.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  if (pathname === "/") return null;

  return (
    <div className="border-b border-[#e4eae7] bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[#16735d] hover:bg-[#edf5f1] focus-visible:outline-2 focus-visible:outline-[#16735d]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M5 12h14" />
          </svg>
          ফিরে যান
        </button>
      </div>
    </div>
  );
}