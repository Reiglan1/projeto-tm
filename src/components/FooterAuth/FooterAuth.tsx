export default function FooterAuth() {
    const links = {
        Empresa: ["Quem somos", "Missão e valores", "Carreiras", "Imprensa"],
        Suporte: ["Central de ajuda", "Fale conosco", "Abrir chamado", "Segurança"],
        Legal: ["Termos de uso", "Privacidade", "Cookies", "LGPD"],
    };

    return (
        <footer className="bg-[#0A0A0A] px-6 pt-10 pb-8 sm:px-10 sm:pt-16 sm:pb-10 font-sans">

            {/* Topo */}
            <div className="max-w-[1240px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 mb-10">

                {/* Brand */}
                <div className="col-span-2 sm:col-span-1">
                    <p className="flex items-center gap-2 text-[22px] uppercase text-[#FAF7F1] mb-4" style={{ fontFamily: "'Anton', sans-serif" }}>
                        Three Minds
                        <span className="w-[7px] h-[7px] bg-[#F5C518] inline-block" />
                    </p>
                    <p className="text-sm text-[#B5B5B5] leading-relaxed max-w-[34ch]">
                        Plataforma digital para contratação de serviços gerais. Segura, confiável e eficiente.
                    </p>
                </div>

                {/* Colunas de links */}
                {Object.entries(links).map(([title, items]) => (
                    <div key={title}>
                        <p className="text-[11px] font-mono font-bold tracking-[.16em] uppercase text-[#5C5C5C] mb-4">
                            {title}
                        </p>
                        <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                            {items.map((item) => (
                                <li key={item}>

                                    <a href="#"
                                        className="text-sm text-[#B5B5B5] no-underline hover:text-[#FAF7F1] transition-colors duration-150"
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

            </div>

            {/* Base */}
            <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 border-t border-[#242424] pt-6">
                <p className="text-xs text-[#5C5C5C]">
                    © 2026 Three Minds Tecnologia Ltda. Todos os direitos reservados.
                </p>
                <div className="flex gap-5">
                    {["Termos", "Privacidade", "Cookies"].map((item) => (

                        <div key={item}>
                            <a href="#"
                                className="text-xs text-[#5C5C5C] no-underline hover:text-[#FAF7F1] transition-colors duration-150"
                            >
                                {item}
                            </a>
                        </div>
                    ))}
                </div>
            </div>

        </footer>
    );
}
