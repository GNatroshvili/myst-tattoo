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
      <div className="container-x flex h-20 items-center justify-between gap-4 md:h-24 md:gap-6">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-6 md:flex lg:gap-9">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="relative py-2 text-[15px] text-lilac-100/90 transition hover:text-white"
              >
                {item.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-gold transition-opacity ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <Link href="#idea" className="btn btn-outline-gold hidden md:inline-flex">
          Book Now <ArrowUpRightIcon className="h-4 w-4" />
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="rounded-full border border-lilac-400/30 p-2.5 text-lilac-100 transition hover:border-lilac-300 md:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="container-x pb-6 md:hidden">
          <nav aria-label="Mobile" className="panel flex flex-col gap-1 p-3">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-xl px-4 py-3 text-base transition hover:bg-white/5 ${
                    active ? "text-gold" : "text-lilac-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="#idea"
              onClick={() => setOpen(false)}
              className="btn btn-primary mt-2"
            >
              Book Now <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
