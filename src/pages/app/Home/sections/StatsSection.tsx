export default function StatsSection() {
    const stats = [
        { value: "12k+", label: "Profissionais verificados ativos" },
        { value: "98%", label: "Taxa de satisfação dos clientes" },
        { value: "4.9★", label: "Avaliação média da plataforma" },
    ];

    return (
        <section className="bg-[#1a6dff] grid grid-cols-3">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className={`px-10 py-11 flex flex-col items-center text-center ${index < stats.length - 1 ? "border-r border-white/15" : ""}`}
                >
                    <strong className="block text-5xl font-black text-white tracking-[-2px] leading-none mb-2">
                        {stat.value}
                    </strong>
                    <p className="text-sm text-white/65 font-normal">{stat.label}</p>
                </div>
            ))}
        </section>
    );
}