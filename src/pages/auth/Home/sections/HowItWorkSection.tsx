import { useReveal } from "@/hooks/useReveal";
export default function HowItWorksSection() {
  const scopeRef = useReveal<HTMLElement>();
  const steps = [
    {
      number: "01",
      title: "Pesquise o serviço",
      description: "Busque pelo tipo de serviço e veja profissionais disponíveis na sua região agora.",
    },
    {
      number: "02",
      title: "Escolha o profissional",
      description: "Compare avaliações, portfólio e disponibilidade. Escolha quem mais combina com você.",
    },
    {
      number: "03",
      title: "Confirme e pague",
      description: "Pagamento seguro dentro da plataforma. O profissional recebe só após a conclusão.",
    },
    {
      number: "04",
      title: "Acompanhe em tempo real",
      description: "Rastreie a rota e receba notificações de cada etapa do atendimento.",
      final: true,
    },
  ];

  return (
    <section ref={scopeRef} className="bg-white border-t border-[#D9D6D0] px-6 py-14 sm:px-10 sm:py-20">

      {/* Header */}
      <div data-reveal className="mb-16 text-center">
        <p className="flex items-center justify-center gap-2 text-[11px] font-mono font-semibold tracking-[2px] uppercase text-[#3A3A3A] mb-4">
          <span className="w-[18px] h-px bg-[#F5C518]" />
          Como funciona
        </p>
        <h2 className="text-[30px] sm:text-[44px] font-bold leading-none tracking-[-1px] sm:tracking-[-2px] text-[#0A0A0A] uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>
          O caminho de uma<br />ordem de serviço.
        </h2>
      </div>

      {/* Steps - rota de despacho */}
      <div data-reveal className="relative max-w-[1080px] mx-auto grid grid-cols-1 sm:grid-cols-4 gap-10 sm:gap-6">

        {/* Linha tracejada conectando os pontos - só desktop */}
        <div className="hidden sm:block absolute top-4 left-[12.5%] right-[12.5%] h-0 border-t-2 border-dashed border-[#D9D6D0]" />

        {steps.map((step) => (
          <div key={step.number} className="relative text-left pt-[46px]">
            <div
              className={`absolute top-0 left-0 w-8 h-8 rounded-full flex items-center justify-center font-mono font-semibold text-[13px] z-10 ${
                step.final
                  ? "bg-[#1F8A5B] border-2 border-[#1F8A5B] text-white"
                  : "bg-white border-2 border-[#0A0A0A] text-[#3A3A3A]"
              }`}
            >
              {step.final ? "✓" : step.number}
            </div>
            <h4 className="text-base font-semibold text-[#0A0A0A] mb-2">{step.title}</h4>
            <p className="text-sm text-[#3A3A3A] leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>

    </section>
  );
}