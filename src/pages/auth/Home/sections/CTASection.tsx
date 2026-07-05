import { useAuthModal } from "@/context/AuthModalContext";

export default function CTASection() {
  const { openRegister } = useAuthModal();

  return (
    <section className="bg-[#E8A33D] px-6 py-14 sm:px-10 sm:py-20 flex flex-col items-center text-center">

      <h2 className="text-[34px] sm:text-[52px] font-bold leading-none tracking-[-1px] sm:tracking-[-2px] text-[#12233D] mb-4">
        Pronto para começar?
      </h2>

      <p className="text-base text-[#12233D]/70 leading-relaxed mb-9 max-w-md">
        Cadastre-se gratuitamente e acesse os melhores profissionais da sua cidade hoje mesmo.
      </p>

      <div className="flex gap-3 flex-wrap justify-center w-full sm:w-auto">
        <button
          onClick={() => openRegister("client")}
          className="w-full sm:w-auto bg-[#12233D] text-white px-7 py-3.5 rounded-md text-sm font-semibold hover:bg-[#1B3350] transition-colors duration-150 cursor-pointer border-none"
        >
          Criar conta grátis
        </button>
        <button
          onClick={() => openRegister("worker")}
          className="w-full sm:w-auto bg-transparent text-[#12233D] px-7 py-3.5 rounded-md text-sm font-semibold border border-[#12233D]/30 hover:border-[#12233D] transition-colors duration-150 cursor-pointer"
        >
          Sou profissional
        </button>
      </div>

    </section>
  );
}