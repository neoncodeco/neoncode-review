"use client";

import Image from "next/image";
import Link from "next/link";

export function AuthShell({ children, badge, title, subtitle }) {
  return (
    <main className="relative flex min-h-[calc(100vh-57px)] items-center justify-center overflow-x-hidden bg-[var(--background)] px-3 py-8 sm:min-h-[calc(100vh-65px)] sm:px-4 sm:py-12">
      <div
        className="pointer-events-none absolute -top-24 right-[-10%] h-64 w-64 rounded-full opacity-40 blur-3xl sm:h-80 sm:w-80"
        style={{ background: "var(--brand)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 left-[-8%] h-56 w-56 rounded-full bg-[var(--brand-dark)]/10 blur-3xl sm:h-72 sm:w-72"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[var(--brand)]/20 blur-3xl"
        aria-hidden
      />

      <div className="relative w-full max-w-[420px] overflow-hidden rounded-[20px] border border-zinc-200/80 bg-white shadow-[0_24px_60px_-28px_rgba(10,20,10,0.35)] sm:rounded-[24px]">
        <div className="h-1.5 w-full bg-[var(--brand)]" />

        <div className="px-5 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-7">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-dark)] ring-1 ring-black/5 shadow-sm">
              <Image
                src="/image.png"
                alt="NeonCode"
                width={40}
                height={40}
                className="h-9 w-9 object-contain"
                priority
              />
            </div>
            {badge ? (
              <span className="mb-3 inline-flex items-center rounded-full bg-[var(--brand-muted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-dark)] ring-1 ring-[var(--brand)]/30">
                {badge}
              </span>
            ) : null}
            <h1 className="text-[1.55rem] font-semibold tracking-tight text-[var(--brand-dark)] sm:text-[1.75rem]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 max-w-[20rem] text-[13px] leading-relaxed text-zinc-500 sm:text-sm">
                {subtitle}
              </p>
            ) : null}
          </div>

          {children}
        </div>
      </div>
    </main>
  );
}

function FieldIcon({ name }) {
  const common = {
    className: "h-4 w-4",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": true,
  };
  if (name === "user") {
    return (
      <svg {...common}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0"
        />
      </svg>
    );
  }
  if (name === "mail") {
    return (
      <svg {...common}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7.5l9 6 9-6M4.5 6h15A1.5 1.5 0 0121 7.5v9a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 16.5v-9A1.5 1.5 0 014.5 6z"
        />
      </svg>
    );
  }
  if (name === "lock") {
    return (
      <svg {...common}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 10.5V8a4.5 4.5 0 119 0v2.5M6 10.5h12v9H6v-9z"
        />
      </svg>
    );
  }
  if (name === "key") {
    return (
      <svg {...common}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 7.5a3.75 3.75 0 11-1.06 7.38L12 17.5H9.75V19.5H7.5v-2.25L12.12 12.6A3.75 3.75 0 0115.75 7.5z"
        />
      </svg>
    );
  }
  return null;
}

export function AuthField({
  label,
  icon,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  minLength,
  autoComplete,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-[12px] font-medium text-zinc-600 sm:text-[13px]"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
          <FieldIcon name={icon} />
        </span>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className="w-full rounded-[12px] border border-zinc-200/90 bg-zinc-50/60 py-3 pl-11 pr-3.5 text-[14px] text-[var(--brand-dark)] outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-[var(--brand)] focus:bg-white focus:ring-[3px] focus:ring-[var(--brand-ring)]"
        />
      </div>
    </div>
  );
}

export function AuthSubmit({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="review-btn review-btn-primary mt-1 flex w-full items-center justify-center gap-2 rounded-[12px] py-[13px] text-sm font-semibold disabled:pointer-events-none disabled:opacity-55"
    >
      {loading ? (
        <>
          <span className="review-spinner h-4 w-4 rounded-full border-2 border-[var(--brand-dark)]/25 border-t-[var(--brand-dark)]" />
          Please wait…
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function AuthFooter({ text, href, linkLabel }) {
  return (
    <p className="mt-5 text-center text-[12px] text-zinc-400 sm:text-xs">
      {text}{" "}
      <Link
        href={href}
        className="font-semibold text-[var(--brand-dark)] underline decoration-[var(--brand)] underline-offset-2 hover:decoration-2"
      >
        {linkLabel}
      </Link>
    </p>
  );
}
