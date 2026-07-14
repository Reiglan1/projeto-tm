import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useLayout } from "@/context/LayoutProvider";
import { getServiceOrderById } from "@/services/serviceOrder";
import {
  getPaymentByServiceOrder,
  initiatePayment,
  confirmPayment,
} from "@/services/payments";
import { openDispute } from "@/services/disputes";
import { ApiError } from "@/services/apiError";
import { ResponseServiceOrderJason } from "@/types/serviceOrder";
import { PaymentRecord } from "@/types/payment";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function paymentStatusLabel(payment: PaymentRecord): { label: string; className: string } {
  const raw = (payment.status ?? "").toString().toUpperCase();

  if (raw.includes("APPROV") || raw.includes("PAID") || raw.includes("SUCCESS")) {
    return { label: "Pagamento aprovado", className: "bg-[#26A06D]/10 text-[#1F8A5B]" };
  }
  if (raw.includes("ESCROW")) {
    return { label: "Pago — retido até concluir o serviço", className: "bg-[#F5C518]/15 text-[#3A3A3A]" };
  }
  if (raw.includes("REJECT") || raw.includes("FAIL") || raw.includes("CANCEL")) {
    return { label: "Pagamento não aprovado", className: "bg-red-50 text-red-600" };
  }
  return { label: raw || "Aguardando pagamento", className: "bg-[#F5C518]/15 text-[#C99A00]" };
}

export default function PaymentPage() {
  const { serviceOrderId } = useParams<{ serviceOrderId: string }>();
  const { user } = useLayout();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [order, setOrder] = useState<ResponseServiceOrderJason | null>(null);
  const [payment, setPayment] = useState<PaymentRecord | null>(null);

  const [email, setEmail] = useState(user?.email ?? "");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "wallet">("pix");
  const [initiating, setInitiating] = useState(false);
  const [initiateError, setInitiateError] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [disputeError, setDisputeError] = useState<string | null>(null);
  const [disputeOpened, setDisputeOpened] = useState(false);

  async function handleCopyPixCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Alguns navegadores/contextos bloqueiam a Clipboard API (ex: sem HTTPS).
      // Nesse caso o usuário ainda pode selecionar o texto manualmente.
    }
  }

  async function handleOpenDispute(event: FormEvent) {
    event.preventDefault();

    if (!payment?.id) {
      setDisputeError("Não foi possível identificar o pagamento");
      return;
    }
    if (!disputeReason.trim()) {
      setDisputeError("Descreva o motivo da disputa");
      return;
    }

    setDisputeError(null);
    setSubmittingDispute(true);

    try {
      await openDispute(payment.id, { reason: disputeReason.trim() });
      setDisputeOpened(true);
      setShowDisputeForm(false);
      setDisputeReason("");
    } catch (error) {
      const apiError = error as ApiError;
      setDisputeError(
        apiError.messages?.join(" ") ?? "Não foi possível abrir a disputa"
      );
    } finally {
      setSubmittingDispute(false);
    }
  }

  useEffect(() => {
    if (!serviceOrderId) return;

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    Promise.all([
      getServiceOrderById(serviceOrderId),
      getPaymentByServiceOrder(serviceOrderId),
    ])
      .then(([orderData, paymentData]) => {
        if (cancelled) return;
        setOrder(orderData);
        setPayment(paymentData);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const apiError = error as ApiError;
        setLoadError(
          apiError.messages?.[0] ?? "Não foi possível carregar o chamado"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serviceOrderId]);

  async function handleInitiate(event: FormEvent) {
    event.preventDefault();
    setInitiateError(null);

    if (!serviceOrderId) return;
    if (paymentMethod === "pix" && !email.trim()) {
      setInitiateError("Informe o e-mail para receber a confirmação");
      return;
    }

    setInitiating(true);

    try {
      const result = await initiatePayment(
        paymentMethod === "wallet"
          ? { serviceOrderId, method: "wallet" }
          : {
            serviceOrderId,
            method: "pix",
            payerEmail: email,
            installments: 1,
          }
      );
      setPayment(result);
    } catch (error) {
      const apiError = error as ApiError;
      setInitiateError(
        apiError.messages?.join(" ") ?? "Não foi possível iniciar o pagamento"
      );
    } finally {
      setInitiating(false);
    }
  }

  async function handleRefresh() {
    if (!serviceOrderId) return;
    setRefreshing(true);
    setRefreshError(null);

    try {
      // confirmPayment consulta o provedor (Mercado Pago/Efí) na hora, em vez
      // de só reler o que já está salvo no nosso banco — mais confiável se o
      // webhook do provedor ainda não chegou. Se falhar (ex: método sem essa
      // etapa), cai pro refresh comum.
      if (payment?.id) {
        try {
          const confirmed = await confirmPayment(payment.id);
          setPayment(confirmed);
          return;
        } catch {
          // segue pro fallback abaixo
        }
      }

      const result = await getPaymentByServiceOrder(serviceOrderId);
      setPayment(result);
    } catch (error) {
      const apiError = error as ApiError;
      setRefreshError(
        apiError.messages?.[0] ?? "Não foi possível atualizar o status"
      );
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-6 py-10">
        <p className="text-sm text-[#3A3A3A]">Carregando...</p>
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div className="max-w-xl mx-auto px-6 py-10">
        <p className="text-sm text-red-600">
          {loadError ?? "Chamado não encontrado"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A0A0A] uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>Pagamento</h1>
        <p className="text-sm text-[#3A3A3A] mt-1">
          Chamado de {order.categoryName} com {order.workerName}
        </p>
      </div>

      {/* Resumo do chamado */}
      <div className="bg-white border border-[#D9D6D0] rounded-xl p-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-[#3A3A3A]">Serviço</span>
          <span className="text-[#0A0A0A] font-medium">{order.categoryName}</span>
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-[#3A3A3A]">Profissional</span>
          <span className="text-[#0A0A0A] font-medium">{order.workerName}</span>
        </div>
        <div className="flex items-center justify-between text-sm pt-2 mt-2 border-t border-[#F5F2EC]">
          <span className="text-[#3A3A3A]">Valor</span>
          <span className="text-[#0A0A0A] font-bold text-base">
            {formatCurrency(order.value)}
          </span>
        </div>
      </div>

      {/* Sem pagamento iniciado ainda */}
      {!payment && (
        <form
          onSubmit={handleInitiate}
          noValidate
          className="bg-white border border-[#D9D6D0] rounded-xl p-6 flex flex-col gap-4"
        >
          <h2 className="text-sm font-semibold text-[#0A0A0A] uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>
            Como você quer pagar?
          </h2>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("pix")}
              className={`flex-1 border rounded-md px-4 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors duration-150 ${paymentMethod === "pix"
                ? "bg-[#0A0A0A] border-[#0A0A0A] text-white"
                : "bg-transparent border-[#D9D6D0] text-[#0A0A0A] hover:border-[#0A0A0A]"
                }`}
            >
              Pix
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("wallet")}
              className={`flex-1 border rounded-md px-4 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors duration-150 ${paymentMethod === "wallet"
                ? "bg-[#0A0A0A] border-[#0A0A0A] text-white"
                : "bg-transparent border-[#D9D6D0] text-[#0A0A0A] hover:border-[#0A0A0A]"
                }`}
            >
              Saldo da carteira
            </button>
          </div>

          {paymentMethod === "pix" && (
            <div>
              <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
                E-mail para confirmação
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border border-[#D9D6D0] rounded-md px-3.5 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                placeholder="voce@email.com"
              />
            </div>
          )}

          {paymentMethod === "wallet" && (
            <p className="text-sm text-[#3A3A3A]">
              O valor será debitado do saldo da sua carteira. Se o saldo for
              insuficiente, o pagamento será recusado.
            </p>
          )}

          {initiateError && (
            <p className="text-sm text-red-600">{initiateError}</p>
          )}

          <button
            type="submit"
            disabled={initiating}
            className="bg-[#0A0A0A] border-none text-white px-6 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#242424] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {initiating
              ? "Processando..."
              : paymentMethod === "wallet"
                ? `Pagar ${formatCurrency(order.value)} com saldo`
                : `Pagar ${formatCurrency(order.value)} com PIX`}
          </button>
        </form>
      )}

      {/* Pagamento já iniciado */}
      {payment && (
        <div className="bg-white border border-[#D9D6D0] rounded-xl p-6 flex flex-col gap-4">
          <span
            className={`inline-block self-start text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${paymentStatusLabel(payment).className}`}
          >
            {paymentStatusLabel(payment).label}
          </span>

          {payment.qrCodeBase64 ? (
            <img
              src={`data:image/png;base64,${payment.qrCodeBase64}`}
              alt="QR Code do PIX"
              className="w-48 h-48 mx-auto"
            />
          ) : (
            payment.qrCode && (
              <div className="flex justify-center p-4 bg-white">
                <QRCodeSVG value={payment.qrCode} size={192} />
              </div>
            )
          )}

          {payment.qrCode && (
            <div>
              <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
                PIX copia e cola
              </label>
              <textarea
                readOnly
                value={payment.qrCode}
                rows={3}
                className="w-full border border-[#D9D6D0] rounded-md px-3.5 py-2.5 text-xs text-[#3A3A3A] resize-none"
                onClick={(event) => event.currentTarget.select()}
              />
              <button
                type="button"
                onClick={() => handleCopyPixCode(payment.qrCode!)}
                className="mt-2 w-full bg-transparent border border-[#0A0A0A] text-[#0A0A0A] px-4 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#0A0A0A] hover:text-white transition-colors duration-150"
              >
                {copied ? "Código copiado!" : "Copiar código PIX"}
              </button>
            </div>
          )}

          {(payment.ticketUrl || payment.paymentUrl) && (

            <a href={payment.ticketUrl ?? payment.paymentUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-[#3A3A3A] font-medium underline"
            >
              Abrir página de pagamento
            </a>
          )}

          {!payment.qrCodeBase64 && !payment.qrCode && !payment.ticketUrl && !payment.paymentUrl && (() => {
            const raw = (payment.status ?? "").toString().toUpperCase();
            const isApproved =
              raw.includes("APPROV") || raw.includes("PAID") || raw.includes("SUCCESS") || raw.includes("ESCROW");

            if (isApproved) {
              return (
                <p className="text-sm text-[#1F8A5B] bg-[#26A06D]/10 rounded-md px-3 py-2.5">
                  Pagamento confirmado com o saldo da sua carteira.
                </p>
              );
            }

            return (
              <div>
                <p className="text-sm text-[#3A3A3A] mb-2">
                  Não consegui identificar QR code ou link de pagamento na
                  resposta da API. Confira o JSON abaixo com o time de backend.
                </p>
                <pre className="text-xs text-[#3A3A3A] bg-[#F5F2EC] rounded-md p-3 overflow-x-auto">
                  {JSON.stringify(payment, null, 2)}
                </pre>
              </div>
            );
          })()}

          {refreshError && <p className="text-sm text-red-600">{refreshError}</p>}

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-transparent border border-[#D9D6D0] text-[#0A0A0A] px-5 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:border-[#0A0A0A] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed self-start"
          >
            {refreshing ? "Verificando..." : "Verificar status do pagamento"}
          </button>

          {payment.id && (() => {
            const raw = (payment.status ?? "").toString().toUpperCase();
            const isFailed =
              raw.includes("REJECT") || raw.includes("FAIL") || raw.includes("CANCEL");

            if (isFailed) return null;

            if (disputeOpened) {
              return (
                <p className="text-sm text-[#C99A00] bg-[#F5C518]/10 rounded-md px-3 py-2.5">
                  Disputa aberta. Nossa equipe vai analisar o caso e entrar em
                  contato.
                </p>
              );
            }

            if (!showDisputeForm) {
              return (
                <button
                  type="button"
                  onClick={() => setShowDisputeForm(true)}
                  className="text-sm text-red-600 font-medium underline bg-transparent border-none cursor-pointer self-start"
                >
                  Tive um problema com esse serviço — abrir disputa
                </button>
              );
            }

            return (
              <form
                onSubmit={handleOpenDispute}
                className="flex flex-col gap-2.5 pt-3 border-t border-[#F5F2EC]"
              >
                <label className="text-xs font-medium text-[#0A0A0A]">
                  Descreva o que aconteceu
                </label>
                <textarea
                  value={disputeReason}
                  onChange={(event) => setDisputeReason(event.target.value)}
                  rows={3}
                  className="w-full border border-[#D9D6D0] rounded-md px-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] resize-none"
                  placeholder="Ex: Serviço não foi concluído, cobrança indevida..."
                />

                {disputeError && (
                  <p className="text-xs text-red-600">{disputeError}</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submittingDispute}
                    className="flex-1 bg-red-600 border-none text-white px-4 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-red-700 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submittingDispute ? "Enviando..." : "Confirmar disputa"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDisputeForm(false);
                      setDisputeReason("");
                      setDisputeError(null);
                    }}
                    className="flex-1 bg-transparent border border-[#D9D6D0] text-[#0A0A0A] px-4 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:border-[#0A0A0A] transition-colors duration-150"
                  >
                    Voltar
                  </button>
                </div>
              </form>
            );
          })()}
        </div>
      )}
    </div>
  );
}