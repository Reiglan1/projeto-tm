"use client";

import { useState } from "react";

export default function HeaderApp() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = ["Como funciona", "Serviços", "Profissionais", "Segurança", "Sobre nós"];

  return (
    <header className="flex items-center justify-between px-6 py-[14px] sm:px-10 sm:py-[18px] bg-white/90 backdrop-blur-md border-b border-[#C7D1CB] sticky top-0 z-50 font-sans">

      {/* Logo */}
      <div className="flex items-center gap-[6px] text-[22px] font-bold tracking-tight text-[#12233D]">
        servijá
        <span className="w-[7px] h-[7px] rounded-full bg-[#E8A33D] inline-block" />
      </div>

      {/* Links de navegação - escondido no mobile */}
      <nav className="hidden sm:block">
        <ul className="flex gap-7 list-none m-0 p-0">
          {navItems.map((item) => (
            <li key={item}>
              <a href="#"
                className="text-[#586268] no-underline text-[15px] font-medium hover:text-[#12233D] transition-colors duration-150"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Botões de ação - escondido no mobile */}
      <div className="hidden sm:flex gap-3 items-center">
        <button className="bg-transparent border border-[#C7D1CB] text-[#12233D] px-5 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:border-[#12233D] transition-colors duration-150">
          Entrar
        </button>
        <button className="bg-[#12233D] border-none text-white px-[22px] py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#1B3350] transition-colors duration-150">
          Cadastrar
        </button>
      </div>

      {/* Botão hamburguer - só no mobile */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="sm:hidden bg-transparent border-none cursor-pointer flex flex-col gap-[5px] p-2"
        aria-label="Abrir menu"
      >
        <span className={`block w-6 h-[2px] bg-[#12233D] transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
        <span className={`block w-6 h-[2px] bg-[#12233D] transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
        <span className={`block w-6 h-[2px] bg-[#12233D] transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
      </button>

      {/* Menu mobile expansível */}
      {menuOpen && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-white border-b border-[#C7D1CB] flex flex-col px-6 py-5 gap-5">
          <ul className="flex flex-col gap-4 list-none m-0 p-0">
            {navItems.map((item) => (
              <li key={item}>
                <a href="#"
                  className="text-[#586268] no-underline text-base font-medium hover:text-[#12233D] transition-colors duration-150"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2.5">
            <button className="w-full bg-transparent border border-[#C7D1CB] text-[#12233D] px-5 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:border-[#12233D] transition-colors duration-150">
              Entrar
            </button>
            <button className="w-full bg-[#12233D] border-none text-white px-[22px] py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#1B3350] transition-colors duration-150">
              Cadastrar
            </button>
          </div>
        </div>
      )}

    </header>
  );
}