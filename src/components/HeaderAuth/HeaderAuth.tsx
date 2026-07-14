"use client";

import { useState } from "react";
import { useAuthModal } from "@/context/AuthModalContext";

export default function HeaderApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { openLogin, openRegister } = useAuthModal();

  const navItems = ["Como funciona", "Serviços", "Profissionais", "Segurança", "Sobre nós"];

  function handleLogin() {
    setMenuOpen(false);
    openLogin();
  }

  function handleRegister() {
    setMenuOpen(false);
    openRegister();
  }

  return (
    <header className="flex items-center justify-between px-6 h-16 sm:px-8 bg-[#FAF7F1]/85 backdrop-blur-md backdrop-saturate-150 border-b border-[#D9D6D0] sticky top-0 z-50 font-sans">

      {/* Logo */}
      <div className="flex items-center gap-2 text-[22px] font-normal uppercase tracking-tight text-[#0A0A0A]" style={{ fontFamily: "'Anton', sans-serif" }}>
        Three Minds
        <span className="w-[7px] h-[7px] bg-[#F5C518] inline-block" />
      </div>

      {/* Links de navegação - escondido no mobile */}
      <nav className="hidden sm:block">
        <ul className="flex gap-7 list-none m-0 p-0">
          {navItems.map((item) => (
            <li key={item}>
              <a href="#"
                className="text-[#3A3A3A] no-underline text-sm font-medium hover:text-[#0A0A0A] transition-colors duration-150"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Botões de ação - escondido no mobile */}
      <div className="hidden sm:flex gap-3 items-center">
        <button
          onClick={handleLogin}
          className="bg-white border border-[#0A0A0A] text-[#0A0A0A] px-5 py-2.5 rounded text-sm font-bold cursor-pointer hover:bg-[#F5F2EC] transition-colors duration-150"
        >
          Entrar
        </button>
        <button
          onClick={handleRegister}
          className="bg-[#0A0A0A] border border-[#0A0A0A] text-[#FAF7F1] px-5 py-2.5 rounded text-sm font-bold cursor-pointer hover:bg-[#242424] transition-colors duration-150"
        >
          Cadastrar
        </button>
      </div>

      {/* Botão hamburguer - só no mobile */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="sm:hidden bg-transparent border-none cursor-pointer flex flex-col gap-[5px] p-2"
        aria-label="Abrir menu"
      >
        <span className={`block w-6 h-[2px] bg-[#0A0A0A] transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
        <span className={`block w-6 h-[2px] bg-[#0A0A0A] transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
        <span className={`block w-6 h-[2px] bg-[#0A0A0A] transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
      </button>

      {/* Menu mobile expansível */}
      {menuOpen && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-[#FAF7F1] border-b border-[#D9D6D0] flex flex-col px-6 py-5 gap-5">
          <ul className="flex flex-col gap-4 list-none m-0 p-0">
            {navItems.map((item) => (
              <li key={item}>
                <a href="#"
                  className="text-[#3A3A3A] no-underline text-base font-medium hover:text-[#0A0A0A] transition-colors duration-150"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleLogin}
              className="w-full bg-white border border-[#0A0A0A] text-[#0A0A0A] px-5 py-2.5 rounded text-sm font-bold cursor-pointer hover:bg-[#F5F2EC] transition-colors duration-150"
            >
              Entrar
            </button>
            <button
              onClick={handleRegister}
              className="w-full bg-[#0A0A0A] border border-[#0A0A0A] text-[#FAF7F1] px-5 py-2.5 rounded text-sm font-bold cursor-pointer hover:bg-[#242424] transition-colors duration-150"
            >
              Cadastrar
            </button>
          </div>
        </div>
      )}

    </header>
  );
}
