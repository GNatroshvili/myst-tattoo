import Link from "next/link";
import { Backdrop } from "@/components/Backdrop";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SparkleIcon } from "@/components/ui/Icons";

export default function NotFound() {
  return (
    <div className="relative isolate overflow-x-clip">
      <Backdrop />
      <Header />
      <main className="container-x flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
        <SparkleIcon className="h-8 w-8 animate-twinkle text-gold" />
        <p className="eyebrow mt-6">404</p>
        <h1 className="display text-gradient-lilac mt-3 text-5xl md:text-6xl">Page not found</h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-lilac-200/90">
          This part of the site is still being inked. Head back home or send us your idea.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn btn-primary">
            Back home
          </Link>
          <Link href="/#idea" className="btn btn-outline">
            Tell us your idea
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
