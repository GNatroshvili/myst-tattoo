import Link from "next/link";
import {
  ArrowDownIcon,
  EarIcon,
  PeopleIcon,
  SparkleOutlineIcon,
  StarsIcon,
} from "./ui/Icons";

const links = [
  { label: "Tattoos", href: "/tattoos", Icon: SparkleOutlineIcon },
  { label: "Piercing", href: "/piercing", Icon: EarIcon },
  { label: "Our Artists", href: "/artists", Icon: PeopleIcon },
  { label: "Why Myst", href: "/why-myst", Icon: StarsIcon },
];

export function QuickLinks() {
  return (
    <section aria-label="Explore" className="container-x py-4">
      <ul className="grid grid-cols-2 md:grid-cols-4">
        {links.map(({ label, href, Icon }) => (
          <li
            key={href}
            className="border-lilac-400/20 even:border-l md:border-l md:first:border-l-0"
          >
            <Link
              href={href}
              className="group flex flex-col items-center gap-3 px-4 py-7 text-center transition hover:bg-white/[0.025]"
            >
              <Icon className="h-10 w-10 text-lilac-300 transition group-hover:text-gold" />
              <span className="text-lg text-lilac-50">{label}</span>
              <ArrowDownIcon className="h-4 w-4 text-lilac-300 transition group-hover:translate-y-1 group-hover:text-gold" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
