import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLayout } from "@/context/LayoutProvider";
import {
  getServiceOrders,
  cancelServiceOrder,
  updateServiceOrderStatus,
} from "@/services/serviceOrder";
import { createReview, getReviewsByServiceOrder } from "@/services/reviews";
import { ResponseServiceOrderJason } from "@/types/serviceOrder";
import { ResponseReviewJason } from "@/types/review";
import { ApiError } from "@/services/apiError";
import { buildPaymentPath, buildChatPath } from "@/constants/Constants";
import { getUnreadCounts } from "@/services/chat";
import { SERVICE_ORDER_STATUS } from "@/constants/ServiceOrderStatus";
import Modal from "@/components/Modal/Modal";
import StarRating from "@/components/StarRating/StarRating";

const PAGE_SIZE = 20;

interface StatusMeta {
  label: string;
  dotClass: string;
  textClass: string;
}

function getOrderStatusMeta(status: string): StatusMeta {
  switch (status.toUpperCase()) {
    case SERVICE_ORDER_STATUS.COMPLETED:
      return { label: "Concluído", dotClass: "bg-[#26A06D]", textClass: "text-[#1F8A5B]" };
    case SERVICE_ORDER_STATUS.IN_PROGRESS:
      return { label: "Em andamento", dotClass: "bg-[#F5C518]", textClass: "text-[#3A3A3A]" };
    case SERVICE_ORDER_STATUS.ACCEPTED:
      return { label: "Aceito", dotClass: "bg-[#F5C518]", textClass: "text-[#3A3A3A]" };
    case SERVICE_ORDER_STATUS.CANCELLED:
      return { label: "Cancelado", dotClass: "bg-[#E63946]", textClass: "text-[#E63946]" };
    case SERVICE_ORDER_STATUS.DISPUTED:
      return { label: "Em disputa", dotClass: "bg-[#E63946]", textClass: "text-[#E63946]" };
    case SERVICE_ORDER_STATUS.PENDING:
    default:
      return { label: status || "Pendente", dotClass: "bg-[#C99A00]", textClass: "text-[#C99A00]" };
  }
}

// Próxima ação disponível pro profissional, dado o status atual.
function getNextWorkerAction(
  status: string
): { label: string; nextStatus: string } | null {
  switch (status.toUpperCase()) {
    case SERVICE_ORDER_STATUS.PENDING:
      return { label: "Aceitar chamado", nextStatus: SERVICE_ORDER_STATUS.ACCEPTED };
    case SERVICE_ORDER_STATUS.ACCEPTED:
      return { label: "Iniciar serviço", nextStatus: SERVICE_ORDER_STATUS.IN_PROGRESS };
    case SERVICE_ORDER_STATUS.IN_PROGRESS:
      return { label: "Concluir chamado", nextStatus: SERVICE_ORDER_STATUS.COMPLETED };
    default:
      return null;
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
  isWorker,
  currentUserId,
  unreadCount,
  onUpdated,
  compact = false,
}: {
  order: ResponseServiceOrderJason;
  counterpartLabel: string;
  counterpartName: string;
  showPayButton: boolean;
  isWorker: boolean;
  currentUserId?: string;
  unreadCount?: number;
  onUpdated: (updated: ResponseServiceOrderJason) => void;
  compact?: boolean;
}) {
  const navigate = useNavigate();
  const status = getOrderStatusMeta(order.status);
  const upperStatus = order.status.toUpperCase();
  const isCancelled = upperStatus === SERVICE_ORDER_STATUS.CANCELLED;
  const isCompleted = upperStatus === SERVICE_ORDER_STATUS.COMPLETED;
  const canCancel = !isCancelled && !isCompleted;
  const nextAction = isWorker ? getNextWorkerAction(order.status) : null;

  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [reason, setReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [myReview, setMyReview] = useState<ResponseReviewJason | null>(null);
  const [checkingReview, setCheckingReview] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!isCompleted || !currentUserId) return;

    let cancelled = false;
    setCheckingReview(true);

    getReviewsByServiceOrder(order.id)
      .then((reviews) => {
        if (cancelled) return;
        const mine = reviews.find((review) => review.reviewerId === currentUserId);
        setMyReview(mine ?? null);
      })
      .catch(() => {
        // Falha silenciosa: pior caso o botão de avaliar aparece de novo.
      })
      .finally(() => {
        if (!cancelled) setCheckingReview(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isCompleted, currentUserId, order.id]);

  async function handleSubmitReview(event: FormEvent) {
    event.preventDefault();
    if (rating < 1) {
      setReviewError("Escolha de 1 a 5 estrelas");
      return;
    }

    setReviewError(null);
    setSubmittingReview(true);

    try {
      const created = await createReview({
        serviceOrderId: order.id,
        rating,
        comment: comment.trim() || undefined,
      });
      setMyReview(created);
      setShowReviewModal(false);
      setRating(0);
      setComment("");
    } catch (error) {
      const apiError = error as ApiError;
      setReviewError(
        apiError.messages?.join(" ") ?? "Não foi possível enviar sua avaliação"
      );
    } finally {
      setSubmittingReview(false);
    }
  }

  async function handleConfirmCancel(event: FormEvent) {
    event.preventDefault();
    setCancelError(null);
    setCancelling(true);

    try {
      const updated = await cancelServiceOrder(order.id, {
        cancellationReason: reason.trim() || "Cancelado pelo usuário",
      });
      onUpdated(updated);
      setConfirmingCancel(false);
      setReason("");
    } catch (error) {
      const apiError = error as ApiError;
      setCancelError(
        apiError.messages?.join(" ") ?? "Não foi possível cancelar o chamado"
      );
    } finally {
      setCancelling(false);
    }
  }

  async function handleAdvanceStatus() {
    if (!nextAction) return;
    setStatusError(null);
    setUpdatingStatus(true);

    try {
      const updated = await updateServiceOrderStatus(order.id, {
        status: nextAction.nextStatus,
      });
      onUpdated(updated);
    } catch (error) {
      const apiError = error as ApiError;
      setStatusError(
        apiError.messages?.join(" ") ?? "Não foi possível atualizar o status"
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (compact) {
    return (
      <div className="flex flex-col gap-2.5 py-4 px-1 border-b border-[#F0EDE6] last:border-b-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className={`w-2 h-2 rounded-full shrink-0 ${status.dotClass}`} />
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#0A0A0A] truncate">
                {order.categoryName}
                <span className="text-[#8A8A8A] font-normal"> · {counterpartName}</span>
              </p>
              <p className="text-xs text-[#8A8A8A] mt-0.5 truncate">
                {formatDateTime(order.scheduledAt)}
                {isCancelled && order.cancellationReason && (
                  <span className="text-[#E63946]"> · {order.cancellationReason}</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(buildChatPath(order.id))}
            className="relative w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[#3A3A3A] hover:bg-[#F5F2EC] transition-colors duration-150 bg-transparent border border-[#D9D6D0] cursor-pointer"
            title="Conversar"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            {Boolean(unreadCount) && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#E63946] text-white text-[9px] font-semibold flex items-center justify-center">
                {unreadCount! > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 pl-5 text-xs">
          <span className="font-mono text-sm text-[#0A0A0A] font-medium">
            {formatCurrency(order.value)}
          </span>

          <span className={`text-xs font-semibold ${status.textClass}`}>
            {status.label}
          </span>

          {isCompleted && currentUserId && (
            myReview ? (
              <StarRating value={myReview.rating} readOnly />
            ) : (
              <button
                onClick={() => setShowReviewModal(true)}
                disabled={checkingReview}
                className="text-xs font-bold text-[#C99A00] bg-transparent border-none cursor-pointer hover:underline disabled:opacity-60"
              >
                {checkingReview ? "..." : "Avaliar"}
              </button>
            )
          )}
        </div>

        <Modal
          open={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setReviewError(null);
          }}
          title={`Avaliar ${counterpartName}`}
        >
          <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 py-2">
              <StarRating value={rating} onChange={setRating} />
              <p className="text-xs text-[#3A3A3A]">
                {rating > 0 ? `${rating} de 5 estrelas` : "Toque para avaliar"}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-[#0A0A0A]">
                Comentário (opcional)
              </label>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={3}
                maxLength={500}
                className="mt-1.5 w-full border border-[#D9D6D0] rounded-md px-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] resize-none"
                placeholder="Conte como foi sua experiência..."
              />
            </div>

            {reviewError && <p className="text-xs text-red-600">{reviewError}</p>}

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full bg-[#0A0A0A] border-none text-white px-4 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#242424] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submittingReview ? "Enviando..." : "Enviar avaliação"}
            </button>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#D9D6D0] rounded-xl p-5 flex flex-col gap-3">

      {/* Informações */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[16px] font-bold text-[#0A0A0A]">
            {order.categoryName}
          </p>
          <p className="text-sm text-[#5C5C5C] mt-0.5">
            {counterpartLabel}: <span className="text-[#0A0A0A] font-medium">{counterpartName}</span>
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium shrink-0 bg-[#F5F2EC] rounded-full px-3 py-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
          <span className={status.textClass}>{status.label}</span>
        </span>
      </div>

      <p className="text-sm text-[#3A3A3A]">{order.description}</p>

      <div className="flex flex-wrap gap-x-6 gap-y-3 pt-3 border-t border-[#F5F2EC] text-sm">
        <div>
          <p className="text-xs text-[#8A8A8A]">Data</p>
          <p className="text-[#0A0A0A] font-medium">{formatDateTime(order.scheduledAt)}</p>
        </div>
        <div>
          <p className="text-xs text-[#8A8A8A]">Valor</p>
          <p className="font-mono text-[#0A0A0A] font-medium">{formatCurrency(order.value)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-[#8A8A8A]">Endereço</p>
          <p className="text-[#0A0A0A] font-medium truncate max-w-[220px]">{order.address}</p>
        </div>
      </div>

      {isCancelled && order.cancellationReason && (
        <p className="text-xs text-[#E63946] bg-red-50 rounded px-3 py-2">
          Motivo do cancelamento: {order.cancellationReason}
        </p>
      )}

      {isCompleted && currentUserId && (
        <div className="pt-1">
          {myReview ? (
            <div className="inline-flex items-center gap-2 bg-[#F5F2EC] rounded px-3 py-2">
              <StarRating value={myReview.rating} readOnly />
              <span className="text-xs text-[#5C5C5C]">
                Você avaliou {counterpartLabel.toLowerCase()}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowReviewModal(true)}
              disabled={checkingReview}
              className="bg-transparent border border-[#C99A00] text-[#C99A00] px-4 py-2 rounded text-[13px] font-bold cursor-pointer hover:bg-[#FFF6D6] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {checkingReview ? "Verificando..." : `Avaliar ${counterpartLabel.toLowerCase()}`}
            </button>
          )}
        </div>
      )}

      {/* Ações */}
      <div className="flex flex-wrap gap-2 pt-1">
        {!isCancelled && (
          <button
            onClick={() => navigate(buildChatPath(order.id))}
            className="relative flex-1 min-w-[140px] bg-transparent border border-[#0A0A0A] text-[#0A0A0A] px-4 py-2.5 rounded text-[13px] font-bold cursor-pointer hover:bg-[#0A0A0A] hover:text-white transition-colors duration-150 flex items-center justify-center gap-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            Conversar
            {Boolean(unreadCount) && (
              <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 rounded-full bg-[#E63946] text-white text-[11px] font-semibold flex items-center justify-center">
                {unreadCount! > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        )}

        {showPayButton && !isCancelled && !isCompleted && (
          <button
            onClick={() => navigate(buildPaymentPath(order.id))}
            className="flex-1 min-w-[140px] bg-[#0A0A0A] border-none text-white px-4 py-2.5 rounded text-[13px] font-bold cursor-pointer hover:bg-[#242424] transition-colors duration-150"
          >
            Pagar
          </button>
        )}

        {nextAction && (
          <button
            onClick={handleAdvanceStatus}
            disabled={updatingStatus}
            className="flex-1 min-w-[140px] bg-[#1F8A5B] border-none text-white px-4 py-2.5 rounded text-[13px] font-bold cursor-pointer hover:bg-[#17734A] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {updatingStatus ? "Atualizando..." : nextAction.label}
          </button>
        )}

        {canCancel && !confirmingCancel && (
          <button
            onClick={() => setConfirmingCancel(true)}
            className="flex-1 min-w-[140px] bg-transparent border border-red-200 text-red-600 px-4 py-2.5 rounded text-[13px] font-bold cursor-pointer hover:bg-red-50 transition-colors duration-150"
          >
            Cancelar chamado
          </button>
        )}
      </div>

      {statusError && <p className="text-xs text-red-600">{statusError}</p>}

      <Modal
        open={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setReviewError(null);
        }}
        title={`Avaliar ${counterpartName}`}
      >
        <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 py-2">
            <StarRating value={rating} onChange={setRating} />
            <p className="text-xs text-[#3A3A3A]">
              {rating > 0 ? `${rating} de 5 estrelas` : "Toque para avaliar"}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-[#0A0A0A]">
              Comentário (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={3}
              maxLength={500}
              className="mt-1.5 w-full border border-[#D9D6D0] rounded-md px-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] resize-none"
              placeholder="Conte como foi sua experiência..."
            />
          </div>

          {reviewError && <p className="text-xs text-red-600">{reviewError}</p>}

          <button
            type="submit"
            disabled={submittingReview}
            className="w-full bg-[#0A0A0A] border-none text-white px-4 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#242424] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submittingReview ? "Enviando..." : "Enviar avaliação"}
          </button>
        </form>
      </Modal>

      {canCancel && confirmingCancel && (
        <form onSubmit={handleConfirmCancel} className="flex flex-col gap-2.5 pt-2 border-t border-[#F5F2EC]">
          <label className="text-xs font-medium text-[#0A0A0A]">
            Motivo do cancelamento (opcional)
          </label>
          <p className="text-xs text-[#5C5C5C]">
            Se o chamado já estiver pago, o valor é estornado automaticamente
            após o cancelamento.
          </p>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={2}
            className="w-full border border-[#D9D6D0] rounded px-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] resize-none"
            placeholder="Ex: Imprevisto, remarquei para outra data..."
          />

          {cancelError && <p className="text-xs text-red-600">{cancelError}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={cancelling}
              className="flex-1 bg-red-600 border-none text-white px-4 py-2.5 rounded text-[13px] font-bold cursor-pointer hover:bg-red-700 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cancelling ? "Cancelando..." : "Confirmar cancelamento"}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmingCancel(false);
                setReason("");
                setCancelError(null);
              }}
              className="flex-1 bg-transparent border border-[#D9D6D0] text-[#0A0A0A] px-4 py-2.5 rounded text-[13px] font-bold cursor-pointer hover:border-[#0A0A0A] transition-colors duration-150"
            >
              Voltar
            </button>
          </div>
        </form>
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
  const [unreadByOrder, setUnreadByOrder] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;

    getUnreadCounts()
      .then((data) => {
        const map: Record<string, number> = {};
        (data.perOrder ?? []).forEach((entry) => {
          map[entry.serviceOrderId] = entry.count;
        });
        setUnreadByOrder(map);
      })
      .catch(() => {
        // Badge é só um detalhe visual, não bloqueia a tela se falhar.
      });
  }, [user]);

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

  function handleOrderUpdated(updated: ResponseServiceOrderJason) {
    setOrders((current) =>
      current.map((order) => (order.id === updated.id ? updated : order))
    );
  }

  const counterpartLabel = user?.role === "client" ? "Profissional" : "Cliente";

  const openOrders = orders.filter((order) => {
    const upper = order.status.toUpperCase();
    return upper !== SERVICE_ORDER_STATUS.COMPLETED && upper !== SERVICE_ORDER_STATUS.CANCELLED;
  });
  const completedOrders = orders.filter(
    (order) => order.status.toUpperCase() === SERVICE_ORDER_STATUS.COMPLETED
  );
  const cancelledOrders = orders.filter(
    (order) => order.status.toUpperCase() === SERVICE_ORDER_STATUS.CANCELLED
  );
  const finishedOrders = [...completedOrders, ...cancelledOrders].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const totalSpent = completedOrders.reduce((sum, order) => sum + order.value, 0);

  function renderOrderCard(order: ResponseServiceOrderJason, compact = false) {
    return (
      <OrderCard
        key={order.id}
        order={order}
        counterpartLabel={counterpartLabel}
        counterpartName={
          user?.role === "client" ? order.workerName : order.clientName
        }
        showPayButton={user?.role === "client"}
        isWorker={user?.role === "worker"}
        currentUserId={user?.id}
        unreadCount={unreadByOrder[order.id]}
        onUpdated={handleOrderUpdated}
        compact={compact}
      />
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-10 sm:py-14">
      <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-3xl sm:text-[42px] leading-none text-[#0A0A0A] uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>Meus chamados</h1>
          <p className="text-[15px] text-[#5C5C5C] mt-3">
            Acompanhe seus chamados abertos e consulte o histórico de serviços.
          </p>
        </div>
        {!loading && !error && (
          <p className="text-sm text-[#5C5C5C]">{totalCount} encontrados</p>
        )}
      </div>

      {loading && (
        <p className="text-sm text-[#3A3A3A]">Carregando chamados...</p>
      )}

      {!loading && error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="text-sm text-[#3A3A3A]">
          Você ainda não tem nenhum chamado.
        </p>
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          {/* Resumo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            <div className="bg-white border border-[#D9D6D0] rounded-xl px-4 py-3.5 sm:px-5 sm:py-4">
              <p className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase text-[#8A8A8A] mb-1 truncate">Em aberto</p>
              <p className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">{openOrders.length}</p>
            </div>
            <div className="bg-white border border-[#D9D6D0] rounded-xl px-4 py-3.5 sm:px-5 sm:py-4">
              <p className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase text-[#8A8A8A] mb-1 truncate">Concluídos</p>
              <p className="text-xl sm:text-2xl font-bold text-[#1F8A5B]">{completedOrders.length}</p>
            </div>
            <div className="bg-white border border-[#D9D6D0] rounded-xl px-4 py-3.5 sm:px-5 sm:py-4">
              <p className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase text-[#8A8A8A] mb-1 truncate">Cancelados</p>
              <p className="text-xl sm:text-2xl font-bold text-[#E63946]">{cancelledOrders.length}</p>
            </div>
            <div className="bg-[#0A0A0A] rounded-xl px-4 py-3.5 sm:px-5 sm:py-4 min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase text-[#8A8A8A] mb-1 truncate">
                {user?.role === "client" ? "Total investido" : "Total recebido"}
              </p>
              <p className="font-mono text-base sm:text-2xl font-bold text-[#F5C518] truncate">{formatCurrency(totalSpent)}</p>
            </div>
          </div>

          {/* Em aberto */}
          <div className="mb-10">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#C99A00]" />
              <h2 className="text-sm font-bold text-[#0A0A0A] uppercase tracking-wide">
                Em aberto
              </h2>
              <span className="text-xs text-[#8A8A8A]">({openOrders.length})</span>
            </div>
            {openOrders.length === 0 ? (
              <p className="text-sm text-[#8A8A8A] bg-white border border-dashed border-[#D9D6D0] rounded-xl px-5 py-8 text-center">
                Nenhum chamado em aberto no momento.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {openOrders.map((order) => renderOrderCard(order))}
              </div>
            )}
          </div>

          {/* Histórico */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#8A8A8A]" />
              <h2 className="text-sm font-bold text-[#0A0A0A] uppercase tracking-wide">
                Histórico
              </h2>
              <span className="text-xs text-[#8A8A8A]">({finishedOrders.length})</span>
            </div>
            {finishedOrders.length === 0 ? (
              <p className="text-sm text-[#8A8A8A] bg-white border border-dashed border-[#D9D6D0] rounded-xl px-5 py-8 text-center">
                Nenhum chamado finalizado ainda.
              </p>
            ) : (
              <div className="bg-white border border-[#D9D6D0] rounded-xl px-5 sm:px-6">
                {finishedOrders.map((order) => renderOrderCard(order, true))}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="bg-transparent border border-[#D9D6D0] text-[#0A0A0A] px-4 py-2 rounded-md text-sm font-semibold cursor-pointer hover:border-[#0A0A0A] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior

              </button>
              <span className="text-sm text-[#3A3A3A]">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages}
                className="bg-transparent border border-[#D9D6D0] text-[#0A0A0A] px-4 py-2 rounded-md text-sm font-semibold cursor-pointer hover:border-[#0A0A0A] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
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