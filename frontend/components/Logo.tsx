import Image from "next/image";
import Link from "next/link";
import logo from "@/public/images/logo.png";

/** Header logo: the studio's mark. Links home. */
export function Logo({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`flex shrink-0 items-center transition-opacity hover:opacity-85 ${className}`}
    >
      {/* a little smaller on phones, where it shares the row with the menu */}
      <Image
        src={logo}
        alt=""
        preload
        sizes="68px"
        className="block h-[72px] w-auto sm:h-[88px]"
        draggable={false}
      />
    </Link>
  );
}

/** The same mark at voucher-card size (decorative, not a link). */
export function CardLogo() {
  return (
    <Image
      src={logo}
      alt=""
      sizes="91px"
      className="block h-[118px] w-auto select-none opacity-[0.92]"
      draggable={false}
    />
  );
}
