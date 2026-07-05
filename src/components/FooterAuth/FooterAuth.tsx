export default function FooterAuth() {
    const links = {
        Empresa: ["Quem somos", "Missão e valores", "Carreiras", "Imprensa"],
        Suporte: ["Central de ajuda", "Fale conosco", "Abrir chamado", "Segurança"],
        Legal: ["Termos de uso", "Privacidade", "Cookies", "LGPD"],
    };

    return (
        <footer className="bg-[#12233D] border-t border-white/10 px-6 pt-10 pb-8 sm:px-10 sm:pt-14 sm:pb-9">

            {/* Topo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 mb-12">

                {/* Brand */}
                <div className="col-span-2 sm:col-span-1">
                    <p className="flex items-center gap-1.5 text-[20px] font-bold tracking-tight text-white mb-3.5">
                        Three Minds
                        <span className="w-[6px] h-[6px] rounded-full bg-[#E8A33D] inline-block" />
                    </p>
                    <p className="text-sm text-white/55 leading-relaxed">
                        Plataforma digital para contratação de serviços gerais. Segura, confiável e eficiente.
                    </p>
                </div>

                {/* Colunas de links */}
                {Object.entries(links).map(([title, items]) => (
                    <div key={title}>
                        <p className="text-[11px] font-mono font-semibold tracking-[1.5px] uppercase text-white/40 mb-4">
                            {title}
                        </p>
                        <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                            {items.map((item) => (
                                <li key={item}>

                                    <a href="#"
                                        className="text-sm text-white/75 no-underline hover:text-white transition-colors duration-150"
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 border-t border-white/10 pt-7">
                <p className="text-xs text-white/45">
                    © 2026 Three Minds Tecnologia Ltda. Todos os direitos reservados.
                </p>
                <div className="flex gap-5">
                    {["Termos", "Privacidade", "Cookies"].map((item) => (

                        <div key={item}>
                            <a href="#"
                                className="text-xs text-white/45 no-underline hover:text-white transition-colors duration-150"
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