import { Suspense, lazy, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLayout } from "@/context/LayoutProvider";
import { useReveal } from "@/hooks/useReveal";
import { useWorkerLiveLocation } from "@/hooks/useWorkerLiveLocation";
import { useShareLocation } from "@/hooks/useShareLocation";
import { getServiceOrders } from "@/services/serviceOrder";
import { ResponseServiceOrderJason } from "@/types/serviceOrder";
import { SERVICE_ORDER_STATUS } from "@/constants/ServiceOrderStatus";
import { buildChatPath, ROUTES } from "@/constants/Constants";
import { getWalletBalance } from "@/services/wallet";
import { getClientWallet } from "@/services/clientWallet";
import { BALANCE_KEYS, formatCurrency, pickBalanceNumber } from "@/utils/Wallet";

// O Mapbox GL é pesado (~500kb) — carrega só quando o card com mapa
// realmente precisa aparecer, em vez de entrar no bundle principal da Home.
const LiveTrackingMap = lazy(() => import("@/components/LiveTrackingMap/LiveTrackingMap"));

function MapFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <p className="text-xs text-[#8A8A8A]">Carregando mapa...</p>
    </div>
  );
}

function formatLastUpdate(value: string | null): string {
  if (!value) return "";
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin <= 0) return "agora mesmo";
  if (diffMin === 1) return "há 1 min";
  return `há ${diffMin} min`;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function formatBRL(value: number): string {
  return formatCurrency(value);
}

export default function HeroSection() {
  const { user } = useLayout();
  const navigate = useNavigate();
  const scopeRef = useReveal<HTMLElement>();

  const [activeOrder, setActiveOrder] = useState<ResponseServiceOrderJason | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setWalletBalance(null);
      return;
    }
    let cancelled = false;
    setWalletLoading(true);

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
      setLoading(false);
      return;
    }
    let cancelled = false;

    const params =
      user.role === "client"
        ? { clientId: user.id, pageSize: 5 }
        : { workerId: user.id, pageSize: 5 };

    getServiceOrders(params)
      .then((data) => {
        if (cancelled) return;
        const active = data.items.find(
          (o) =>
            o.status === SERVICE_ORDER_STATUS.ACCEPTED ||
            o.status === SERVICE_ORDER_STATUS.IN_PROGRESS
        );
        setActiveOrder(active ?? null);
      })
      .catch(() => {
        if (!cancelled) setActiveOrder(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  function scrollToProfessionals() {
    document.getElementById("profissionais")?.scrollIntoView({ behavior: "smooth" });
  }

  const counterpartName = user?.role === "client" ? activeOrder?.workerName : activeOrder?.clientName;

  const trackingEnabled = Boolean(
    activeOrder && user?.role === "client" &&
    (activeOrder.status === SERVICE_ORDER_STATUS.ACCEPTED ||
      activeOrder.status === SERVICE_ORDER_STATUS.IN_PROGRESS)
  );
  const { location: workerLocation, arrivedAt } = useWorkerLiveLocation(activeOrder?.id, trackingEnabled);

  const statusLabel = arrivedAt
    ? "Chegou!"
    : activeOrder?.status === SERVICE_ORDER_STATUS.IN_PROGRESS ? "Em andamento" : "A caminho";

  const destinationPosition =
    activeOrder?.destinationLatitude != null && activeOrder?.destinationLongitude != null
      ? { lat: activeOrder.destinationLatitude, lng: activeOrder.destinationLongitude }
      : null;
  const workerPosition =
    workerLocation?.available && workerLocation.latitude != null && workerLocation.longitude != null
      ? { lat: workerLocation.latitude, lng: workerLocation.longitude }
      : null;

  const isWorker = user?.role === "worker";
  const workerHasActiveRoute = Boolean(
    activeOrder &&
    isWorker &&
    (activeOrder.status === SERVICE_ORDER_STATUS.ACCEPTED ||
      activeOrder.status === SERVICE_ORDER_STATUS.IN_PROGRESS)
  );
  const [sharingOptIn, setSharingOptIn] = useState(false);
  const shareStatus = useShareLocation(activeOrder?.id, workerHasActiveRoute && sharingOptIn);

  const shareStatusMeta: Record<string, { label: string; className: string }> = {
    idle: { label: "Localização não compartilhada", className: "text-[#8A8A8A]" },
    requesting: { label: "Solicitando permissão...", className: "text-[#C99A00]" },
    sharing: { label: "Compartilhando sua localização", className: "text-[#1F8A5B]" },
    denied: { label: "Permissão de localização negada", className: "text-red-600" },
    unavailable: {
      label: "Serviço de localização indisponível neste dispositivo/navegador",
      className: "text-red-600",
    },
    unsupported: { label: "Seu navegador não suporta localização", className: "text-red-600" },
    error: { label: "Não foi possível obter sua localização", className: "text-red-600" },
  };

  return (
    <section ref={scopeRef} className="max-w-[1240px] mx-auto px-6 sm:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16">
      <div className="flex items-end justify-between gap-6 flex-wrap mb-8" data-reveal>
        <div>
          <div className="text-xs font-bold tracking-[.18em] uppercase text-[#C99A00] mb-2.5">
            Bem-vindo de volta
          </div>
          <h1
            className="text-[34px] sm:text-[56px] leading-none tracking-[-1px] text-[#0A0A0A] uppercase"
            style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}
          >
            Olá, {user?.name?.split(" ")[0] ?? "visitante"}.
          </h1>
          {!loading && (
            <p className="text-[15px] text-[#5C5C5C] mt-3">
              {activeOrder ? (
                <>
                  Você tem <strong className="text-[#0A0A0A]">1 chamado em andamento</strong>. Acompanhe tudo em tempo real abaixo.
                </>
              ) : (
                <>
                  Nenhum chamado em andamento. Que tal <strong className="text-[#0A0A0A]">abrir um agora</strong>?
                </>
              )}
            </p>
          )}
        </div>
        {user?.role === "client" && (
          <button
            onClick={scrollToProfessionals}
            className="inline-flex items-center gap-2.5 bg-[#0A0A0A] text-[#FAF7F1] rounded px-6 py-3.5 text-sm font-bold cursor-pointer hover:bg-[#242424] transition-colors duration-150 border-none"
          >
            Abrir chamado
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr] gap-6 items-stretch">
        {activeOrder ? (
          <div className="bg-white border border-[#D9D6D0] rounded-xl overflow-hidden">
            <div className="relative h-[220px] bg-[#EDE9E1]">
              {isWorker ? (
                destinationPosition ? (
                  <Suspense fallback={<MapFallback />}>
                    <LiveTrackingMap
                      className="grayscale-[.15] contrast-[1.02]"
                      workerPosition={workerPosition}
                      destinationPosition={destinationPosition}
                      workerLabel="Você"
                      destinationLabel={`Endereço de ${counterpartName ?? "cliente"}`}
                    />
                  </Suspense>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-center px-6">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <p className="text-xs text-[#5C5C5C]">
                      Esse chamado não tem um endereço com localização
                    </p>
                  </div>
                )
              ) : workerPosition ? (
                <Suspense fallback={<MapFallback />}>
                  <LiveTrackingMap
                    className="grayscale-[.15] contrast-[1.02]"
                    workerPosition={workerPosition}
                    destinationPosition={destinationPosition}
                    workerLabel={counterpartName ?? "Profissional"}
                    destinationLabel="Seu endereço"
                  />
                </Suspense>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-center px-6">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <p className="text-xs text-[#5C5C5C]">
                    Localização do profissional ainda não disponível
                  </p>
                </div>
              )}
              {!isWorker && (
                <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-[#0A0A0A] text-white text-[10px] font-bold tracking-[.12em] uppercase px-2.5 py-1.5 rounded-full z-[400]">
                  <span className="tm-live-dot w-[7px] h-[7px] rounded-full bg-[#E63946] inline-block" />
                  Ao vivo
                </span>
              )}
              {!isWorker && workerLocation?.lastLocationAt && (
                <span className="absolute top-4 right-4 font-mono text-[11px] text-[#0A0A0A] bg-[#F5C518] px-2.5 py-1.5 rounded-full font-semibold z-[400]">
                  {formatLastUpdate(workerLocation.lastLocationAt)}
                </span>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 w-[46px] h-[46px] bg-[#0A0A0A] text-[#FAF7F1] rounded-full flex items-center justify-center font-bold text-[15px]">
                    {getInitials(counterpartName)}
                  </span>
                  <div>
                    <div className="font-bold text-base leading-tight">{counterpartName ?? "Profissional"}</div>
                    <div className="flex items-center gap-2 mt-0.5 text-[13px] text-[#5C5C5C]">
                      {activeOrder.categoryName}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-[#8A8A8A]">#{activeOrder.id.slice(0, 8).toUpperCase()}</span>
              </div>
              {isWorker ? (
                <div className="mt-5 flex items-center justify-between gap-3 bg-[#F5F2EC] rounded-lg px-4 py-3">
                  <div>
                    <p className="text-[13px] font-bold text-[#0A0A0A]">Compartilhar localização</p>
                    <p className={`text-xs mt-0.5 ${shareStatusMeta[shareStatus].className}`}>
                      {shareStatusMeta[shareStatus].label}
                    </p>
                  </div>
                  <button
                    onClick={() => setSharingOptIn((current) => !current)}
                    className={`shrink-0 relative w-11 h-6 rounded-full transition-colors duration-150 border-none cursor-pointer ${sharingOptIn ? "bg-[#1F8A5B]" : "bg-[#D9D6D0]"
                      }`}
                    aria-label="Ativar ou desativar compartilhamento de localização"
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-150 ${sharingOptIn ? "translate-x-[22px]" : "translate-x-0.5"
                        }`}
                    />
                  </button>
                </div>
              ) : (
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0A0A0A]">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1F8A5B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      {statusLabel}
                    </span>
                    <span className="font-mono text-xs text-[#5C5C5C]">
                      {workerPosition
                        ? `atualizado ${formatLastUpdate(workerLocation?.lastLocationAt ?? null)}`
                        : "aguardando localização"}
                    </span>
                  </div>
                  {workerPosition && (
                    <div className="mt-2.5 h-1.5 bg-[#EDE9E1] rounded-full overflow-hidden">
                      <div className="tm-route-fill h-full bg-[#0A0A0A] rounded-full" />
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => navigate(buildChatPath(activeOrder.id))}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0A0A0A] text-[#FAF7F1] rounded px-3 py-3 text-sm font-bold cursor-pointer hover:bg-[#242424] transition-colors duration-150 border-none"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Falar com profissional
                </button>
                <button
                  onClick={() => navigate(ROUTES.MY_SERVICE_ORDERS)}
                  className="flex-none bg-white text-[#0A0A0A] border border-[#0A0A0A] rounded px-5 py-3 text-sm font-bold cursor-pointer hover:bg-[#F5F2EC] transition-colors duration-150"
                >
                  Ver detalhes
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="relative bg-[#0A0A0A] text-[#FAF7F1] rounded-xl px-8 sm:px-11 py-5 text-center flex flex-col items-center justify-center overflow-hidden min-h-[320px] sm:min-h-[433px]"
          >
            <span className="absolute -top-8 -right-8 w-[150px] h-[150px] bg-[#F5C518] opacity-[.12]" />
            <span className="relative w-[52px] h-[52px] border border-[#3A3A3A] bg-[#161616] rounded-xl flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" /><path d="M5 12h14" />
              </svg>
            </span>
            <span className="relative text-xs font-bold tracking-[.18em] uppercase text-[#F5C518] mb-2.5">
              Nenhum chamado ativo
            </span>
            <h2
              className="relative text-[28px] sm:text-[40px] leading-none uppercase mb-3"
              style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}
            >
              Bora resolver algo?
            </h2>
            <p className="relative text-sm leading-relaxed text-[#B5B5B5] max-w-[36ch] mb-4">
              Abra um chamado e acompanhe seu profissional em tempo real, com preço fechado antes de começar.
            </p>
            {user?.role === "client" && (
              <button
                onClick={scrollToProfessionals}
                className="relative inline-flex items-center gap-2.5 bg-[#F5C518] text-[#0A0A0A] rounded px-7 py-3.5 text-sm font-bold cursor-pointer hover:bg-[#FFE57A] transition-colors duration-150 border-none"
              >
                Abrir chamado
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            )}
            <div className="relative flex flex-wrap justify-center gap-2 mt-4">
              {["Elétrica", "Hidráulica", "Limpeza", "Reformas"].map((tag) => (
                <span key={tag} className="text-[13px] font-medium text-[#D9D6D0] border border-[#3A3A3A] rounded-full px-3.5 py-1.5">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Atalhos rápidos */}
        <div className="flex flex-col gap-4 h-full" data-reveal data-reveal-delay=".1">
          <div className="bg-[#0A0A0A] text-[#FAF7F1] rounded-xl p-5">
            <div className="text-[11px] font-bold tracking-[.14em] uppercase text-[#8A8A8A]">
              Saldo em carteira
            </div>
            <div className="font-mono text-[28px] font-bold my-2">
              {walletLoading ? "..." : formatBRL(walletBalance ?? 0)}
            </div>
            <button
              onClick={() =>
                navigate(user?.role === "client" ? ROUTES.CLIENT_WALLET : ROUTES.PROFESSIONAL_WALLET)
              }
              className="w-full inline-flex items-center justify-center gap-2 bg-[#F5C518] text-[#0A0A0A] rounded px-3 py-3 text-sm font-bold cursor-pointer hover:bg-[#FFE57A] transition-colors duration-150 border-none"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Adicionar créditos
            </button>
          </div>
          <button
            onClick={() => navigate(ROUTES.MY_SERVICE_ORDERS)}
            className="flex-1 flex items-center gap-3.5 bg-white border border-[#D9D6D0] rounded-xl px-5 py-4 hover:border-[#0A0A0A] hover:shadow-[0_4px_12px_rgba(0,0,0,.06)] transition-all duration-150 text-left cursor-pointer"
          >
            <span className="shrink-0 w-10 h-10 border border-[#D9D6D0] rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </span>
            <div>
              <div className="font-bold text-[15px]">Meus chamados</div>
              <div className="text-[13px] text-[#5C5C5C]">Histórico e serviços em aberto</div>
            </div>
          </button>
          <button
            onClick={scrollToProfessionals}
            className="flex-1 flex items-center gap-3.5 bg-white border border-[#D9D6D0] rounded-xl px-5 py-4 hover:border-[#0A0A0A] hover:shadow-[0_4px_12px_rgba(0,0,0,.06)] transition-all duration-150 text-left cursor-pointer"
          >
            <span className="shrink-0 w-10 h-10 border border-[#D9D6D0] rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </span>
            <div>
              <div className="font-bold text-[15px]">Repetir serviço</div>
              <div className="text-[13px] text-[#5C5C5C]">Contrate de novo em 1 clique</div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
