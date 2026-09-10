import ReviewForm from "@/components/ReviewFrom";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-57px)] overflow-x-hidden bg-[var(--background)] font-sans sm:min-h-[calc(100vh-65px)]">
      <div
        className="pointer-events-none absolute -top-28 right-0 h-56 w-56 rounded-full opacity-35 blur-3xl sm:h-80 sm:w-80 sm:opacity-40"
        style={{ background: "var(--brand)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 left-0 h-52 w-52 rounded-full bg-[var(--brand-dark)]/10 blur-3xl sm:h-72 sm:w-72"
        aria-hidden
      />

      <main className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-3 py-5 sm:px-6 sm:py-12">
        <p className="mb-4 hidden text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 sm:mb-6 sm:block">
          Better Feedback{" "}
          <span style={{ color: "var(--brand-dark)" }}>→</span> Better Team
        </p>
        <ReviewForm />
      </main>
    </div>
  );
}
