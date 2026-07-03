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

  const avatarColors = [
    "bg-white text-[#1a4f9e]",
    "bg-white/20 text-white",
    "bg-white/15 text-white",
  ];

  return (
    <section className="bg-[#1a4f9e] px-6 py-14 sm:px-10 sm:py-20">

      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-[11px] font-bold tracking-[2px] uppercase text-white/40 mb-4">
          Avaliações reais
        </p>
        <h2 className="text-[30px] sm:text-[44px] font-black leading-none tracking-[-1px] sm:tracking-[-2px] text-white">
          O que nossos<br />clientes dizem.
        </h2>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {testimonials.map((item, index) => (
          <div
            key={item.name}
            className="bg-white/8 border border-white/15 rounded-2xl px-6 py-7"
          >
            <p className="text-white text-sm tracking-[2px] mb-4">★★★★★</p>
            <p className="text-sm text-white/75 leading-relaxed mb-5">
              {item.text}
            </p>
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[index]}`}
              >
                {item.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{item.name}</p>
                <p className="text-[11px] text-white/40">{item.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}