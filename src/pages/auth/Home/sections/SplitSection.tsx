import { useAuthModal } from "@/context/AuthModalContext";
import { useReveal } from "@/hooks/useReveal";

export default function SplitSection() {
  const scopeRef = useReveal<HTMLElement>();

  const { openRegister } = useAuthModal();

  return (
    <section ref={scopeRef} className="grid grid-cols-1 sm:grid-cols-2 border-b border-[#D9D6D0]">

      {/* Cliente */}
      <div data-reveal className="bg-[#FAF7F1] px-6 py-14 sm:px-10 sm:py-20 flex flex-col items-center text-center border-b sm:border-b-0 sm:border-r border-[#D9D6D0]">
        <div className="w-12 h-12 border border-[#D9D6D0] bg-white text-[#0A0A0A] flex items-center justify-center mb-7">
          <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
          </svg>
        </div>
        <p className="flex items-center gap-2 text-[11px] font-mono font-semibold tracking-[2px] uppercase text-[#3A3A3A] mb-5">
          <span className="w-[18px] h-px bg-[#F5C518]" />
          Para clientes
        </p>
        <h2 className="text-[30px] sm:text-[44px] font-bold leading-none tracking-[-1px] sm:tracking-[-2px] text-[#0A0A0A] mb-5 uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>
          Resolva sem<br />dor de<br />cabeça.
        </h2>
        <p className="text-sm text-[#3A3A3A] leading-relaxed mb-8 max-w-sm">
          Compare profissionais avaliados, veja o preço fechado antes de aceitar e pague só depois que o serviço acabar.
        </p>
        <button
          onClick={() => openRegister("client")}
          className="w-full sm:w-auto bg-[#0A0A0A] text-white px-7 py-3.5 rounded-md text-sm font-semibold hover:bg-[#242424] transition-colors duration-150 cursor-pointer border-none"
        >
          Criar conta grátis
        </button>
      </div>

      {/* Profissional */}
      <div data-reveal data-reveal-delay=".1" className="bg-[#0A0A0A] px-6 py-14 sm:px-10 sm:py-20 flex flex-col items-center text-center">
        <div className="w-12 h-12 border border-[#3A3A3A] bg-[#161616] text-[#F5C518] flex items-center justify-center mb-7">
          <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </div>
        <p className="flex items-center gap-2 text-[11px] font-mono font-semibold tracking-[2px] uppercase text-[#F5C518] mb-5">
          <span className="w-[18px] h-px bg-[#F5C518]" />
          Para profissionais
        </p>
        <h2 className="text-[30px] sm:text-[44px] font-bold leading-none tracking-[-1px] sm:tracking-[-2px] text-white mb-5 uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>
          Trabalhe no<br />seu próprio<br />ritmo.
        </h2>
        <p className="text-sm text-white/65 leading-relaxed mb-8 max-w-sm">
          Cadastre-se, defina sua agenda e receba chamados de clientes perto de você. Sem mensalidade.
        </p>
        <button
          onClick={() => openRegister("worker")}
          className="w-full sm:w-auto bg-[#F5C518] text-[#0A0A0A] px-7 py-3.5 rounded-md text-sm font-semibold hover:bg-[#C99A00] hover:text-white transition-colors duration-150 cursor-pointer border-none"
        >
          Começar a trabalhar
        </button>
      </div>

    </section>
  );
}