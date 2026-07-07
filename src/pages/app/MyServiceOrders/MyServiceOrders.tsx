import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLayout } from "@/context/LayoutProvider";
import { getServiceOrders } from "@/services/serviceOrder";
import { ResponseServiceOrderJason } from "@/types/serviceOrder";
import { ApiError } from "@/services/apiError";
import { buildPaymentPath } from "@/constants/Constants";

const PAGE_SIZE = 8;

interface StatusMeta {
  label: string;
  dotClass: string;
  textClass: string;
}

// A spec não documenta os valores possíveis desse enum além dos que já vimos
// funcionando na prática (ver observação abaixo). Ajuste conforme for testando.
function getOrderStatusMeta(status: string): StatusMeta {
  switch (status.toUpperCase()) {
    case "COMPLETED":
    case "FINISHED":
    case "DONE":
      return { label: "Concluído", dotClass: "bg-[#3F8F5F]", textClass: "text-[#2F6E48]" };
    case "IN_PROGRESS":
    case "ACCEPTED":
    case "ONGOING":
      return { label: "Em andamento", dotClass: "bg-[#3E6990]", textClass: "text-[#3E6990]" };
    case "CANCELLED":
    case "CANCELED":
      return { label: "Cancelado", dotClass: "bg-[#B4402A]", textClass: "text-[#B4402A]" };
    case "DISPUTED":
      return { label: "Em disputa", dotClass: "bg-[#B4402A]", textClass: "text-[#B4402A]" };
    case "PENDING":
    default:
      return { label: status || "Pendente", dotClass: "bg-[#C97F1E]", textClass: "text-[#C97F1E]" };
  }
}

function formatDateTime(value: string): string {
  try {
    return new Date(value).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function OrderCard({
  order,
  counterpartLabel,
  counterpartName,
  showPayButton,
}: {
  order: ResponseServiceOrderJason;
  counterpartLabel: string;
  counterpartName: string;
  showPayButton: boolean;
}) {
  const navigate = useNavigate();
  const status = getOrderStatusMeta(order.status);
  const isCancelled = order.status.toUpperCase().includes("CANCEL");

  return (
    <div className="bg-white border border-[#C7D1CB] rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-[#12233D]">
            {order.categoryName}
          </p>
          <p className="text-xs text-[#586268] mt-0.5">
            {counterpartLabel}: {counterpartName}
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
          <span className={status.textClass}>{status.label}</span>
        </span>
      </div>

      <p className="text-sm text-[#586268]">{order.description}</p>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#F1F4F2] text-sm">
        <div>
          <p className="text-xs text-[#586268]">Data</p>
          <p className="text-[#12233D] font-medium">{formatDateTime(order.scheduledAt)}</p>
        </div>
        <div>
          <p className="text-xs text-[#586268]">Valor</p>
          <p className="text-[#12233D] font-medium">{formatCurrency(order.value)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-[#586268]">Endereço</p>
          <p className="text-[#12233D] font-medium truncate">{order.address}</p>
        </div>
      </div>

      {isCancelled && order.cancellationReason && (
        <p className="text-xs text-[#B4402A] bg-red-50 rounded-md px-3 py-2">
          Motivo do cancelamento: {order.cancellationReason}
        </p>
      )}

      {showPayButton && !isCancelled && (
        <button
          onClick={() => navigate(buildPaymentPath(order.id))}
          className="w-full bg-[#12233D] border-none text-white px-4 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#1B3350] transition-colors duration-150"
        >
          Pagar
        </button>
      )}
    </div>
  );
}

export default function MyServiceOrdersPage() {
  const { user } = useLayout();

  const [orders, setOrders] = useState<ResponseServiceOrderJason[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getServiceOrders({
      page,
      pageSize: PAGE_SIZE,
      clientId: user.role === "client" ? user.id : undefined,
      workerId: user.role === "worker" ? user.id : undefined,
    })
      .then((response) => {
        if (cancelled) return;
        setOrders(response.items ?? []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.totalCount || 0);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const apiError = err as ApiError;
        setError(
          apiError.messages?.[0] ?? "Não foi possível carregar seus chamados"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, page]);

  const counterpartLabel = user?.role === "client" ? "Profissional" : "Cliente";

  return (
    <div className="max-w-[880px] mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#12233D]">Meus chamados</h1>
        {!loading && !error && (
          <p className="text-sm text-[#586268]">{totalCount} encontrados</p>
        )}
      </div>

      {loading && (
        <p className="text-sm text-[#586268]">Carregando chamados...</p>
      )}

      {!loading && error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="text-sm text-[#586268]">
          Você ainda não tem nenhum chamado.
        </p>
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                counterpartLabel={counterpartLabel}
                counterpartName={
                  user?.role === "client" ? order.workerName : order.clientName
                }
                showPayButton={user?.role === "client"}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="bg-transparent border border-[#C7D1CB] text-[#12233D] px-4 py-2 rounded-md text-sm font-semibold cursor-pointer hover:border-[#12233D] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-[#586268]">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages}
                className="bg-transparent border border-[#C7D1CB] text-[#12233D] px-4 py-2 rounded-md text-sm font-semibold cursor-pointer hover:border-[#12233D] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}