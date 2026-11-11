/** Decorative violet bloom behind the hero. Light silks live in their own sections. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 right-[-15%] h-[720px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgba(140,50,175,0.42),transparent)]" />
    </div>
  );
}
