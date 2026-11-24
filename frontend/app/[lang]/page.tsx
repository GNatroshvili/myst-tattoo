import { Backdrop } from "@/components/Backdrop";
import { Faq } from "@/components/Faq";
import { FeaturedWorks } from "@/components/FeaturedWorks";
import { Footer } from "@/components/Footer";
import { GiftVouchers } from "@/components/GiftVouchers";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { IdeaSection } from "@/components/IdeaSection";
import { QuickLinks } from "@/components/QuickLinks";
import { StudioReviews } from "@/components/StudioReviews";
import { getDictionary } from "@/lib/i18n";

export default async function HomePage() {
  const { lang, dict } = await getDictionary();

  return (
    <div className="page-ground relative isolate overflow-hidden">
      <Backdrop scope="home" />
      <div className="container-x">
        <Header lang={lang} nav={dict.nav} common={dict.common} switcherLabel={dict.langSwitcher.aria} />
        <main>
          <Hero lang={lang} dict={dict} />
          <QuickLinks lang={lang} t={dict.quickLinks} />
          <FeaturedWorks lang={lang} dict={dict} />
          <GiftVouchers lang={lang} t={dict.vouchers} />
          <StudioReviews lang={lang} dict={dict} />
          <Faq lang={lang} dict={dict} />
          <IdeaSection lang={lang} dict={dict} />
        </main>
        <Footer lang={lang} dict={dict} />
      </div>
    </div>
  );
}
