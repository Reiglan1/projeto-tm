export default function HowItWorksSection() {
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
    <section className="bg-white border-t border-[#C7D1CB] px-6 py-14 sm:px-10 sm:py-20">

      {/* Header */}
      <div className="mb-16 text-center">
        <p className="flex items-center justify-center gap-2 text-[11px] font-mono font-semibold tracking-[2px] uppercase text-[#3E6990] mb-4">
          <span className="w-[18px] h-px bg-[#3E6990]" />
          Como funciona
        </p>
        <h2 className="text-[30px] sm:text-[44px] font-bold leading-none tracking-[-1px] sm:tracking-[-2px] text-[#12233D]">
          O caminho de uma<br />ordem de serviço.
        </h2>
      </div>

      {/* Steps - rota de despacho */}
      <div className="relative max-w-[1080px] mx-auto grid grid-cols-1 sm:grid-cols-4 gap-10 sm:gap-6">

        {/* Linha tracejada conectando os pontos - só desktop */}
        <div className="hidden sm:block absolute top-4 left-[12.5%] right-[12.5%] h-0 border-t-2 border-dashed border-[#C7D1CB]" />

        {steps.map((step) => (
          <div key={step.number} className="relative text-left pt-[46px]">
            <div
              className={`absolute top-0 left-0 w-8 h-8 rounded-full flex items-center justify-center font-mono font-semibold text-[13px] z-10 ${
                step.final
                  ? "bg-[#5C8368] border-2 border-[#5C8368] text-white"
                  : "bg-white border-2 border-[#3E6990] text-[#3E6990]"
              }`}
            >
              {step.final ? "✓" : step.number}
            </div>
            <h4 className="text-base font-semibold text-[#12233D] mb-2">{step.title}</h4>
            <p className="text-sm text-[#586268] leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>

    </section>
  );
}