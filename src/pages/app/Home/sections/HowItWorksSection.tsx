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
    },
  ];

  return (
    <section className="bg-white border-t border-[#e8eef6] px-6 py-14 sm:px-10 sm:py-20">

      {/* Header */}
      <div className="mb-14 text-center">
        <p className="text-[11px] font-bold tracking-[2px] uppercase text-[#8aa0bc] mb-4">
          Como funciona
        </p>
        <h2 className="text-[30px] sm:text-[44px] font-black leading-none tracking-[-1px] sm:tracking-[-2px] text-[#0a0a0a]">
          Do pedido ao serviço<br />em poucos passos.
        </h2>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center text-center">
            <span className="text-[64px] font-black tracking-[-3px] text-[#d0dce8] leading-none mb-5">
              {step.number}
            </span>
            <h4 className="text-base font-bold text-[#0a0a0a] mb-2.5">{step.title}</h4>
            <p className="text-sm text-[#5a6a7a] leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>

    </section>
  );
}