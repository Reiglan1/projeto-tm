import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkers } from "@/services/workers";
import { ResponseWorkerDetailJason } from "@/types/worker";
import { ApiError } from "@/services/apiError";
import { maskPhone } from "@/utils/Masks";
import { useLayout } from "@/context/LayoutProvider";
import { buildOpenServiceOrderPath } from "@/constants/Constants";
import WorkersSearchBar from "@/pages/app/Home/sections/WorkersSearchBar";

const PAGE_SIZE = 9;

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

interface StatusMeta {
  label: string;
  dotClass: string;
  textClass: string;
}

function getStatusMeta(status?: string): StatusMeta {
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

interface VerificationMeta {
  label: string;
  verified: boolean;
  pending: boolean;
}

function getVerificationMeta(status?: string): VerificationMeta {
  const value = (status ?? "").toUpperCase();
  if (value === "APPROVED" || value === "VERIFIED") {
    return { label: "Verificado", verified: true, pending: false };
  }
  if (value === "REJECTED" || value === "DENIED") {
    return { label: "Verificação recusada", verified: false, pending: false };
  }
  return { label: "Verificação pendente", verified: false, pending: true };
}

function WorkerCard({
  worker,
  showRequestButton,
}: {
  worker: ResponseWorkerDetailJason;
  showRequestButton: boolean;
}) {
  const navigate = useNavigate();
  const status = getStatusMeta(worker.status);
  const verification = getVerificationMeta(worker.verificationStatus);
  const hasReviews = worker.reviewCount > 0;
  const hasDescription = Boolean(worker.description?.trim());

  return (
    <div className="group bg-white border border-[#C7D1CB] rounded-xl p-5 flex flex-col gap-4 transition-all duration-200 hover:border-[#12233D]/30 hover:shadow-[0_12px_24px_-16px_rgba(18,35,61,0.35)] hover:-translate-y-0.5">
      <div className="flex items-start gap-3.5">
        <div className="relative shrink-0">
          {worker.profilePhotoUrl ? (
            <img
              src={worker.profilePhotoUrl}
              alt={worker.name}
              className={`w-14 h-14 rounded-full object-cover ring-2 ring-offset-2 ${
                verification.verified ? "ring-[#3F8F5F]" : "ring-[#C7D1CB]"
              }`}
            />
          ) : (
            <span
              className={`w-14 h-14 rounded-full bg-[#12233D] text-white flex items-center justify-center text-base font-semibold ring-2 ring-offset-2 ${
                verification.verified ? "ring-[#3F8F5F]" : "ring-[#C7D1CB]"
              }`}
            >
              {getInitials(worker.name)}
            </span>
          )}
          {verification.verified && (
            <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#3F8F5F] border-2 border-white flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
          )}
        </div>

        <div className="min-w-0 pt-0.5">
          <p className="text-[15px] font-semibold text-[#12233D] truncate">
            {worker.name}
          </p>
          {worker.professions && worker.professions.length > 0 && (
            <p className="text-xs text-[#586268] truncate">
              {worker.professions.map((p) => p.name).join(", ")}
            </p>
          )}
          <p
            className={`text-xs font-medium mt-0.5 ${
              verification.verified
                ? "text-[#2F6E48]"
                : verification.pending
                ? "text-[#C97F1E]"
                : "text-[#B4402A]"
            }`}
          >
            {verification.label}
          </p>
        </div>
      </div>

      {hasDescription && (
        <p className="text-sm text-[#586268] line-clamp-2">{worker.description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-[#586268]">
        <span className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          {maskPhone(worker.phone)}
        </span>

        {hasReviews && (
          <span className="flex items-center gap-1 text-[#C97F1E] font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {worker.averageRating.toFixed(1)}
            <span className="text-[#586268] font-normal">({worker.reviewCount})</span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3.5 border-t border-[#F1F4F2]">
        {worker.available24Hours ? (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#C97F1E]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6v6l4 2" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            Disponível 24h
          </span>
        ) : (
          <span />
        )}

        <span className="flex items-center gap-1.5 text-xs font-medium text-[#586268]">
          <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
          <span className={status.textClass}>{status.label}</span>
        </span>
      </div>

      {showRequestButton && (
        <button
          onClick={() => navigate(buildOpenServiceOrderPath(worker.id))}
          className="w-full bg-[#12233D] border-none text-white px-4 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#1B3350] transition-colors duration-150"
        >
          Solicitar serviço
        </button>
      )}
    </div>
  );
}

export default function WorkersList() {
  const { user } = useLayout();
  const [workers, setWorkers] = useState<ResponseWorkerDetailJason[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getWorkers({ page, pageSize: PAGE_SIZE, search })
      .then((response) => {
        if (cancelled) return;
        setWorkers(response.items ?? []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.totalCount || 0);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const apiError = err as ApiError;
        setError(
          apiError.messages?.[0] ?? "Não foi possível carregar os profissionais"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, search]);

  return (
    <section className="max-w-[1180px] mx-auto px-6 sm:px-10 py-10">
      <WorkersSearchBar onSearch={handleSearch} />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#12233D]">
          Profissionais disponíveis
        </h2>
        {!loading && !error && (
          <p className="text-sm text-[#586268]">{totalCount} encontrados</p>
        )}
      </div>

      {loading && (
        <p className="text-sm text-[#586268]">Carregando profissionais...</p>
      )}

      {!loading && error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && workers.length === 0 && (
        <p className="text-sm text-[#586268]">
          {search
            ? `Nenhum profissional encontrado para "${search}".`
            : "Nenhum profissional encontrado."}
        </p>
      )}

      {!loading && !error && workers.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                showRequestButton={user?.role === "client"}
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
    </section>
  );
}