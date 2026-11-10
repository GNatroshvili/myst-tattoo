import { Backdrop } from "@/components/Backdrop";
import { Footer } from "@/components/Footer";
import { GiftVouchers } from "@/components/GiftVouchers";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { IdeaSection } from "@/components/IdeaSection";
import { QuickLinks } from "@/components/QuickLinks";

export default function HomePage() {
  return (
    <div className="relative isolate overflow-x-clip">
      <Backdrop />
      <Header />
      <main>
        <Hero />
        <QuickLinks />
        <GiftVouchers />
        <IdeaSection />
      </main>
      <Footer />
    </div>
  );
}
