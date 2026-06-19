export default function ServicesSection() {
    const services = [
        {
            icon: "⚡",
            title: "Elétrica",
            description: "Instalações, reparos e manutenção elétrica residencial e comercial.",
            count: "840+ profissionais",
        },
        {
            icon: "💧",
            title: "Hidráulica",
            description: "Conserto de vazamentos, instalações e manutenção hidráulica.",
            count: "620+ profissionais",
        },
        {
            icon: "🏠",
            title: "Limpeza",
            description: "Limpeza residencial, comercial e pós-obra com profissionais experientes.",
            count: "1.2k+ profissionais",
        },
        {
            icon: "🔧",
            title: "Reformas",
            description: "Pintura, gesso, pisos, acabamentos e pequenas reformas em geral.",
            count: "530+ profissionais",
        },
        {
            icon: "💻",
            title: "Tecnologia",
            description: "Manutenção de computadores, redes e câmeras de segurança.",
            count: "380+ profissionais",
        },
        {
            icon: "🌿",
            title: "Jardinagem",
            description: "Corte de grama, poda de árvores, paisagismo e cuidados externos.",
            count: "290+ profissionais",
        },
    ];

    return (
        <section className="bg-[#eef4ff] border-t border-[#d0dce8] px-10 py-20">

            {/* Header */}
            <div className="flex justify-between items-end mb-11">
                <div>
                    <p className="text-[11px] font-bold tracking-[2px] uppercase text-[#6a90b8] mb-3">
                        Categorias
                    </p>
                    <h2 className="text-[44px] font-black leading-none tracking-[-2px] text-[#0a0a0a]">
                        Qualquer serviço,<br />um único lugar.
                    </h2>
                </div>
                <button className="bg-transparent border-none text-[#1a6dff] text-sm font-semibold underline cursor-pointer">
                    Ver todos →
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-3">
                {services.map((service) => (
                    <div
                        key={service.title}
                        className="bg-white border border-[#d0dce8] rounded-2xl px-6 py-7 cursor-pointer transition-all duration-150 hover:bg-[#1a6dff] hover:border-[#1a6dff] group"
                    >
                        <span className="text-2xl mb-[18px] block">{service.icon}</span>
                        <h4 className="text-[15px] font-bold text-[#0a0a0a] mb-1.5 group-hover:text-white transition-colors duration-150">
                            {service.title}
                        </h4>
                        <p className="text-xs text-[#5a6a7a] leading-relaxed group-hover:text-white/65 transition-colors duration-150">
                            {service.description}
                        </p>
                        <p className="mt-3.5 text-[11px] font-semibold text-[#1a6dff] group-hover:text-white/75 transition-colors duration-150">
                            {service.count}
                        </p>
                    </div>
                ))}
            </div>

        </section>
    );
}