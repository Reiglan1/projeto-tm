export default function SplitSection() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 border-b border-[#C7D1CB]">

      {/* Cliente */}
      <div className="bg-[#F4F6F4] px-6 py-14 sm:px-10 sm:py-20 flex flex-col items-center text-center border-b sm:border-b-0 sm:border-r border-[#C7D1CB]">
        <div className="w-[46px] h-[46px] rounded-md bg-[#3E6990]/10 text-[#3E6990] flex items-center justify-center mb-7">
          <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
          </svg>
        </div>
        <p className="flex items-center gap-2 text-[11px] font-mono font-semibold tracking-[2px] uppercase text-[#3E6990] mb-5">
          <span className="w-[18px] h-px bg-[#3E6990]" />
          Para clientes
        </p>
        <h2 className="text-[30px] sm:text-[44px] font-bold leading-none tracking-[-1px] sm:tracking-[-2px] text-[#12233D] mb-5">
          Resolva sem<br />dor de<br />cabeça.
        </h2>
        <p className="text-sm text-[#586268] leading-relaxed mb-8 max-w-sm">
          Compare profissionais avaliados, veja o preço fechado antes de aceitar e pague só depois que o serviço acabar.
        </p>
        <button className="w-full sm:w-auto bg-[#12233D] text-white px-7 py-3.5 rounded-md text-sm font-semibold hover:bg-[#1B3350] transition-colors duration-150 cursor-pointer border-none">
          Criar conta grátis
        </button>
      </div>

      {/* Profissional */}
      <div className="bg-[#12233D] px-6 py-14 sm:px-10 sm:py-20 flex flex-col items-center text-center">
        <div className="w-[46px] h-[46px] rounded-md bg-[#E8A33D]/15 text-[#E8A33D] flex items-center justify-center mb-7">
          <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </div>
        <p className="flex items-center gap-2 text-[11px] font-mono font-semibold tracking-[2px] uppercase text-[#E8A33D] mb-5">
          <span className="w-[18px] h-px bg-[#E8A33D]" />
          Para profissionais
        </p>
        <h2 className="text-[30px] sm:text-[44px] font-bold leading-none tracking-[-1px] sm:tracking-[-2px] text-white mb-5">
          Trabalhe no<br />seu próprio<br />ritmo.
        </h2>
        <p className="text-sm text-white/65 leading-relaxed mb-8 max-w-sm">
          Cadastre-se, defina sua agenda e receba chamados de clientes perto de você. Sem mensalidade.
        </p>
        <button className="w-full sm:w-auto bg-[#E8A33D] text-[#12233D] px-7 py-3.5 rounded-md text-sm font-semibold hover:bg-[#C97F1E] hover:text-white transition-colors duration-150 cursor-pointer border-none">
          Começar a trabalhar
        </button>
      </div>

    </section>
  );
}