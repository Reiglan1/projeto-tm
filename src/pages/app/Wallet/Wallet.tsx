import { FormEvent, useEffect, useState } from "react";
import {
  getWalletBalance,
  getMyWithdrawals,
  requestWithdrawal,
} from "@/services/wallet";
import { ApiError } from "@/services/apiError";
import { WalletBalance, WithdrawalRecord } from "@/types/wallet";
import { BALANCE_KEYS, formatCurrency, pickBalanceNumber } from "@/utils/Wallet";

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function withdrawalStatusLabel(record: WithdrawalRecord): { label: string; className: string } {
  const raw = (record.result ?? record.status ?? "").toString().toUpperCase();

  if (raw.includes("SUCCESS") || raw === "APPROVED" || raw === "COMPLETED") {
    return { label: "Concluído", className: "bg-[#3F8F5F]/10 text-[#2F6E48]" };
  }
  if (raw.includes("FAIL") || raw === "REJECTED") {
    return { label: "Falhou", className: "bg-red-50 text-red-600" };
  }
  return { label: raw || "Em processamento", className: "bg-[#E8A33D]/15 text-[#C97F1E]" };
}

export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);

  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  function loadData() {
    setLoading(true);
    setLoadError(null);

    Promise.all([getWalletBalance(), getMyWithdrawals()])
      .then(([balanceData, withdrawalsData]) => {
        setBalance(balanceData);
        setWithdrawals(withdrawalsData);
      })
      .catch((error: unknown) => {
        const apiError = error as ApiError;
        setLoadError(
          apiError.messages?.[0] ?? "Não foi possível carregar sua carteira"
        );
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitSuccess(false);

    const numericAmount = Number(amount);
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setFormError("Informe um valor válido");
      return;
    }
    if (!pixKey.trim()) {
      setFormError("Informe sua chave PIX");
      return;
    }

    setSubmitting(true);

    try {
      await requestWithdrawal({ amount: numericAmount, pixKey });
      setSubmitSuccess(true);
      setAmount("");
      setPixKey("");
      loadData();
    } catch (error) {
      const apiError = error as ApiError;
      setFormError(
        apiError.messages?.join(" ") ?? "Não foi possível solicitar o saque"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-6 py-10">
        <p className="text-sm text-[#586268]">Carregando sua carteira...</p>
      </div>
    );
  }

  if (loadError || !balance) {
    return (
      <div className="max-w-xl mx-auto px-6 py-10">
        <p className="text-sm text-red-600">
          {loadError ?? "Não foi possível carregar sua carteira"}
        </p>
      </div>
    );
  }

  const availableBalance = pickBalanceNumber(balance, BALANCE_KEYS);
  const pendingBalance = pickBalanceNumber(balance, [
    "pendingBalance",
    "pending",
    "blockedAmount",
  ]);

  return (
    <div className="max-w-xl mx-auto px-6 py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#12233D]">Carteira</h1>
        <p className="text-sm text-[#586268] mt-1">
          Acompanhe seu saldo e solicite saques via PIX.
        </p>
      </div>

      {/* Saldo */}
      <div className="bg-[#12233D] rounded-xl p-6 text-white">
        {availableBalance !== null ? (
          <>
            <p className="text-sm text-white/60">Saldo disponível</p>
            <p className="text-3xl font-bold mt-1">
              {formatCurrency(availableBalance)}
            </p>
          </>
        ) : (
          <p className="text-sm text-white/70">
            Não consegui identificar o campo de saldo na resposta da API.
            Confira o JSON abaixo com o time de backend.
          </p>
        )}
        {pendingBalance !== null && (
          <p className="text-xs text-white/60 mt-3">
            {formatCurrency(pendingBalance)} ainda em processamento
          </p>
        )}
        {availableBalance === null && (
          <pre className="text-xs text-white/70 bg-white/10 rounded-md p-3 mt-3 overflow-x-auto">
            {JSON.stringify(balance, null, 2)}
          </pre>
        )}
      </div>

      {/* Solicitar saque */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white border border-[#C7D1CB] rounded-xl p-6 flex flex-col gap-4"
      >
        <h2 className="text-sm font-semibold text-[#12233D]">
          Solicitar saque
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#12233D] mb-1.5">
              Valor (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full border border-[#C7D1CB] rounded-md px-3.5 py-2.5 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D]"
              placeholder="100.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#12233D] mb-1.5">
              Chave PIX
            </label>
            <input
              type="text"
              value={pixKey}
              onChange={(event) => setPixKey(event.target.value)}
              className="w-full border border-[#C7D1CB] rounded-md px-3.5 py-2.5 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D]"
              placeholder="CPF, e-mail, telefone ou chave aleatória"
            />
          </div>
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}
        {submitSuccess && (
          <p className="text-sm text-[#2F6E48]">Saque solicitado com sucesso.</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-[#12233D] border-none text-white px-6 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#1B3350] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed self-start"
        >
          {submitting ? "Enviando..." : "Solicitar saque"}
        </button>
      </form>

      {/* Histórico */}
      <div className="bg-white border border-[#C7D1CB] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-[#12233D] mb-4">
          Histórico de saques
        </h2>

        {withdrawals.length === 0 ? (
          <p className="text-sm text-[#586268]">
            Você ainda não solicitou nenhum saque.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {withdrawals.map((withdrawal, index) => {
              const status = withdrawalStatusLabel(withdrawal);
              return (
                <div
                  key={withdrawal.id ?? index}
                  className="flex items-center justify-between gap-3 pb-3 border-b border-[#F1F4F2] last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-[#12233D]">
                      {typeof withdrawal.amount === "number"
                        ? formatCurrency(withdrawal.amount)
                        : "—"}
                    </p>
                    {withdrawal.createdAt && (
                      <p className="text-xs text-[#586268]">
                        {formatDate(withdrawal.createdAt)}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}