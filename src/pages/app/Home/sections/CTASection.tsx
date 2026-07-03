export default function CTASection() {
  return (
    <section className="bg-[#1a6dff] px-6 py-14 sm:px-10 sm:py-20 flex flex-col items-center text-center">

      <h2 className="text-[34px] sm:text-[52px] font-black leading-none tracking-[-1px] sm:tracking-[-2px] text-white mb-4">
        Pronto para começar?
      </h2>

      <p className="text-base text-white/65 leading-relaxed mb-9 max-w-md">
        Cadastre-se gratuitamente e acesse os melhores profissionais da sua cidade hoje mesmo.
      </p>

      <div className="flex gap-3 flex-wrap justify-center w-full sm:w-auto">
        <button className="w-full sm:w-auto bg-white text-[#1a6dff] px-7 py-3.5 rounded-full text-sm font-bold hover:bg-[#eef4ff] transition-colors duration-150 cursor-pointer border-none">
          Criar conta grátis
        </button>
        <button className="w-full sm:w-auto bg-transparent text-white px-7 py-3.5 rounded-full text-sm font-semibold border border-white/35 hover:border-white/70 transition-colors duration-150 cursor-pointer">
          Sou profissional
        </button>
      </div>

    </section>
  );
}