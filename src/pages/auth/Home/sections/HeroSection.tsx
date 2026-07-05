import { useAuthModal } from "@/context/AuthModalContext";

export default function HeroSection() {

    const { openRegister } = useAuthModal();

    return (
        <section className="relative overflow-hidden bg-[#F4F6F4] border-b border-[#C7D1CB] px-6 py-14 sm:px-10 sm:py-24">

            {/* Textura de grade estilo blueprint */}
            <div
                className="absolute inset-0 opacity-[0.35] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(#C7D1CB 1px, transparent 1px), linear-gradient(90deg, #C7D1CB 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="relative max-w-[1180px] mx-auto grid grid-cols-1 sm:grid-cols-[1.05fr_0.95fr] gap-12 sm:gap-16 items-center">

                {/* Coluna de texto */}
                <div className="text-center sm:text-left">
                    <p className="flex items-center justify-center sm:justify-start gap-2 text-[11px] font-mono font-semibold tracking-[2px] uppercase text-[#3E6990] mb-5">
                        <span className="w-[18px] h-px bg-[#3E6990]" />
                        Ordem de serviço aberta em segundos
                    </p>

                    <h1 className="text-[36px] sm:text-[54px] font-bold leading-[1.05] tracking-[-1px] sm:tracking-[-2px] text-[#12233D] mb-6">
                        Alguém chega,{" "}
                        <span className="text-[#C97F1E]">resolve</span>,<br className="hidden sm:block" />
                        {" "}você acompanha tudo.
                    </h1>

                    <p className="text-base text-[#586268] leading-relaxed mb-9 max-w-[440px] mx-auto sm:mx-0">
                        Elétrica, hidráulica, limpeza e reforma com profissional verificado, preço fechado antes de começar e rastreamento em tempo real até a porta da sua casa.
                    </p>

                    <div className="flex gap-3 flex-wrap justify-center sm:justify-start w-full sm:w-auto mb-10">
                        <button
                            onClick={() => openRegister("client")}
                            className="w-full sm:w-auto bg-[#12233D] text-white px-7 py-3.5 rounded-md text-sm font-semibold hover:bg-[#1B3350] transition-colors duration-150 cursor-pointer border-none"
                        >
                            Abrir chamado →
                        </button>
                        <button
                            onClick={() => openRegister("worker")}
                            className="w-full sm:w-auto bg-white text-[#12233D] px-7 py-3.5 rounded-md text-sm font-semibold border border-[#C7D1CB] hover:border-[#12233D] transition-colors duration-150 cursor-pointer"
                        >
                            Sou profissional
                        </button>
                    </div>

                    <div className="flex gap-6 flex-wrap justify-center sm:justify-start">
                        {["Identidade verificada", "Pagamento retido até concluir", "Rota em tempo real"].map((item) => (
                            <div key={item} className="flex items-center gap-2 text-[13px] font-medium text-[#1B3350]">
                                <svg className="w-4 h-4 text-[#5C8368]" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ticket / OS - elemento assinatura */}
                <div className="relative max-w-[400px] w-full mx-auto sm:mr-0 sm:ml-auto bg-white border border-[#C7D1CB] rounded-[10px] shadow-[0_24px_48px_-24px_rgba(18,35,61,0.25)]">

                    Imagem
                </div>
            </div>
        </section>
    );
}