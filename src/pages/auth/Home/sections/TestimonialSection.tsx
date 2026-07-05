export default function TestimonialSection() {
  const testimonials = [
    {
      initials: "MC",
      name: "Marcos Carvalho",
      role: "Cliente · Belo Horizonte",
      text: "O profissional chegou no horário combinado, resolveu o problema elétrico rápido e o atendimento foi excelente. Recomendo muito a plataforma.",
    },
    {
      initials: "AL",
      name: "Ana Luiza",
      role: "Cliente · São Paulo",
      text: "Encontrei uma profissional de limpeza incrível. Fácil de contratar, preço justo e consigo acompanhar tudo pelo app. Não uso mais outra plataforma.",
    },
    {
      initials: "RM",
      name: "Rafael Moura",
      role: "Profissional · Eletricista",
      text: "Como profissional, a plataforma mudou minha vida. Tenho clientes todos os dias e o pagamento sempre cai certinho no prazo.",
    },
  ];

  const tornEdgeStyle = {
    backgroundImage:
      "linear-gradient(135deg, transparent 50%, #12233D 50%), linear-gradient(-135deg, transparent 50%, #12233D 50%)",
    backgroundSize: "12px 12px",
    backgroundPosition: "0 0, 0 0",
    backgroundRepeat: "repeat-x",
  };

  return (
    <section className="bg-[#12233D] px-6 py-14 sm:px-10 sm:py-20">

      {/* Header */}
      <div className="text-center mb-14">
        <p className="flex items-center justify-center gap-2 text-[11px] font-mono font-semibold tracking-[2px] uppercase text-[#E8A33D] mb-4">
          <span className="w-[18px] h-px bg-[#E8A33D]" />
          Avaliações reais
        </p>
        <h2 className="text-[30px] sm:text-[44px] font-bold leading-none tracking-[-1px] sm:tracking-[-2px] text-white">
          O que quem já<br />usou diz.
        </h2>
      </div>

      {/* Cards - estilo recibo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {testimonials.map((item) => (
          <div key={item.name} className="flex flex-col">
            <div className="bg-[#1B3350] rounded-t-md px-6 py-7">
              <p className="text-[#E8A33D] text-sm tracking-[2px] mb-4">★★★★★</p>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                "{item.text}"
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3E6990] to-[#12233D] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {item.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-[11px] text-white/45">{item.role}</p>
                </div>
              </div>
            </div>
            {/* Borda serrilhada - canhoto do recibo */}
            <div className="h-3 bg-[#12233D]" style={tornEdgeStyle} />
          </div>
        ))}
      </div>

    </section>
  );
}