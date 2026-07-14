import { useEffect, useRef, useState } from "react";

interface Stat {
    target: number;
    decimals: number;
    suffix: string;
    label: string;
}

const STATS: Stat[] = [
    { target: 12, decimals: 0, suffix: "k+", label: "Profissionais verificados ativos" },
    { target: 98, decimals: 0, suffix: "%", label: "Taxa de satisfação dos clientes" },
    { target: 4.9, decimals: 1, suffix: "★", label: "Avaliação média da plataforma" },
];

function useCountUp(active: boolean) {
    const [values, setValues] = useState<string[]>(STATS.map(() => "0"));

    useEffect(() => {
        if (!active) return;
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        if (reduce) {
            setValues(STATS.map((s) => s.target.toFixed(s.decimals)));
            return;
        }

        const duration = 1400;
        const start = performance.now();
        const ease = (t: number) => 1 - Math.pow(1 - t, 3);
        let frame: number;

        function step(now: number) {
            const t = Math.min(1, (now - start) / duration);
            const k = ease(t);
            setValues(STATS.map((s) => (s.target * k).toFixed(s.decimals)));
            if (t < 1) frame = requestAnimationFrame(step);
        }
        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [active]);

    return values;
}

export default function StatsSection() {
    const ref = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(false);
    const values = useCountUp(active);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActive(true);
                        io.disconnect();
                    }
                });
            },
            { threshold: 0.35 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <section className="relative bg-[#0A0A0A]">
            <div ref={ref} className="grid grid-cols-1 sm:grid-cols-3">
                {STATS.map((stat, index) => (
                    <div
                        key={stat.label}
                        className="px-6 py-8 sm:px-10 sm:py-11 flex flex-col items-center text-center border-b sm:border-b-0 last:border-b-0 border-dashed border-white/20"
                    >
                        <strong
                            className="block text-4xl sm:text-5xl tracking-[-1px] sm:tracking-[-2px] leading-none mb-2 uppercase"
                            style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400, color: index === 2 ? "#F5C518" : "#FFFFFF" }}
                        >
                            {values[index]}
                            {stat.suffix}
                        </strong>
                        <p className="text-sm text-white/60 font-mono uppercase tracking-wide text-[12px]">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
