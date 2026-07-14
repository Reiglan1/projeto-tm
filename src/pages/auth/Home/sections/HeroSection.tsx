import { useAuthModal } from "@/context/AuthModalContext";
import { useReveal } from "@/hooks/useReveal";

export default function HeroSection() {

    const { openRegister } = useAuthModal();
    const scopeRef = useReveal<HTMLElement>();

    return (
        <section ref={scopeRef} className="relative overflow-hidden bg-[#FAF7F1] border-b border-[#D9D6D0] px-6 py-14 sm:px-10 sm:py-24">

            {/* Textura de grade estilo blueprint */}
            <div
                className="absolute inset-0 opacity-[0.35] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(#D9D6D0 1px, transparent 1px), linear-gradient(90deg, #D9D6D0 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="relative max-w-[1180px] mx-auto grid grid-cols-1 sm:grid-cols-[1.05fr_0.95fr] gap-12 sm:gap-16 items-center">

                {/* Coluna de texto */}
                <div data-reveal className="text-center sm:text-left">
                    <p className="flex items-center justify-center sm:justify-start gap-2 text-[11px] font-mono font-semibold tracking-[2px] uppercase text-[#3A3A3A] mb-5">
                        <span className="w-[18px] h-px bg-[#F5C518]" />
                        Ordem de serviço aberta em segundos
                    </p>

                    <h1 className="text-[36px] sm:text-[54px] font-bold leading-[1.05] tracking-[-1px] sm:tracking-[-2px] text-[#0A0A0A] mb-6 uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>
                        Alguém chega,{" "}
                        <span className="text-[#C99A00]">resolve</span>,<br className="hidden sm:block" />
                        {" "}você acompanha tudo.
                    </h1>

                    <p className="text-base text-[#3A3A3A] leading-relaxed mb-9 max-w-[440px] mx-auto sm:mx-0">
                        Elétrica, hidráulica, limpeza e reforma com profissional verificado, preço fechado antes de começar e rastreamento em tempo real até a porta da sua casa.
                    </p>

                    <div className="flex gap-3 flex-wrap justify-center sm:justify-start w-full sm:w-auto mb-10">
                        <button
                            onClick={() => openRegister("client")}
                            className="w-full sm:w-auto bg-[#0A0A0A] text-white px-7 py-3.5 rounded-md text-sm font-semibold hover:bg-[#242424] transition-colors duration-150 cursor-pointer border-none"
                        >
                            Abrir chamado →
                        </button>
                        <button
                            onClick={() => openRegister("worker")}
                            className="w-full sm:w-auto bg-white text-[#0A0A0A] px-7 py-3.5 rounded-md text-sm font-semibold border border-[#D9D6D0] hover:border-[#0A0A0A] transition-colors duration-150 cursor-pointer"
                        >
                            Sou profissional
                        </button>
                    </div>

                    <div className="flex gap-6 flex-wrap justify-center sm:justify-start">
                        {["Identidade verificada", "Pagamento retido até concluir", "Rota em tempo real"].map((item) => (
                            <div key={item} className="flex items-center gap-2 text-[13px] font-medium text-[#242424]">
                                <svg className="w-4 h-4 text-[#1F8A5B]" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ticket / OS - elemento assinatura */}
                <div data-reveal data-reveal-delay=".12" className="relative max-w-[400px] w-full mx-auto sm:mr-0 sm:ml-auto">
                    <span className="absolute -top-4 right-2 w-[110px] h-[110px] bg-[#F5C518] -z-10" />
                    <div className="relative z-10 bg-white border border-[#D9D6D0] rounded-xl shadow-[0_24px_48px_-24px_rgba(18,35,61,0.25)] overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EDE9E1]">
                            <span className="font-mono text-[11px] tracking-[.06em] text-[#8A8A8A]">CHAMADO #TM-4827</span>
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[.12em] uppercase text-[#E63946]">
                                <span className="tm-live-dot w-[7px] h-[7px] rounded-full bg-[#E63946] inline-block" />
                                Ao vivo
                            </span>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center gap-3">
                                <span className="shrink-0 w-[46px] h-[46px] bg-[#0A0A0A] text-[#FAF7F1] rounded-full flex items-center justify-center font-bold text-[15px]">CM</span>
                                <div className="min-w-0">
                                    <div className="font-bold text-[15px] leading-tight">Carlos Mendes</div>
                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-[#5C5C5C]">
                                        Eletricista
                                        <span className="inline-flex items-center gap-1 text-[#242424] font-semibold">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#F5C518" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                            4.9
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5">
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0A0A0A]">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1F8A5B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                        </svg>
                                        A caminho
                                    </span>
                                    <span className="font-mono text-xs text-[#5C5C5C]">chega em ~8 min</span>
                                </div>
                                <div className="mt-2.5 h-1.5 bg-[#EDE9E1] rounded-full overflow-hidden">
                                    <div className="tm-route-fill h-full bg-[#0A0A0A] rounded-full" />
                                </div>
                                <div className="flex items-center justify-between mt-1.5 font-mono text-[10px] tracking-[.04em] text-[#8A8A8A]">
                                    <span>PROFISSIONAL</span><span>SUA CASA</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-[#EDE9E1]">
                                <div>
                                    <div className="text-[10px] font-semibold tracking-[.14em] uppercase text-[#8A8A8A]">Preço fechado</div>
                                    <div className="font-mono text-[19px] font-bold text-[#0A0A0A] mt-0.5">R$ 120,00</div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[.06em] uppercase text-[#1F8A5B] bg-[#E7F3EC] px-2.5 py-1.5 rounded-full">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Retido
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}