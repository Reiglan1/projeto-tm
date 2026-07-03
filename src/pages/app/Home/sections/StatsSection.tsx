export default function StatsSection() {
    const stats = [
        { value: "12k+", label: "Profissionais verificados ativos" },
        { value: "98%", label: "Taxa de satisfação dos clientes" },
        { value: "4.9★", label: "Avaliação média da plataforma" },
    ];

    return (
        <section className="relative bg-[#12233D]">

            {/* Perfuração superior */}
            <div className="absolute -top-[6px] left-0 right-0 flex justify-between px-8 sm:px-16">
                {Array.from({ length: 20 }).map((_, i) => (
                    <span key={i} className="w-[11px] h-[11px] rounded-b-full bg-[#F4F6F4]" />
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`px-6 py-8 sm:px-10 sm:py-11 flex flex-col items-center text-center border-b sm:border-b-0 last:border-b-0 border-dashed border-white/20 ${index < stats.length - 1 ? "sm:border-r sm:border-dashed" : ""}`}
                    >
                        <strong className="block text-4xl sm:text-5xl font-bold text-white tracking-[-1px] sm:tracking-[-2px] leading-none mb-2">
                            {stat.value}
                        </strong>
                        <p className="text-sm text-white/60 font-mono uppercase tracking-wide text-[12px]">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Perfuração inferior */}
            <div className="absolute -bottom-[1px] left-0 right-0 flex justify-between px-8 sm:px-16">
                {Array.from({ length: 20 }).map((_, i) => (
                    <span key={i} className="w-[11px] h-[6px] rounded-t-full bg-[#F4F6F4]" />
                ))}
            </div>
        </section>
    );
}