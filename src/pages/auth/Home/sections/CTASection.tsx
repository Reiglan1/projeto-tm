import { useAuthModal } from "@/context/AuthModalContext";
import { useReveal } from "@/hooks/useReveal";

export default function CTASection() {
  const scopeRef = useReveal<HTMLElement>();
  const { openRegister } = useAuthModal();

  return (
    <section ref={scopeRef} className="bg-[#F5C518] px-6 py-14 sm:px-10 sm:py-20 flex flex-col items-center text-center">
      <div data-reveal className="flex flex-col items-center text-center w-full">

      <h2 className="text-[34px] sm:text-[52px] font-bold leading-none tracking-[-1px] sm:tracking-[-2px] text-[#0A0A0A] mb-4 uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>
        Pronto para começar?
      </h2>

      <p className="text-base text-[#0A0A0A]/70 leading-relaxed mb-9 max-w-md">
        Cadastre-se gratuitamente e acesse os melhores profissionais da sua cidade hoje mesmo.
      </p>

      <div className="flex gap-3 flex-wrap justify-center w-full sm:w-auto">
        <button
          onClick={() => openRegister("client")}
          className="w-full sm:w-auto bg-[#0A0A0A] text-white px-7 py-3.5 rounded-md text-sm font-semibold hover:bg-[#242424] transition-colors duration-150 cursor-pointer border-none"
        >
          Criar conta grátis
        </button>
        <button
          onClick={() => openRegister("worker")}
          className="w-full sm:w-auto bg-transparent text-[#0A0A0A] px-7 py-3.5 rounded-md text-sm font-semibold border border-[#0A0A0A]/30 hover:border-[#0A0A0A] transition-colors duration-150 cursor-pointer"
        >
          Sou profissional
        </button>
      </div>
      </div>

    </section>
  );
}