"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLayout } from "@/context/LayoutProvider";
import { ROUTES } from "@/constants/Constants";
import { getWalletBalance } from "@/services/wallet";
import { BALANCE_KEYS, formatCurrency, pickBalanceNumber } from "@/utils/Wallet";

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function HeaderAuth() {
  const navigate = useNavigate();
  const { user, logout } = useLayout();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  const navItems = ["Serviços", "Profissionais", "Sobre nós"];

  useEffect(() => {
    if (!user) {
      setWalletBalance(null);
      return;
    }

    let cancelled = false;
    setWalletLoading(true);

    getWalletBalance()
      .then((data) => {
        if (!cancelled) setWalletBalance(pickBalanceNumber(data, BALANCE_KEYS));
      })
      .catch(() => {
        if (!cancelled) setWalletBalance(null);
      })
      .finally(() => {
        if (!cancelled) setWalletLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    setProfileOpen(false);
    setMenuOpen(false);
    logout();
    navigate(ROUTES.LOGIN);
  }

  function handleProfile() {
    setProfileOpen(false);
    setMenuOpen(false);
    navigate(ROUTES.PROFILE);
  }

  function handleMyOrders() {
    setProfileOpen(false);
    setMenuOpen(false);
    navigate(ROUTES.MY_SERVICE_ORDERS);
  }

  function handleWallet() {
    setProfileOpen(false);
    setMenuOpen(false);
    navigate(ROUTES.WALLET);
  }

  function handleGoHome() {
    setProfileOpen(false);
    setMenuOpen(false);
    navigate(ROUTES.HOME);
  }

  return (
    <header className="flex items-center justify-between px-6 py-[14px] sm:px-10 sm:py-[18px] bg-white/90 backdrop-blur-md border-b border-[#C7D1CB] sticky top-0 z-50 font-sans">

      {/* Logo */}
      <div className="flex items-center gap-[6px] text-[22px] font-bold tracking-tight text-[#12233D]">
        <button
          onClick={handleGoHome}
          className="flex items-center gap-[6px] text-[22px] font-bold tracking-tight text-[#12233D] bg-transparent border-none cursor-pointer p-0"
        >
         Three Minds
          <span className="w-[7px] h-[7px] rounded-full bg-[#E8A33D] inline-block" />
        </button>
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

      {/* Carteira + Perfil - escondido no mobile */}
      <div className="hidden sm:flex items-center gap-3">
        {user && (
          <button
            onClick={handleWallet}
            className="flex items-center gap-2 bg-white border border-[#C7D1CB] rounded-full pl-4 pr-1.5 py-1.5 cursor-pointer hover:border-[#12233D] transition-colors duration-150"
          >
            <span className="text-[13px] font-semibold text-[#12233D]">
              {walletLoading ? "..." : formatCurrency(walletBalance ?? 0)}
            </span>
            <span className="w-6 h-6 rounded-full bg-[#E8A33D] text-[#12233D] flex items-center justify-center shrink-0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </button>
        )}

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((current) => !current)}
            className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer py-1 pl-1 pr-2 rounded-full hover:bg-[#F1F4F2] transition-colors duration-150"
          >
            <span className="w-9 h-9 rounded-full bg-[#12233D] text-white flex items-center justify-center text-sm font-semibold shrink-0">
              {getInitials(user?.name)}
            </span>
            <span className="text-[13px] font-medium text-[#12233D] max-w-[120px] truncate">
              {user?.name ?? "Minha conta"}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`text-[#586268] transition-transform duration-150 ${profileOpen ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#C7D1CB] rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2.5 border-b border-[#C7D1CB]">
                <p className="text-sm font-semibold text-[#12233D] truncate">
                  {user?.name ?? "Usuário"}
                </p>
                <p className="text-xs text-[#586268] truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleProfile}
                className="w-full text-left px-4 py-2.5 text-sm text-[#12233D] bg-transparent border-none cursor-pointer hover:bg-[#F1F4F2] transition-colors duration-150"
              >
                Meu perfil
              </button>
              <button
                onClick={handleMyOrders}
                className="w-full text-left px-4 py-2.5 text-sm text-[#12233D] bg-transparent border-none cursor-pointer hover:bg-[#F1F4F2] transition-colors duration-150"
              >
                Meus chamados
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 bg-transparent border-none cursor-pointer hover:bg-[#F1F4F2] transition-colors duration-150"
              >
                Sair
              </button>
            </div>
          )}
        </div>
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

          <div className="flex items-center gap-3 border-t border-[#C7D1CB] pt-5">
            <span className="w-9 h-9 rounded-full bg-[#12233D] text-white flex items-center justify-center text-sm font-semibold shrink-0">
              {getInitials(user?.name)}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#12233D] truncate">
                {user?.name ?? "Usuário"}
              </p>
              <p className="text-xs text-[#586268] truncate">{user?.email}</p>
            </div>
          </div>

          {user && (
            <button
              onClick={handleWallet}
              className="w-full flex items-center justify-between bg-[#F1F4F2] border-none rounded-md px-4 py-3 cursor-pointer"
            >
              <span className="text-sm text-[#586268]">Saldo disponível</span>
              <span className="text-base font-bold text-[#12233D]">
                {walletLoading ? "..." : formatCurrency(walletBalance ?? 0)}
              </span>
            </button>
          )}

          <button
            onClick={handleProfile}
            className="w-full bg-transparent border border-[#C7D1CB] text-[#12233D] px-5 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:border-[#12233D] transition-colors duration-150"
          >
            Meu perfil
          </button>

          <button
            onClick={handleMyOrders}
            className="w-full bg-transparent border border-[#C7D1CB] text-[#12233D] px-5 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:border-[#12233D] transition-colors duration-150"
          >
            Meus chamados
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-transparent border border-red-200 text-red-600 px-5 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-red-50 transition-colors duration-150"
          >
            Sair
          </button>
        </div>
      )}

    </header>
  );
}