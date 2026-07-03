"use client";

import { useState } from "react";

export default function HeaderApp() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = ["Como funciona", "Serviços", "Profissionais", "Segurança", "Sobre nós"];

  return (
    <header className="flex items-center justify-between px-6 py-[14px] sm:px-10 sm:py-[18px] bg-white border-b border-[#e8eef6] sticky top-0 z-50 font-sans">

      {/* Logo */}
      <div className="text-[22px] font-black tracking-tight text-[#0a0a0a]">
        servi<span className="text-[#1a6dff]">já</span>
      </div>

      {/* Links de navegação - escondido no mobile */}
      <nav className="hidden sm:block">
        <ul className="flex gap-7 list-none m-0 p-0">
          {navItems.map((item) => (
            <li key={item}>

              <a href="#"
                className="text-[#555555] no-underline text-lg font-normal hover:text-[#1a6dff] transition-colors duration-150"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Botões de ação - escondido no mobile */}
      <div className="hidden sm:flex gap-2.5 items-center">
        <button className="bg-transparent border border-[#d0dce8] text-[#1a6dff] px-5 py-2.5 rounded-full text-[13px] font-medium cursor-pointer hover:bg-[#eef4ff] transition-colors duration-150">
          Entrar
        </button>
        <button className="bg-[#1a6dff] border-none text-white px-[22px] py-2.5 rounded-full text-[13px] font-semibold cursor-pointer hover:bg-[#0052d4] transition-colors duration-150">
          Cadastrar
        </button>
      </div>

      {/* Botão hamburguer - só no mobile */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="sm:hidden bg-transparent border-none cursor-pointer flex flex-col gap-[5px] p-2"
        aria-label="Abrir menu"
      >
        <span className={`block w-6 h-[2px] bg-[#0a0a0a] transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
        <span className={`block w-6 h-[2px] bg-[#0a0a0a] transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
        <span className={`block w-6 h-[2px] bg-[#0a0a0a] transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
      </button>

      {/* Menu mobile expansível */}
      {menuOpen && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-white border-b border-[#e8eef6] flex flex-col px-6 py-5 gap-5">
          <ul className="flex flex-col gap-4 list-none m-0 p-0">
            {navItems.map((item) => (
              <li key={item}>

                <a href="#"
                  className="text-[#555555] no-underline text-base font-normal hover:text-[#1a6dff] transition-colors duration-150"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2.5">
            <button className="w-full bg-transparent border border-[#d0dce8] text-[#1a6dff] px-5 py-2.5 rounded-full text-[13px] font-medium cursor-pointer hover:bg-[#eef4ff] transition-colors duration-150">
              Entrar
            </button>
            <button className="w-full bg-[#1a6dff] border-none text-white px-[22px] py-2.5 rounded-full text-[13px] font-semibold cursor-pointer hover:bg-[#0052d4] transition-colors duration-150">
              Cadastrar
            </button>
          </div>
        </div>
      )}

    </header>
  );
}