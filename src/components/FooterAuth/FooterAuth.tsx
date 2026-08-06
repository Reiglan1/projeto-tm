import Logo_TMS from "@/assets/images/Logo_TMS.png";

const FOOTER_COLUMNS = [
    {
        title: "Serviços",
        links: ["Elétrica", "Limpeza", "Beleza", "Reparos", "Aulas particulares"],
    },
    {
        title: "Empresa",
        links: ["Sobre nós", "Imprensa", "Carreiras", "Blog", "Contato"],
    },
    {
        title: "Suporte",
        links: [
            "Central de ajuda",
            "Segurança",
            "Termos de uso",
            "Privacidade",
            "WhatsApp",
        ],
    },
];

const SOCIAL_LINKS = [
    {
        label: "Instagram",
        href: "#",
        path: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm4.5-3.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z",
    },
    {
        label: "Twitter",
        href: "#",
        path: "M22 5.9c-.7.3-1.5.6-2.3.7a4 4 0 0 0 1.8-2.2c-.8.5-1.6.8-2.6 1a3.9 3.9 0 0 0-6.7 3.6A11.1 11.1 0 0 1 3.9 4.6a4 4 0 0 0 1.2 5.3c-.7 0-1.4-.2-2-.5a4 4 0 0 0 3.1 3.9c-.6.2-1.3.2-2 .1a4 4 0 0 0 3.7 2.8A11.2 11.2 0 0 1 2 18.4a15.7 15.7 0 0 0 8.5 2.5c10.2 0 15.8-8.6 15.4-16.3A8 8 0 0 0 22 5.9Z",
    },
    {
        label: "LinkedIn",
        href: "#",
        path: "M4.5 3.5A1.5 1.5 0 1 1 4.5 6.5 1.5 1.5 0 1 1 4.5 3.5ZM3 8.5h3v12H3v-12Zm6 0h2.9v1.6h.04c.4-.8 1.5-1.9 3.06-1.9 3.27 0 3.9 2.15 3.9 4.94V20.5h-3v-6.35c0-1.5-.03-3.44-2.1-3.44-2.1 0-2.4 1.64-2.4 3.33V20.5H9v-12Z",
    },
];

export default function FooterAuth() {
    const currentYear = new Date().getFullYear();

    return (
        <footer>
            <div className="bg-white">
                <div className="container flex flex-col gap-10 py-10 sm:flex-row sm:gap-12 sm:py-12">
                    <div className="space-y-4 sm:max-w-xs">
                        <img src={Logo_TMS} alt="TMS" className="h-8 w-auto" />

                        <p className="text-sm text-cinza-1">
                            Conectando quem precisa, com quem faz. Profissionais
                            verificados em todo o Brasil.
                        </p>

                        <div className="flex gap-3">
                            {SOCIAL_LINKS.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-preto-2 hover:border-preto-2"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="h-4 w-4"
                                    >
                                        <path d={social.path} />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 sm:gap-x-50">
                        {FOOTER_COLUMNS.map((column) => (
                            <div key={column.title}>
                                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-preto-2">
                                    {column.title}
                                </h3>
                                <ul className="space-y-3 text-sm text-cinza-1">
                                    {column.links.map((link) => (
                                        <li key={link}>
                                            <a href="#" className="hover:text-preto-2">
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="container flex flex-col items-center justify-between gap-2 border-t border-cinza-1/20 py-4 text-xs text-cinza-1 sm:flex-row">
                    <span>
                        © {currentYear} Three Minds Tecnologia Ltda. Todos os direitos
                        reservados.
                    </span>
                </div>
            </div>

            <div className="h-1.5 bg-preto-2" />
        </footer>
    );
}
