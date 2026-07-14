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
            <div className="max-w-xl mx-auto px-6 py-10">
                <p className="text-sm text-[#3A3A3A]">Carregando sua carteira...</p>
            </div>
        );
    }

    if (loadError || !wallet) {
        return (
            <div className="max-w-xl mx-auto px-6 py-10">
                <p className="text-sm text-red-600">
                    {loadError ?? "Não foi possível carregar sua carteira"}
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto px-6 py-10 flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-[#0A0A0A] uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>Minha carteira</h1>
                <p className="text-sm text-[#3A3A3A] mt-1">
                    Deposite saldo para pagar chamados mais rápido, ou saque o que
                    sobrar.
                </p>
            </div>

            {/* Saldo */}
            <div className="bg-[#0A0A0A] rounded-xl p-6 text-white">
                <p className="text-sm text-white/60">Saldo disponível</p>
                <p className="text-3xl font-bold mt-1">
                    {formatCurrency(wallet.balance)}
                </p>
            </div>

            {/* Depositar */}
            <div className="bg-white border border-[#D9D6D0] rounded-xl p-6 flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-[#0A0A0A] uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>
                    Depositar via Pix
                </h2>

                {!deposit ? (
                    <form onSubmit={handleDeposit} noValidate className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
                                Valor (R$)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={depositAmount}
                                onChange={(event) => setDepositAmount(event.target.value)}
                                className="w-full border border-[#D9D6D0] rounded-md px-3.5 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                                placeholder="100.00"
                            />
                        </div>

                        {depositError && <p className="text-sm text-red-600">{depositError}</p>}

                        <button
                            type="submit"
                            disabled={depositing}
                            className="bg-[#0A0A0A] border-none text-white px-6 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#242424] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed self-start"
                        >
                            {depositing ? "Gerando PIX..." : "Gerar QR code Pix"}
                        </button>
                    </form>
                ) : (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-[#3A3A3A]">
                            Escaneie o QR code ou copie o código para depositar{" "}
                            {formatCurrency(deposit.amount)}.
                        </p>

                        {deposit.qrCode && (
                            <div className="flex justify-center p-4 bg-white">
                                <QRCodeSVG value={deposit.qrCode} size={192} />
                            </div>
                        )}

                        {deposit.qrCode && (
                            <>
                                <textarea
                                    readOnly
                                    value={deposit.qrCode}
                                    rows={3}
                                    className="w-full border border-[#D9D6D0] rounded-md px-3.5 py-2.5 text-xs text-[#3A3A3A] resize-none"
                                    onClick={(event) => event.currentTarget.select()}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleCopyPixCode(deposit.qrCode!)}
                                    className="w-full bg-transparent border border-[#0A0A0A] text-[#0A0A0A] px-4 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#0A0A0A] hover:text-white transition-colors duration-150"
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
                            className="text-sm text-[#3A3A3A] underline bg-transparent border-none cursor-pointer"
                        >
                            Já paguei / fazer novo depósito
                        </button>
                    </div>
                )}
            </div>

            {/* Sacar */}
            <div className="bg-white border border-[#D9D6D0] rounded-xl p-6 flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-[#0A0A0A] uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>
                    Sacar saldo
                </h2>
                <p className="text-xs text-[#3A3A3A] -mt-2">
                    O valor é enviado para a chave Pix cadastrada no seu perfil.
                </p>

                <form onSubmit={handleWithdraw} noValidate className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
                            Valor (R$)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={withdrawAmount}
                            onChange={(event) => setWithdrawAmount(event.target.value)}
                            className="w-full border border-[#D9D6D0] rounded-md px-3.5 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
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
                        className="bg-[#0A0A0A] border-none text-white px-6 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#242424] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed self-start"
                    >
                        {withdrawing ? "Enviando..." : "Solicitar saque"}
                    </button>
                </form>
            </div>

            {/* Histórico de saques */}
            <div className="bg-white border border-[#D9D6D0] rounded-xl p-6">
                <h2 className="text-sm font-semibold text-[#0A0A0A] mb-4 uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>
                    Histórico de saques
                </h2>

                {withdrawals.length === 0 ? (
                    <p className="text-sm text-[#3A3A3A]">
                        Você ainda não solicitou nenhum saque.
                    </p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {withdrawals.map((withdrawal) => {
                            const status = withdrawalStatusLabel(withdrawal);
                            return (
                                <div
                                    key={withdrawal.id}
                                    className="flex items-center justify-between gap-3 pb-3 border-b border-[#F5F2EC] last:border-b-0 last:pb-0"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-[#0A0A0A]">
                                            {formatCurrency(withdrawal.amount)}
                                        </p>
                                        <p className="text-xs text-[#3A3A3A]">
                                            {formatDate(withdrawal.createdAt)}
                                        </p>
                                        {withdrawal.lastError && (
                                            <p className="text-xs text-red-600 mt-0.5">
                                                {withdrawal.lastError}
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

            {/* Extrato */}
            <div className="bg-white border border-[#D9D6D0] rounded-xl p-6">
                <h2 className="text-sm font-semibold text-[#0A0A0A] mb-4 uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>Extrato</h2>

                {!wallet.transactions || wallet.transactions.length === 0 ? (
                    <p className="text-sm text-[#3A3A3A]">
                        Nenhuma movimentação na sua carteira ainda.
                    </p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {wallet.transactions.map((transaction, index) => {
                            const tone = transactionTone(transaction.type);
                            const toneClass =
                                tone === "credit"
                                    ? "text-[#1F8A5B]"
                                    : tone === "debit"
                                        ? "text-red-600"
                                        : "text-[#0A0A0A]";
                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between gap-3 pb-3 border-b border-[#F5F2EC] last:border-b-0 last:pb-0"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-[#0A0A0A]">
                                            {transaction.description || transaction.type || "Movimentação"}
                                        </p>
                                        <p className="text-xs text-[#3A3A3A]">
                                            {formatDate(transaction.createdAt)}
                                        </p>
                                    </div>
                                    <p className={`text-sm font-semibold ${toneClass}`}>
                                        {formatCurrency(transaction.amount)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div >
    );
}