export default function SplitSection() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 border-t border-b border-[#e8eef6]">

      {/* Cliente */}
      <div className="bg-white px-6 py-14 sm:px-10 sm:py-20 flex flex-col items-center text-center border-b sm:border-b-0 sm:border-r border-[#e8eef6]">
        <span className="text-2xl mb-8">👤</span>
        <p className="text-[11px] font-bold tracking-[2px] uppercase text-[#8aa0bc] mb-5">
          Para clientes
        </p>
        <h2 className="text-[30px] sm:text-[44px] font-black leading-none tracking-[-1px] sm:tracking-[-2px] text-[#0a0a0a] mb-5">
          Contrate com<br />segurança e<br />confiança.
        </h2>
        <p className="text-sm text-[#5a6a7a] leading-relaxed mb-8 max-w-sm">
          Veja avaliações reais, compare profissionais e pague com segurança — tudo dentro da plataforma.
        </p>
        <button className="w-full sm:w-auto bg-[#1a6dff] text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-[#0052d4] transition-colors duration-150 cursor-pointer border-none">
          Criar conta grátis
        </button>
      </div>

      {/* Profissional */}
      <div className="bg-[#eef4ff] px-6 py-14 sm:px-10 sm:py-20 flex flex-col items-center text-center">
        <span className="text-2xl mb-8">💼</span>
        <p className="text-[11px] font-bold tracking-[2px] uppercase text-[#8aa0bc] mb-5">
          Para profissionais
        </p>
        <h2 className="text-[30px] sm:text-[44px] font-black leading-none tracking-[-1px] sm:tracking-[-2px] text-[#0a0a0a] mb-5">
          Ganhe mais<br />trabalhando no<br />seu ritmo.
        </h2>
        <p className="text-sm text-[#5a6a7a] leading-relaxed mb-8 max-w-sm">
          Cadastre-se, defina sua disponibilidade e receba chamados de clientes próximos a você.
        </p>
        <button className="w-full sm:w-auto bg-[#0a0a0a] text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-[#222222] transition-colors duration-150 cursor-pointer border-none">
          Começar a trabalhar
        </button>
      </div>

    </section>
  );
}