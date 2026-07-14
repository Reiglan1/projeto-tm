import { useEffect, useState } from "react";

const DEBOUNCE_MS = 400;

interface SearchHeroProps {
  eyebrow: string;
  title: string;
  placeholder: string;
  onSearch: (value: string) => void;
}

export default function SearchHero({
  eyebrow,
  title,
  placeholder,
  onSearch,
}: SearchHeroProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(value.trim());
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <section className="relative overflow-hidden bg-[#0A0A0A] rounded-2xl px-6 py-10 sm:px-12 sm:py-14 mb-10">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#FFFFFF 1px, transparent 1px), linear-gradient(90deg, #FFFFFF 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative max-w-xl mx-auto text-center">
        <p className="flex items-center justify-center gap-2 text-[11px] font-mono font-semibold tracking-[2px] uppercase text-[#F5C518] mb-3">
          <span className="w-[18px] h-px bg-[#F5C518]" />
          {eyebrow}
          <span className="w-[18px] h-px bg-[#F5C518]" />
        </p>

        <h2 className="text-2xl sm:text-[32px] font-bold text-white mb-7 leading-tight tracking-[-0.5px] uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>
          {title}
        </h2>

        <div className="relative">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-5 top-1/2 -translate-y-1/2 text-[#3A3A3A]"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            className="w-full bg-white rounded-full pl-12 pr-5 py-4 text-sm text-[#0A0A0A] placeholder:text-[#3A3A3A] focus:outline-none focus:ring-2 focus:ring-[#F5C518] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.4)]"
          />
        </div>
      </div>
    </section>
  );
}