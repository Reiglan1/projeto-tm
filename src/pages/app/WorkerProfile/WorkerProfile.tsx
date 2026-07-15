import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getWorkerById } from "@/services/workers";
import { ApiError } from "@/services/apiError";
import { ResponseWorkerDetailJason } from "@/types/worker";
import { maskPhone } from "@/utils/Masks";
import { useLayout } from "@/context/LayoutProvider";
import { buildOpenServiceOrderPath } from "@/constants/Constants";
import ReviewsList from "@/components/ReviewsList/ReviewsList";
import StarRating from "@/components/StarRating/StarRating";

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function getVerificationMeta(status?: string): {
  label: string;
  verified: boolean;
  pending: boolean;
} {
  const value = (status ?? "").toUpperCase();
  if (value === "APPROVED" || value === "VERIFIED") {
    return { label: "Identidade verificada", verified: true, pending: false };
  }
  if (value === "REJECTED" || value === "DENIED") {
    return { label: "Verificação recusada", verified: false, pending: false };
  }
  return { label: "Verificação pendente", verified: false, pending: true };
}

function formatMemberSince(value: string): string {
  try {
    return new Date(value).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export default function WorkerProfilePage() {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();
  const { user } = useLayout();

  const [worker, setWorker] = useState<ResponseWorkerDetailJason | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!workerId) return;

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    getWorkerById(workerId)
      .then((data) => {
        if (!cancelled) setWorker(data);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const apiError = error as ApiError;
        setLoadError(
          apiError.messages?.[0] ?? "Não foi possível carregar esse profissional"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [workerId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <p className="text-sm text-[#3A3A3A]">Carregando profissional...</p>
      </div>
    );
  }

  if (loadError || !worker) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <p className="text-sm text-red-600">
          {loadError ?? "Profissional não encontrado"}
        </p>
      </div>
    );
  }

  const verification = getVerificationMeta(worker.verificationStatus);
  const hasDescription = Boolean(worker.description?.trim());
  const hasReviews = worker.reviewCount > 0;

  return (
    <div className="max-w-[1080px] mx-auto px-6 sm:px-8 py-10 sm:py-14">

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">

        {/* Coluna lateral fixa */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
          <div className="bg-white border border-[#D9D6D0] rounded-xl p-6 text-center">
            <div className="relative inline-block">
              {worker.profilePhotoUrl ? (
                <img
                  src={worker.profilePhotoUrl}
                  alt={worker.name}
                  className={`w-24 h-24 rounded-full object-cover ring-2 ring-offset-2 ${verification.verified ? "ring-[#26A06D]" : "ring-[#D9D6D0]"
                    }`}
                />
              ) : (
                <span
                  className={`w-24 h-24 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-2xl font-bold ring-2 ring-offset-2 ${verification.verified ? "ring-[#26A06D]" : "ring-[#D9D6D0]"
                    }`}
                >
                  {getInitials(worker.name)}
                </span>
              )}
              {verification.verified && (
                <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#26A06D] border-2 border-white flex items-center justify-center">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
              )}
            </div>

            <h1
              className="text-2xl leading-none uppercase text-[#0A0A0A] mt-4"
              style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}
            >
              {worker.name}
            </h1>

            {worker.professions && worker.professions.length > 0 && (
              <p className="text-sm text-[#5C5C5C] mt-1.5">
                {worker.professions.map((p) => p.name).join(" · ")}
              </p>
            )}

            {hasReviews && (
              <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-[#0A0A0A] mt-3">
                <StarRating value={Math.round(worker.averageRating)} readOnly size="sm" />
                {worker.averageRating.toFixed(1)}
                <span className="text-[#8A8A8A] font-normal">({worker.reviewCount})</span>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <span
                className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${verification.verified
                  ? "bg-[#26A06D]/10 text-[#1F8A5B]"
                  : verification.pending
                    ? "bg-[#F5C518]/15 text-[#C99A00]"
                    : "bg-red-50 text-red-600"
                  }`}
              >
                {verification.label}
              </span>

              {worker.available24Hours && (
                <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide bg-[#F5F2EC] text-[#3A3A3A] px-2.5 py-1 rounded-full">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  24h
                </span>
              )}
            </div>

            {user?.role === "client" && (
              <button
                onClick={() => navigate(buildOpenServiceOrderPath(worker.id))}
                className="w-full mt-5 bg-[#0A0A0A] border-none text-white px-6 py-3 rounded text-sm font-bold cursor-pointer hover:bg-[#242424] transition-colors duration-150"
              >
                Solicitar serviço
              </button>
            )}

            <div className="flex flex-col gap-2.5 mt-5 pt-5 border-t border-[#F0EDE6] text-left">
              <div className="flex items-center gap-2.5 text-sm text-[#3A3A3A]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#8A8A8A]">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {maskPhone(worker.phone)}
              </div>
              <div className="flex items-center gap-2.5 text-sm text-[#3A3A3A]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#8A8A8A]">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                Membro desde {formatMemberSince(worker.createdAt)}
              </div>
            </div>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <div className="flex flex-col gap-6 min-w-0">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white border border-[#D9D6D0] rounded-xl px-4 py-3.5 sm:px-5 sm:py-4">
              <p className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase text-[#8A8A8A] mb-1 truncate">Avaliação</p>
              <p className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">
                {hasReviews ? worker.averageRating.toFixed(1) : "—"}
              </p>
            </div>
            <div className="bg-white border border-[#D9D6D0] rounded-xl px-4 py-3.5 sm:px-5 sm:py-4">
              <p className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase text-[#8A8A8A] mb-1 truncate">Avaliações</p>
              <p className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">{worker.reviewCount}</p>
            </div>
            <div className="bg-[#0A0A0A] rounded-xl px-4 py-3.5 sm:px-5 sm:py-4">
              <p className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase text-[#8A8A8A] mb-1 truncate">Disponibilidade</p>
              <p className="text-base sm:text-xl font-bold text-[#F5C518] truncate">
                {worker.available24Hours ? "24 horas" : "Sob consulta"}
              </p>
            </div>
          </div>

          {/* Sobre */}
          {(hasDescription || (worker.professions && worker.professions.length > 0)) && (
            <div className="bg-white border border-[#D9D6D0] rounded-xl p-6">
              <h2 className="text-sm font-bold text-[#0A0A0A] mb-3">Sobre</h2>

              {hasDescription ? (
                <p className="text-sm text-[#3A3A3A] leading-relaxed">{worker.description}</p>
              ) : (
                <p className="text-sm text-[#8A8A8A]">
                  Esse profissional ainda não escreveu uma descrição.
                </p>
              )}

              {worker.professions && worker.professions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#F0EDE6]">
                  {worker.professions.map((profession) => (
                    <span
                      key={profession.categoryId}
                      className="text-xs font-medium text-[#3A3A3A] bg-[#F5F2EC] px-3 py-1.5 rounded-full"
                    >
                      {profession.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Avaliações */}
          <ReviewsList subjectId={worker.id} role="worker" />
        </div>
      </div>
    </div>
  );
}