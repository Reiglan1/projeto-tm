import { FormEvent, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
    getClientWallet,
    createDeposit,
    requestClientWithdrawal,
    getClientWithdrawals,
} from "@/services/clientWallet";
import { ApiError } from "@/services/apiError";
import {
    ResponseClientWalletJason,
    ResponseClientWithdrawalJason,
    ResponseWalletDepositJason,
} from "@/types/clientWallet";
import { formatCurrency } from "@/utils/Wallet";

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

function withdrawalStatusLabel(record: ResponseClientWithdrawalJason): {
    label: string;
    className: string;
} {
    const raw = (record.status ?? "").toUpperCase();

    if (raw.includes("SUCCESS") || raw === "APPROVED" || raw === "COMPLETED") {
        return { label: "Concluído", className: "bg-[#26A06D]/10 text-[#1F8A5B]" };
    }
    if (raw.includes("FAIL") || raw === "REJECTED") {
        return { label: "Falhou", className: "bg-red-50 text-red-600" };
    }
    return { label: raw || "Em processamento", className: "bg-[#F5C518]/15 text-[#C99A00]" };
}

// A API não documenta os valores possíveis de "type" nas transações, então
// só usamos palavras-chave pra decidir se mostramos como entrada (verde) ou
// saída (vermelho) de saldo; sem match, mostramos neutro.
function transactionTone(type: string | null): "credit" | "debit" | "neutral" {
    const raw = (type ?? "").toUpperCase();
    if (raw.includes("DEPOSIT") || raw.includes("REFUND")) return "credit";
    if (raw.includes("PAYMENT") || raw.includes("WITHDRAW")) return "debit";
    return "neutral";
}

interface ActivityItem {
    id: string;
    date: string;
    label: string;
    amount: number;
    tone: "credit" | "debit" | "neutral";
    badge?: { label: string; className: string };
    note?: string | null;
}

export default function ClientWalletPage() {
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [wallet, setWallet] = useState<ResponseClientWalletJason | null>(null);
    const [withdrawals, setWithdrawals] = useState<ResponseClientWithdrawalJason[]>([]);

    const [depositAmount, setDepositAmount] = useState("");
    const [depositError, setDepositError] = useState<string | null>(null);
    const [depositing, setDepositing] = useState(false);
    const [deposit, setDeposit] = useState<ResponseWalletDepositJason | null>(null);
    const [copied, setCopied] = useState(false);

    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawError, setWithdrawError] = useState<string | null>(null);
    const [withdrawing, setWithdrawing] = useState(false);
    const [withdrawSuccess, setWithdrawSuccess] = useState(false);

    function loadData() {
        setLoading(true);
        setLoadError(null);

        Promise.all([getClientWallet(), getClientWithdrawals()])
            .then(([walletData, withdrawalsData]) => {
                setWallet(walletData);
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

    async function handleCopyPixCode(code: string) {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Alguns navegadores/contextos bloqueiam a Clipboard API (ex: sem HTTPS).
        }
    }

    async function handleDeposit(event: FormEvent) {
        event.preventDefault();
        setDepositError(null);

        const numericAmount = Number(depositAmount);
        if (!depositAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
            setDepositError("Informe um valor válido");
            return;
        }

        setDepositing(true);

        try {
            const result = await createDeposit({ amount: numericAmount });
            setDeposit(result);
        } catch (error) {
            const apiError = error as ApiError;
            setDepositError(
                apiError.messages?.join(" ") ?? "Não foi possível gerar o depósito"
            );
        } finally {
            setDepositing(false);
        }
    }

    async function handleWithdraw(event: FormEvent) {
        event.preventDefault();
        setWithdrawError(null);
        setWithdrawSuccess(false);

        const numericAmount = Number(withdrawAmount);
        if (!withdrawAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
            setWithdrawError("Informe um valor válido");
            return;
        }

        setWithdrawing(true);

        try {
            await requestClientWithdrawal({ amount: numericAmount });
            setWithdrawSuccess(true);
            setWithdrawAmount("");
            loadData();
        } catch (error) {
            const apiError = error as ApiError;
            setWithdrawError(
                apiError.messages?.join(" ") ?? "Não foi possível solicitar o saque"
            );
        } finally {
            setWithdrawing(false);
        }
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                <p className="text-sm text-[#3A3A3A]">Carregando sua carteira...</p>
            </div>
        );
    }

    if (loadError || !wallet) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                <p className="text-sm text-red-600">
                    {loadError ?? "Não foi possível carregar sua carteira"}
                </p>
            </div>
        );
    }

    const transactions = wallet.transactions ?? [];

    const activity: ActivityItem[] = [
        ...transactions.map((transaction, index) => ({
            id: `tx-${index}`,
            date: transaction.createdAt,
            label: transaction.description || transaction.type || "Movimentação",
            amount: transaction.amount,
            tone: transactionTone(transaction.type),
        })),
        ...withdrawals.map((withdrawal) => ({
            id: withdrawal.id,
            date: withdrawal.createdAt,
            label: "Saque solicitado",
            amount: -Math.abs(withdrawal.amount),
            tone: "debit" as const,
            badge: withdrawalStatusLabel(withdrawal),
            note: withdrawal.lastError,
        })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const pendingWithdrawals = withdrawals.filter((w) => {
        const raw = (w.status ?? "").toUpperCase();
        return !raw.includes("SUCCESS") && raw !== "APPROVED" && raw !== "COMPLETED" && !raw.includes("FAIL") && raw !== "REJECTED";
    }).length;

    return (
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-10 sm:py-14">
            <div className="mb-9">
                <h1 className="text-3xl sm:text-[42px] leading-none text-[#0A0A0A] uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>Minha carteira</h1>
                <p className="text-[15px] text-[#5C5C5C] mt-3">
                    Deposite saldo para pagar chamados mais rápido, ou saque o que sobrar.
                </p>
            </div>

            {/* Saldo + stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <div className="col-span-2 bg-[#0A0A0A] rounded-xl px-5 py-4 sm:px-6 sm:py-5 flex flex-col justify-center">
                    <p className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase text-[#8A8A8A] mb-1">Saldo disponível</p>
                    <p className="font-mono text-2xl sm:text-3xl font-bold text-[#F5C518] truncate">
                        {formatCurrency(wallet.balance)}
                    </p>
                </div>
                <div className="bg-white border border-[#D9D6D0] rounded-xl px-4 py-3.5 sm:px-5 sm:py-4">
                    <p className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase text-[#8A8A8A] mb-1 truncate">Movimentações</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">{activity.length}</p>
                </div>
                <div className="bg-white border border-[#D9D6D0] rounded-xl px-4 py-3.5 sm:px-5 sm:py-4">
                    <p className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase text-[#8A8A8A] mb-1 truncate">Saques pendentes</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#C99A00]">{pendingWithdrawals}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">

                {/* Depositar */}
                <div className="bg-white border border-[#D9D6D0] rounded-xl p-6 flex flex-col gap-4 h-full">
                    <div>
                        <h2 className="text-sm font-bold text-[#0A0A0A]">
                            Depositar via Pix
                        </h2>
                        <p className="text-xs text-[#5C5C5C] mt-1">
                            Faça o deposito para movimentar.
                        </p>
                    </div>

                    {!deposit ? (
                        <form onSubmit={handleDeposit} noValidate className="flex flex-col gap-4 flex-1">
                            <div>
                                <label className="block text-sm font-bold text-[#0A0A0A] mb-2">
                                    Valor (R$)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={depositAmount}
                                    onChange={(event) => setDepositAmount(event.target.value)}
                                    className="w-full border border-[#D9D6D0] rounded px-4 py-3 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                                    placeholder="100.00"
                                />
                            </div>

                            {depositError && <p className="text-sm text-red-600">{depositError}</p>}

                            <button
                                type="submit"
                                disabled={depositing}
                                className="mt-auto bg-[#0A0A0A] border-none text-white px-6 py-3 rounded text-sm font-bold cursor-pointer hover:bg-[#242424] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed self-start"
                            >
                                {depositing ? "Gerando PIX..." : "Gerar QR code Pix"}
                            </button>
                        </form>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <p className="text-sm text-[#3A3A3A]">
                                Escaneie o QR code ou copie o código para depositar{" "}
                                <strong className="text-[#0A0A0A]">{formatCurrency(deposit.amount)}</strong>.
                            </p>

                            {deposit.qrCode && (
                                <div className="flex justify-center p-4 bg-white border border-[#F0EDE6] rounded-lg">
                                    <QRCodeSVG value={deposit.qrCode} size={176} />
                                </div>
                            )}

                            {deposit.qrCode && (
                                <>
                                    <textarea
                                        readOnly
                                        value={deposit.qrCode}
                                        rows={3}
                                        className="w-full border border-[#D9D6D0] rounded px-3.5 py-2.5 text-xs text-[#5C5C5C] resize-none font-mono"
                                        onClick={(event) => event.currentTarget.select()}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleCopyPixCode(deposit.qrCode!)}
                                        className="w-full bg-transparent border border-[#0A0A0A] text-[#0A0A0A] px-4 py-2.5 rounded text-[13px] font-bold cursor-pointer hover:bg-[#0A0A0A] hover:text-white transition-colors duration-150"
                                    >
                                        {copied ? "Código copiado!" : "Copiar código PIX"}
                                    </button>
                                </>
                            )}

                            {deposit.ticketUrl && (
                                <a href={deposit.ticketUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-[#3A3A3A] font-medium underline text-center"
                                >
                                    Abrir página de pagamento
                                </a>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    setDeposit(null);
                                    setDepositAmount("");
                                    loadData();
                                }}
                                className="text-xs text-[#5C5C5C] underline bg-transparent border-none cursor-pointer"
                            >
                                Já paguei / fazer novo depósito
                            </button>
                        </div>
                    )}
                </div>

                {/* Sacar */}
                <div className="bg-white border border-[#D9D6D0] rounded-xl p-6 flex flex-col gap-4 h-full">
                    <div>
                        <h2 className="text-sm font-bold text-[#0A0A0A]">
                            Sacar saldo
                        </h2>
                        <p className="text-xs text-[#5C5C5C] mt-1">
                            Enviado para a chave Pix cadastrada no seu perfil.
                        </p>
                    </div>

                    <form onSubmit={handleWithdraw} noValidate className="flex flex-col gap-4 flex-1">
                        <div>
                            <label className="block text-sm font-bold text-[#0A0A0A] mb-2">
                                Valor (R$)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={withdrawAmount}
                                onChange={(event) => setWithdrawAmount(event.target.value)}
                                className="w-full border border-[#D9D6D0] rounded px-4 py-3 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                                placeholder="100.00"
                            />
                        </div>

                        {withdrawError && <p className="text-sm text-red-600">{withdrawError}</p>}
                        {withdrawSuccess && (
                            <p className="text-sm text-[#1F8A5B]">Saque solicitado com sucesso.</p>
                        )}

                        <button
                            type="submit"
                            disabled={withdrawing}
                            className="mt-auto bg-[#0A0A0A] border-none text-white px-6 py-3 rounded text-sm font-bold cursor-pointer hover:bg-[#242424] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed self-start"
                        >
                            {withdrawing ? "Enviando..." : "Solicitar saque"}
                        </button>
                    </form>
                </div>

                {/* Atividade */}
                <div className="bg-white border border-[#D9D6D0] rounded-xl p-6 flex flex-col h-full sm:col-span-2">
                    <h2 className="text-sm font-bold text-[#0A0A0A] mb-1">Atividade</h2>
                    <p className="text-xs text-[#5C5C5C] mb-4">
                        Depósitos, pagamentos e saques da sua carteira.
                    </p>

                    {activity.length === 0 ? (
                        <p className="text-sm text-[#8A8A8A] bg-[#FAF7F1] border border-dashed border-[#D9D6D0] rounded-lg px-4 py-6 text-center flex-1 flex items-center justify-center">
                            Nenhuma movimentação ainda.
                        </p>
                    ) : (
                        <div className="flex flex-col flex-1 overflow-y-auto max-h-[420px] -mx-1 px-1">
                            {activity.map((item) => {
                                const toneClass =
                                    item.tone === "credit"
                                        ? "text-[#1F8A5B]"
                                        : item.tone === "debit"
                                            ? "text-red-600"
                                            : "text-[#0A0A0A]";
                                const sign = item.amount > 0 ? "+" : "";
                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-start justify-between gap-3 py-3 border-b border-[#F0EDE6] last:border-b-0"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-[#0A0A0A] truncate">
                                                {item.label}
                                            </p>
                                            <p className="text-xs text-[#8A8A8A] mt-0.5">
                                                {formatDate(item.date)}
                                            </p>
                                            {item.badge && (
                                                <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full mt-1.5 ${item.badge.className}`}>
                                                    {item.badge.label}
                                                </span>
                                            )}
                                            {item.note && (
                                                <p className="text-xs text-red-600 mt-1">{item.note}</p>
                                            )}
                                        </div>
                                        <p className={`font-mono text-sm font-semibold shrink-0 ${toneClass}`}>
                                            {sign}{formatCurrency(Math.abs(item.amount))}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <p className="text-xs text-[#8A8A8A] leading-relaxed px-1 mt-6">
                Depósitos via Pix caem na sua carteira em poucos segundos. Saques podem levar até 1 dia útil para serem processados.
            </p>
        </div>
    );
}