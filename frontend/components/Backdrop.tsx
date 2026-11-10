/** Decorative glows and light streaks behind the page. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* violet bloom behind the hero flower */}
      <div className="absolute -top-32 right-[-15%] h-[720px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgba(140,50,175,0.42),transparent)]" />
      {/* pink streaks */}
      <div className="streak left-[-18%] top-[760px] h-[520px] w-[820px] -rotate-[28deg]" />
      <div className="streak right-[-22%] top-[1320px] h-[640px] w-[900px] rotate-[22deg]" />
      <div className="streak left-[-12%] top-[1900px] h-[420px] w-[700px] -rotate-[18deg] opacity-70" />
    </div>
  );
}
