import Link from "next/link";
import {
  ArrowRightIcon,
  ArtistsIcon,
  PiercingIcon,
  TattooIcon,
  WhyMystIcon,
} from "./ui/Icons";

const links = [
  { label: "Tattoos", href: "/tattoos", Icon: TattooIcon, wide: false },
  { label: "Piercing", href: "/piercing", Icon: PiercingIcon, wide: false },
  { label: "Our Artists", href: "/artists", Icon: ArtistsIcon, wide: true },
  { label: "Why Myst", href: "/why-myst", Icon: WhyMystIcon, wide: false },
];

export function QuickLinks() {
  return (
    <section id="links" aria-label="Explore" className="scroll-mt-6 pt-8 lg:pt-1.5">
      <ul className="grid grid-cols-2 gap-y-7 md:grid-cols-4">
        {links.map(({ label, href, Icon, wide }) => (
          <li
            key={href}
            className="border-line/28 even:border-l md:border-l md:first:border-l-0"
          >
            <Link
              href={href}
              className="group flex flex-col items-center gap-2.5 px-3 pb-2.5 pt-2 text-center text-mist-100 transition-colors hover:text-gold"
            >
              <Icon
                className={`h-[46px] text-orchid transition-colors group-hover:text-gold ${
                  wide ? "w-[54px]" : "w-[46px]"
                }`}
              />
              <span className="text-[21px] font-medium leading-7">{label}</span>
              <ArrowRightIcon className="h-3.5 w-5 text-orchid-soft transition group-hover:translate-x-1 group-hover:text-gold" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
