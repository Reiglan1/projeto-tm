"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLayout } from "@/context/LayoutProvider";
import { ROUTES } from "@/constants/Constants";
import { getWalletBalance } from "@/services/wallet";
import { getUnreadCounts } from "@/services/chat";
import { getClientWallet } from "@/services/clientWallet";
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
  const [unreadTotal, setUnreadTotal] = useState(0);

  const navItems = [
    { label: "Como funciona", to: null },
    { label: "Serviços", to: ROUTES.CATEGORIES },
    { label: "Profissionais", to: null },
    { label: "Segurança", to: null },
    { label: "Sobre nós", to: null },
  ];

  function handleNavClick(to: string | null) {
    setMenuOpen(false);
    if (to) navigate(to);
  }

  useEffect(() => {
    if (!user) {
      setWalletBalance(null);
      return;
    }

    let cancelled = false;
    setWalletLoading(true);

    // Cliente e worker usam carteiras diferentes: a do cliente (saldo
    // pré-pago) tem schema tipado; a do worker (repasses) ainda não, daí o
    // pickBalanceNumber "adivinhando" o campo.
    const request =
      user.role === "client"
        ? getClientWallet().then((data) => data.balance)
        : getWalletBalance().then((data) => pickBalanceNumber(data, BALANCE_KEYS));

    request
      .then((value) => {
        if (!cancelled) setWalletBalance(value);
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
    if (!user) {
      setUnreadTotal(0);
      return;
    }

    let cancelled = false;

    function fetchUnread() {
      getUnreadCounts()
        .then((data) => {
          if (!cancelled) setUnreadTotal(data.total ?? 0);
        })
        .catch(() => {
          // Falha silenciosa: o badge só some, não é crítico pra navegação.
        });
    }

    fetchUnread();
    const interval = setInterval(fetchUnread, 20000);

    return () => {
      cancelled = true;
      clearInterval(interval);
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

  function handleMessages() {
    setProfileOpen(false);
    setMenuOpen(false);
    navigate(ROUTES.MESSAGES);
  }

  function handleWallet() {
    setProfileOpen(false);
    setMenuOpen(false);
    navigate(user?.role === "client" ? ROUTES.CLIENT_WALLET : ROUTES.PROFESSIONAL_WALLET);
  }

  function handleGoHome() {
    setProfileOpen(false);
    setMenuOpen(false);
    navigate(ROUTES.HOME);
  }

  return (
    <header className="flex items-center justify-between px-6 h-16 sm:px-8 bg-[#FAF7F1]/85 backdrop-blur-md backdrop-saturate-150 border-b border-[#D9D6D0] sticky top-0 z-50 font-sans">

      {/* Logo */}
      <button
        onClick={handleGoHome}
        className="flex items-center gap-2 text-[22px] font-normal uppercase tracking-tight text-[#0A0A0A] bg-transparent border-none cursor-pointer p-0"
        style={{ fontFamily: "'Anton', sans-serif" }}
      >
        Three Minds
        <span className="w-[7px] h-[7px] bg-[#F5C518] inline-block" />
      </button>

      {/* Links de navegação - escondido no mobile */}
      <nav className="hidden sm:block">
        <ul className="flex gap-7 list-none m-0 p-0">
          {navItems.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => handleNavClick(item.to)}
                className="text-[#3A3A3A] bg-transparent border-none cursor-pointer text-sm font-medium hover:text-[#0A0A0A] transition-colors duration-150 p-0"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Carteira + Perfil - escondido no mobile */}
      <div className="hidden sm:flex items-center gap-3.5">
        {user && (
          <button
            onClick={handleMessages}
            className="relative w-9 h-9 rounded-full flex items-center justify-center bg-white border border-[#D9D6D0] hover:border-[#0A0A0A] transition-colors duration-150 cursor-pointer"
            aria-label="Mensagens"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3A3A3A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            {unreadTotal > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E63946] text-white text-[10px] font-semibold flex items-center justify-center">
                {unreadTotal > 99 ? "99+" : unreadTotal}
              </span>
            )}
          </button>
        )}

        {user && (
          <button
            onClick={handleWallet}
            className="flex items-center gap-2 bg-[#0A0A0A] rounded-full pl-3.5 pr-1.5 py-1.5 cursor-pointer hover:bg-[#242424] transition-colors duration-150"
          >
            <span className="font-mono text-[13px] font-medium text-[#FAF7F1]">
              {walletLoading ? "..." : formatCurrency(walletBalance ?? 0)}
            </span>
            <span className="w-6 h-6 rounded-full bg-[#F5C518] text-[#0A0A0A] flex items-center justify-center shrink-0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </button>
        )}

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((current) => !current)}
            className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer py-1 pl-1 pr-2 rounded-full hover:bg-[#F5F2EC] transition-colors duration-150"
          >
            <span className="w-9 h-9 rounded-full bg-[#0A0A0A] text-[#FAF7F1] flex items-center justify-center text-sm font-bold shrink-0">
              {getInitials(user?.name)}
            </span>
            <span className="text-[13px] font-medium text-[#0A0A0A] max-w-[120px] truncate">
              {user?.name ?? "Minha conta"}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`text-[#8A8A8A] transition-transform duration-150 ${profileOpen ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#D9D6D0] rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2.5 border-b border-[#D9D6D0]">
                <p className="text-sm font-bold text-[#0A0A0A] truncate">
                  {user?.name ?? "Usuário"}
                </p>
                <p className="text-xs text-[#5C5C5C] truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleProfile}
                className="w-full text-left px-4 py-2.5 text-sm text-[#0A0A0A] bg-transparent border-none cursor-pointer hover:bg-[#F5F2EC] transition-colors duration-150"
              >
                Meu perfil
              </button>
              <button
                onClick={handleMessages}
                className="w-full flex items-center justify-between bg-transparent border border-[#D9D6D0] text-[#0A0A0A] px-5 py-2.5 rounded text-[13px] font-bold cursor-pointer hover:border-[#0A0A0A] transition-colors duration-150"
              >
                Mensagens
                {unreadTotal > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#E63946] text-white text-[11px] font-semibold flex items-center justify-center">
                    {unreadTotal > 99 ? "99+" : unreadTotal}
                  </span>
                )}
              </button>

              <button
                onClick={handleMyOrders}
                className="w-full bg-transparent border border-[#D9D6D0] text-[#0A0A0A] px-5 py-2.5 rounded text-[13px] font-bold cursor-pointer hover:border-[#0A0A0A] transition-colors duration-150"
              >
                Meus chamados
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-[#E63946] bg-transparent border-none cursor-pointer hover:bg-[#F5F2EC] transition-colors duration-150"
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
        <span className={`block w-6 h-[2px] bg-[#0A0A0A] transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
        <span className={`block w-6 h-[2px] bg-[#0A0A0A] transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
        <span className={`block w-6 h-[2px] bg-[#0A0A0A] transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
      </button>

      {/* Menu mobile expansível */}
      {menuOpen && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-[#FAF7F1] border-b border-[#D9D6D0] flex flex-col px-6 py-5 gap-5">
          <ul className="flex flex-col gap-4 list-none m-0 p-0">
            {navItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => handleNavClick(item.to)}
                  className="text-[#3A3A3A] bg-transparent border-none cursor-pointer text-base font-medium hover:text-[#0A0A0A] transition-colors duration-150 p-0"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 border-t border-[#D9D6D0] pt-5">
            <span className="w-9 h-9 rounded-full bg-[#0A0A0A] text-[#FAF7F1] flex items-center justify-center text-sm font-bold shrink-0">
              {getInitials(user?.name)}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#0A0A0A] truncate">
                {user?.name ?? "Usuário"}
              </p>
              <p className="text-xs text-[#5C5C5C] truncate">{user?.email}</p>
            </div>
          </div>

          {user && (
            <button
              onClick={handleWallet}
              className="w-full flex items-center justify-between bg-[#F5F2EC] border-none rounded px-4 py-3 cursor-pointer"
            >
              <span className="text-sm text-[#5C5C5C]">Saldo disponível</span>
              <span className="font-mono text-base font-bold text-[#0A0A0A]">
                {walletLoading ? "..." : formatCurrency(walletBalance ?? 0)}
              </span>
            </button>
          )}

          <button
            onClick={handleProfile}
            className="w-full bg-transparent border border-[#D9D6D0] text-[#0A0A0A] px-5 py-2.5 rounded text-[13px] font-bold cursor-pointer hover:border-[#0A0A0A] transition-colors duration-150"
          >
            Meu perfil
          </button>

          <button
            onClick={handleMyOrders}
            className="w-full bg-transparent border border-[#D9D6D0] text-[#0A0A0A] px-5 py-2.5 rounded text-[13px] font-bold cursor-pointer hover:border-[#0A0A0A] transition-colors duration-150"
          >
            Meus chamados
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-transparent border border-[#E63946]/30 text-[#E63946] px-5 py-2.5 rounded text-[13px] font-bold cursor-pointer hover:bg-[#E63946]/5 transition-colors duration-150"
          >
            Sair
          </button>
        </div>
      )}

    </header>
  );
}