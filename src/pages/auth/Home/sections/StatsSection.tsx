export default function StatsSection() {
    const stats = [
        { value: "12k+", label: "Profissionais verificados ativos" },
        { value: "98%", label: "Taxa de satisfação dos clientes" },
        { value: "4.9★", label: "Avaliação média da plataforma" },
    ];

    return (
        <section className="relative bg-[#12233D]">
            <div className="grid grid-cols-1 sm:grid-cols-3">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`px-6 py-8 sm:px-10 sm:py-11 flex flex-col items-center text-center border-b sm:border-b-0 last:border-b-0 border-dashed border-white/20`}
                    >
                        <strong className="block text-4xl sm:text-5xl font-bold text-white tracking-[-1px] sm:tracking-[-2px] leading-none mb-2">
                            {stat.value}
                        </strong>
                        <p className="text-sm text-white/60 font-mono uppercase tracking-wide text-[12px]">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}