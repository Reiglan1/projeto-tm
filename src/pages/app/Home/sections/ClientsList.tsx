import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getClients } from "@/services/clients";
import { ResponseClientDetailJason } from "@/types/client";
import { ApiError } from "@/services/apiError";
import { maskPhone } from "@/utils/Masks";
import { buildClientProfilePath } from "@/constants/Constants";

const PAGE_SIZE = 9;

function getInitials(name?: string): string {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
}

function getStatusMeta(status?: string): {
    label: string;
    dotClass: string;
    textClass: string;
} {
    switch ((status ?? "").toUpperCase()) {
        case "ACTIVE":
            return { label: "Ativo", dotClass: "bg-[#3F8F5F]", textClass: "text-[#2F6E48]" };
        case "INACTIVE":
        case "SUSPENDED":
        case "BLOCKED":
            return { label: "Inativo", dotClass: "bg-[#B4402A]", textClass: "text-[#B4402A]" };
        default:
            return { label: status ?? "—", dotClass: "bg-[#586268]", textClass: "text-[#586268]" };
    }
}

function ClientCard({ client }: { client: ResponseClientDetailJason }) {
    const navigate = useNavigate();
    const status = getStatusMeta(client.status);

    return (
        <div
            onClick={() => navigate(buildClientProfilePath(client.id))}
            role="button"
            tabIndex={0}
            className="bg-white border border-[#C7D1CB] rounded-xl p-5 flex flex-col gap-4 h-full cursor-pointer transition-all duration-200 hover:border-[#12233D]/30 hover:shadow-[0_12px_24px_-16px_rgba(18,35,61,0.35)] hover:-translate-y-0.5"
        >
            <div className="flex items-center gap-3.5">
                <span className="w-14 h-14 rounded-full bg-[#12233D] text-white flex items-center justify-center text-base font-semibold shrink-0">
                    {getInitials(client.name)}
                </span>
                <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-[#12233D] truncate">
                        {client.name}
                    </p>
                    <p
                        className={`text-xs font-medium mt-0.5 ${client.emailVerified ? "text-[#2F6E48]" : "text-[#C97F1E]"
                            }`}
                    >
                        {client.emailVerified ? "E-mail verificado" : "E-mail não verificado"}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#586268]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {maskPhone(client.phone)}
            </div>

            <div className="flex items-center justify-end pt-3.5 border-t border-[#F1F4F2] mt-auto">
                <span className="flex items-center gap-1.5 text-xs font-medium text-[#586268]">
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                    <span className={status.textClass}>{status.label}</span>
                </span>
            </div>
        </div>
    );
}

export default function ClientsList() {
    const [clients, setClients] = useState<ResponseClientDetailJason[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        getClients({ page, pageSize: PAGE_SIZE })
            .then((response) => {
                if (cancelled) return;
                setClients(response.items ?? []);
                setTotalPages(response.totalPages || 1);
                setTotalCount(response.totalCount || 0);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                const apiError = err as ApiError;
                setError(
                    apiError.messages?.[0] ?? "Não foi possível carregar os clientes"
                );
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [page]);

    return (
        <section className="max-w-[1180px] mx-auto px-6 sm:px-10 py-10">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#12233D]">Clientes na plataforma</h2>
                {!loading && !error && (
                    <p className="text-sm text-[#586268]">{totalCount} encontrados</p>
                )}
            </div>

            {loading && <p className="text-sm text-[#586268]">Carregando clientes...</p>}

            {!loading && error && <p className="text-sm text-red-600">{error}</p>}

            {!loading && !error && clients.length === 0 && (
                <p className="text-sm text-[#586268]">Nenhum cliente encontrado.</p>
            )}

            {!loading && !error && clients.length > 0 && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                        {clients.map((client) => (
                            <ClientCard key={client.id} client={client} />
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
        </section>
    );
}