import Link from "next/link";
import { Backdrop } from "@/components/Backdrop";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SectionDivider } from "@/components/SectionDivider";

export default function NotFound() {
  return (
    <div className="page-ground relative isolate overflow-hidden">
      <Backdrop />
      <div className="container-x">
        <Header />
        <main className="flex min-h-[52vh] flex-col items-center justify-center py-20 text-center">
          <SectionDivider />
          <p className="mt-6 text-[12px] leading-4 tracking-[4.4px] text-[#d3bbdb]">404</p>
          <h1 className="display mt-[18px] text-[clamp(40px,7vw,64px)] leading-[1.1] tracking-[1px] text-petal-200">
            Page not found
          </h1>
          <p className="mt-5 max-w-[420px] text-[16px] leading-[25px] text-mist-400">
            This part of the site is still being inked. Head back home or send us your idea.
          </p>
          <div className="mt-[30px] flex flex-wrap justify-center gap-x-[30px] gap-y-3.5">
            <Link href="/" className="btn btn-gold">
              Back home
            </Link>
            <Link href="/#idea" className="btn btn-outline">
              Tell us your idea
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
