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
import { buildPaymentPath } from "@/constants/Constants";
import { SERVICE_ORDER_STATUS } from "@/constants/ServiceOrderStatus";
import Modal from "@/components/Modal/Modal";
import StarRating from "@/components/StarRating/StarRating";

const PAGE_SIZE = 8;

interface StatusMeta {
  label: string;
  dotClass: string;
  textClass: string;
}

function getOrderStatusMeta(status: string): StatusMeta {
  switch (status.toUpperCase()) {
    case SERVICE_ORDER_STATUS.COMPLETED:
      return { label: "Concluído", dotClass: "bg-[#3F8F5F]", textClass: "text-[#2F6E48]" };
    case SERVICE_ORDER_STATUS.IN_PROGRESS:
      return { label: "Em andamento", dotClass: "bg-[#3E6990]", textClass: "text-[#3E6990]" };
    case SERVICE_ORDER_STATUS.ACCEPTED:
      return { label: "Aceito", dotClass: "bg-[#3E6990]", textClass: "text-[#3E6990]" };
    case SERVICE_ORDER_STATUS.CANCELLED:
      return { label: "Cancelado", dotClass: "bg-[#B4402A]", textClass: "text-[#B4402A]" };
    case SERVICE_ORDER_STATUS.DISPUTED:
      return { label: "Em disputa", dotClass: "bg-[#B4402A]", textClass: "text-[#B4402A]" };
    case SERVICE_ORDER_STATUS.PENDING:
    default:
      return { label: status || "Pendente", dotClass: "bg-[#C97F1E]", textClass: "text-[#C97F1E]" };
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
  onUpdated,
}: {
  order: ResponseServiceOrderJason;
  counterpartLabel: string;
  counterpartName: string;
  showPayButton: boolean;
  isWorker: boolean;
  currentUserId?: string;
  onUpdated: (updated: ResponseServiceOrderJason) => void;
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

      {isCompleted && currentUserId && (
        <div className="pt-1">
          {myReview ? (
            <div className="flex items-center gap-2 bg-[#F1F4F2] rounded-md px-3 py-2">
              <StarRating value={myReview.rating} readOnly />
              <span className="text-xs text-[#586268]">
                Você avaliou {counterpartLabel.toLowerCase()}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowReviewModal(true)}
              disabled={checkingReview}
              className="w-full bg-transparent border border-[#C97F1E] text-[#C97F1E] px-4 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#FDF4E8] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {checkingReview ? "Verificando..." : `Avaliar ${counterpartLabel.toLowerCase()}`}
            </button>
          )}
        </div>
      )}

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
            <p className="text-xs text-[#586268]">
              {rating > 0 ? `${rating} de 5 estrelas` : "Toque para avaliar"}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-[#12233D]">
              Comentário (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={3}
              maxLength={500}
              className="mt-1.5 w-full border border-[#C7D1CB] rounded-md px-3 py-2 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D] resize-none"
              placeholder="Conte como foi sua experiência..."
            />
          </div>

          {reviewError && <p className="text-xs text-red-600">{reviewError}</p>}

          <button
            type="submit"
            disabled={submittingReview}
            className="w-full bg-[#12233D] border-none text-white px-4 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#1B3350] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submittingReview ? "Enviando..." : "Enviar avaliação"}
          </button>
        </form>
      </Modal>

      {showPayButton && !isCancelled && (
        <button
          onClick={() => navigate(buildPaymentPath(order.id))}
          className="w-full bg-[#12233D] border-none text-white px-4 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#1B3350] transition-colors duration-150"
        >
          Pagar
        </button>
      )}

      {nextAction && (
        <div className="flex flex-col gap-1.5">
          <button
            onClick={handleAdvanceStatus}
            disabled={updatingStatus}
            className="w-full bg-[#3F8F5F] border-none text-white px-4 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#2F6E48] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {updatingStatus ? "Atualizando..." : nextAction.label}
          </button>
          {statusError && <p className="text-xs text-red-600">{statusError}</p>}
        </div>
      )}

      {canCancel && !confirmingCancel && (
        <button
          onClick={() => setConfirmingCancel(true)}
          className="w-full bg-transparent border border-red-200 text-red-600 px-4 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-red-50 transition-colors duration-150"
        >
          Cancelar chamado
        </button>
      )}

      {canCancel && confirmingCancel && (
        <form onSubmit={handleConfirmCancel} className="flex flex-col gap-2.5 pt-2 border-t border-[#F1F4F2]">
          <label className="text-xs font-medium text-[#12233D]">
            Motivo do cancelamento (opcional)
          </label>
          <p className="text-xs text-[#586268]">
            Se o chamado já estiver pago, o valor é estornado automaticamente
            após o cancelamento.
          </p>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={2}
            className="w-full border border-[#C7D1CB] rounded-md px-3 py-2 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D] resize-none"
            placeholder="Ex: Imprevisto, remarquei para outra data..."
          />

          {cancelError && <p className="text-xs text-red-600">{cancelError}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={cancelling}
              className="flex-1 bg-red-600 border-none text-white px-4 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-red-700 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
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
              className="flex-1 bg-transparent border border-[#C7D1CB] text-[#12233D] px-4 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:border-[#12233D] transition-colors duration-150"
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
                isWorker={user?.role === "worker"}
                currentUserId={user?.id}
                onUpdated={handleOrderUpdated}
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