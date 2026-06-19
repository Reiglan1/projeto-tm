export default function HeroSection() {
    return (
        <section className="bg-white border-b border-[#e8eef6] px-10 py-20 flex flex-col items-center text-center">
            <h1 className="text-[60px] font-black leading-none tracking-[-2.5px] text-[#0a0a0a] mb-6">
                O serviço que
                você precisa
                <span className="text-[#1a6dff]"> agora.</span>
            </h1>

            <p className="text-base text-[#5a6a7a] leading-relaxed mb-9">
                Profissionais verificados, pagamento seguro e rastreamento em tempo real. Tudo em um lugar só.
            </p>

            <div className="flex gap-3 flex-wrap justify-center">
                <button className="bg-[#1a6dff] text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-[#0052d4] transition-colors duration-150 cursor-pointer border-none">
                    Contratar agora →
                </button>
                <button className="bg-white text-[#1a6dff] px-7 py-3.5 rounded-full text-sm font-semibold border border-[#c8d8ec] hover:border-[#1a6dff] hover:bg-[#eef4ff] transition-colors duration-150 cursor-pointer">
                    Sou profissional
                </button>
            </div>
        </section>
    );
}