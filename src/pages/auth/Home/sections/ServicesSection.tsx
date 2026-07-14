import { useReveal } from "@/hooks/useReveal";
export default function ServicesSection() {
  const scopeRef = useReveal<HTMLElement>();
    const services = [
        {
            icon: (
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L4 14h6l-1 8 9-12h-6z" />
                </svg>
            ),
            title: "Elétrica",
            description: "Instalações, reparos e manutenção elétrica residencial e comercial.",
            count: "840+ profissionais",
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2s6 7 6 12a6 6 0 01-12 0c0-5 6-12 6-12z" />
                </svg>
            ),
            title: "Hidráulica",
            description: "Conserto de vazamentos, instalações e manutenção hidráulica.",
            count: "620+ profissionais",
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" />
                </svg>
            ),
            title: "Limpeza",
            description: "Limpeza residencial, comercial e pós-obra com profissionais experientes.",
            count: "1.2k+ profissionais",
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                </svg>
            ),
            title: "Reformas",
            description: "Pintura, gesso, pisos, acabamentos e pequenas reformas em geral.",
            count: "530+ profissionais",
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="12" rx="1" /><path d="M2 20h20" />
                </svg>
            ),
            title: "Tecnologia",
            description: "Manutenção de computadores, redes e câmeras de segurança.",
            count: "380+ profissionais",
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-11a8 8 0 10-16 0c0 7 8 11 8 11z" /><path d="M12 11a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
            ),
            title: "Jardinagem",
            description: "Corte de grama, poda de árvores, paisagismo e cuidados externos.",
            count: "290+ profissionais",
        },
    ];

    return (
        <section ref={scopeRef} className="bg-[#E9EDE9] border-t border-[#D9D6D0] px-6 py-14 sm:px-10 sm:py-20">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-center items-center sm:items-end gap-5 sm:gap-0 mb-11">
                <div>
                    <p className="flex items-center justify-center gap-2 text-[11px] font-mono font-semibold tracking-[2px] uppercase text-[#3A3A3A] mb-3">
                        <span className="w-[18px] h-px bg-[#F5C518]" />
                        Categorias
                    </p>
                    <h2 className="text-[30px] sm:text-[44px] font-bold leading-none tracking-[-1px] sm:tracking-[-2px] text-[#0A0A0A] uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>
                        Qualquer serviço,<br />um único lugar.
                    </h2>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end items-start sm:items-end gap-5 sm:gap-0 mb-11">
                <button className="bg-transparent border-none text-[#3A3A3A] text-sm font-mono font-semibold cursor-pointer hover:underline">
                    Ver todos →
                </button>
            </div>

            {/* Grid */}
            <div data-reveal className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {services.map((service) => (
                    <div
                        key={service.title}
                        className="relative bg-white border border-[#D9D6D0] rounded-md px-6 py-7 cursor-pointer transition-all duration-150 hover:-translate-y-1 hover:shadow-[0_16px_32px_-20px_rgba(18,35,61,0.3)]"
                    >
                        {/* Furo de etiqueta */}
                        <span className="absolute -top-2 left-6 w-4 h-4 rounded-full bg-[#E9EDE9] border border-[#D9D6D0]" />
                        <span className="absolute -top-[6px] left-[26px] w-2 h-2 rounded-full bg-[#FAF7F1]" />

                        <div className="w-[38px] h-[38px] mb-4 text-[#242424]">
                            {service.icon}
                        </div>
                        <h4 className="text-[15px] font-semibold text-[#0A0A0A] mb-1.5">
                            {service.title}
                        </h4>
                        <p className="text-xs text-[#3A3A3A] leading-relaxed mb-3.5">
                            {service.description}
                        </p>
                        <p className="text-[11px] font-mono font-semibold text-[#C99A00]">
                            {service.count}
                        </p>
                    </div>
                ))}
            </div>

        </section>
    );
}