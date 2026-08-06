import { useState } from "react";
import Logo_TMS from "@/assets/images/Logo_TMS.png";

const NAV_LINKS = [
    { label: "Como funciona", href: "#" },
    { label: "Categorias", href: "#" },
    { label: "Para profissionais", href: "#" },
    { label: "FAQ", href: "#" },
];

export default function HeaderAuth() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="relative bg-white border-b border-gray-200">
            <div className="container flex items-center justify-between gap-4 py-4">
                <img src={Logo_TMS} alt="TMS" className="h-8 w-auto md:h-10" />

                <nav className="hidden md:flex items-center gap-8 text-sm text-cinza-1 font-bold">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="hover:text-gray-900"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-3 sm:gap-6">
                    <button className="text-sm font-bold text-preto-2 hover:opacity-70 cursor-pointer md:inline-flex">
                        Entrar
                    </button>
                    <button className="cursor-pointer font-bold rounded-2xl bg-amarelo-2 px-4 py-2 sm:px-5 text-sm text-preto-2 hover:brightness-95 transition">
                        Criar conta
                    </button>

                    <button
                        type="button"
                        aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                        aria-expanded={isMenuOpen}
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-preto-2 cursor-pointer md:hidden"
                    >
                        {isMenuOpen ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                <path d="M6 6L18 18M18 6L6 18" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                <path d="M3 6h18M3 12h18M3 18h18" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="absolute inset-x-0 top-full z-20 border-b border-gray-200 bg-white shadow-lg md:hidden">
                    <nav className="container flex flex-col gap-4 py-5 text-sm font-bold text-cinza-1">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="hover:text-gray-900"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
