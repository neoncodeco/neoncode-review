import ReviewForm from "@/components/ReviewFrom";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-65px)] overflow-x-hidden bg-[var(--background)] font-sans">
      <div
        className="pointer-events-none absolute -top-28 right-0 h-80 w-80 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--brand)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-[var(--brand-dark)]/10 blur-3xl"
        aria-hidden
      />

      <main className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-8 sm:px-6 sm:py-12">
        <p className="mb-6 hidden text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-400 sm:block">
          Better Feedback{" "}
          <span style={{ color: "var(--brand-dark)" }}>→</span> Better Team
        </p>
        <ReviewForm />
      </main>
    </div>
  );
}
