import Link from "next/link";
import { Backdrop } from "@/components/Backdrop";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SectionDivider } from "@/components/SectionDivider";
import { getDictionary } from "@/lib/i18n";
import { bookPath, displayCase, localePath } from "@/lib/i18n/config";

export default async function NotFound() {
  const { lang, dict } = await getDictionary();
  const t = dict.notFound;

  return (
    // At least as tall as the screen: the message takes whatever height is left
    // over, so the footer rests on the bottom edge instead of ending short of it.
    <div className="page-ground relative isolate flex min-h-dvh flex-col overflow-hidden">
      <Backdrop scope="404" />
      <div className="container-x flex flex-1 flex-col">
        <Header lang={lang} nav={dict.nav} common={dict.common} switcherLabel={dict.langSwitcher.aria} />
        <main className="enter flex min-h-[52vh] flex-1 flex-col items-center justify-center py-20 text-center">
          <SectionDivider />
          <p className="eyebrow mt-6">404</p>
          <h1 className="display mt-[22px] text-[length:calc(clamp(40px,7vw,66px)*var(--display-scale))] leading-[1.04] tracking-[0.5px] text-cream">
            {displayCase(t.title, lang)}
          </h1>
          <p className="mt-5 max-w-[420px] text-[18px] font-light leading-[26px] text-body">{t.text}</p>
          <div className="mt-[34px] flex flex-wrap justify-center gap-x-7 gap-y-3.5">
            <Link href={localePath(lang)} className="btn btn-gold">
              {t.home}
            </Link>
            <Link href={bookPath(lang)} className="btn btn-outline">
              {t.idea}
            </Link>
          </div>
        </main>
        <Footer lang={lang} dict={dict} />
      </div>
    </div>
  );
}
