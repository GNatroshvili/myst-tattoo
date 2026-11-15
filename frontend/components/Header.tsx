"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav } from "@/lib/site";
import { Logo } from "./Logo";
import { ArrowUpRightIcon, CloseIcon, MenuIcon } from "./ui/Icons";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="relative z-30">
      <div className="flex items-center justify-between gap-x-6 pb-1.5 pt-3.5 lg:pl-4">
        <Logo />

        <nav
          aria-label="Main"
          className="hidden items-center gap-x-[58px] text-[15px] font-medium lg:flex"
        >
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`border-b-2 pb-2.5 pt-3 transition-colors ${
                  active
                    ? "border-gold text-white"
                    : "border-transparent text-mist-100 hover:text-gold"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 lg:-mr-3">
          <Link href="/#idea" className="btn btn-outline-gold hidden sm:inline-flex">
            Book Now <ArrowUpRightIcon className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line/40 text-mist-100 transition-colors hover:border-gold hover:text-gold lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="mb-2 mt-3 flex flex-col rounded-[18px] border border-line/20 bg-surface p-2.5 text-[16px] font-medium lg:hidden"
        >
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 items-center rounded-xl px-4 transition-colors hover:bg-white/[0.04] ${
                  active ? "text-gold" : "text-mist-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/#idea"
            onClick={() => setOpen(false)}
            className="btn btn-gold mt-2 sm:hidden"
          >
            Book Now <ArrowUpRightIcon className="h-3.5 w-3.5" />
          </Link>
        </nav>
      )}
    </header>
  );
}
