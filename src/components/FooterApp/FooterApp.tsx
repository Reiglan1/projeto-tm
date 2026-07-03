export default function FooterSigned() {
    const links = {
        Empresa: ["Quem somos", "Missão e valores", "Carreiras", "Imprensa"],
        Suporte: ["Central de ajuda", "Fale conosco", "Abrir chamado", "Segurança"],
        Legal: ["Termos de uso", "Privacidade", "Cookies", "LGPD"],
    };

    return (
        <footer className="bg-[#1a4f9e] border-t border-[#d0dce8] px-6 pt-10 pb-8 sm:px-10 sm:pt-14 sm:pb-9">

            {/* Topo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 mb-12">

                {/* Brand */}
                <div className="col-span-2 sm:col-span-1">
                    <p className="text-[20px] font-black tracking-tight text-[#0a0a0a] mb-3.5">
                        servi<span className="text-white">já</span>
                    </p>
                    <p className="text-sm text-white leading-relaxed">
                        Plataforma digital para contratação de serviços gerais. Segura, confiável e eficiente.
                    </p>
                </div>

                {/* Colunas de links */}
                {Object.entries(links).map(([title, items]) => (
                    <div key={title}>
                        <p className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#8aa0bc] mb-4">
                            {title}
                        </p>
                        <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                            {items.map((item) => (
                                <li key={item}>

                                    <a href="#"
                                        className="text-sm text-white no-underline hover:text-[#1a6dff] transition-colors duration-150"
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 border-t border-[#d0dce8] pt-7">
                <p className="text-xs text-white">
                    © 2026 Servijá Tecnologia Ltda. Todos os direitos reservados.
                </p>
                <div className="flex gap-5">
                    {["Termos", "Privacidade", "Cookies"].map((item) => (

                        <div key={item}>
                            <a href="#"
                                className="text-xs text-white no-underline hover:text-[#1a6dff] transition-colors duration-150"
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