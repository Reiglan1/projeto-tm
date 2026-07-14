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
      <div className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-sm text-[#3A3A3A]">Carregando profissional...</p>
      </div>
    );
  }

  if (loadError || !worker) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
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
    <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="bg-white border border-[#D9D6D0] rounded-xl p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="relative shrink-0">
            {worker.profilePhotoUrl ? (
              <img
                src={worker.profilePhotoUrl}
                alt={worker.name}
                className={`w-20 h-20 rounded-full object-cover ring-2 ring-offset-2 ${
                  verification.verified ? "ring-[#26A06D]" : "ring-[#D9D6D0]"
                }`}
              />
            ) : (
              <span
                className={`w-20 h-20 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-2xl font-semibold ring-2 ring-offset-2 ${
                  verification.verified ? "ring-[#26A06D]" : "ring-[#D9D6D0]"
                }`}
              >
                {getInitials(worker.name)}
              </span>
            )}
            {verification.verified && (
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#26A06D] border-2 border-white flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-[#0A0A0A] uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>{worker.name}</h1>

            {worker.professions && worker.professions.length > 0 && (
              <p className="text-sm text-[#3A3A3A] mt-0.5">
                {worker.professions.map((p) => p.name).join(", ")}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span
                className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                  verification.verified
                    ? "bg-[#26A06D]/10 text-[#1F8A5B]"
                    : verification.pending
                      ? "bg-[#F5C518]/15 text-[#C99A00]"
                      : "bg-red-50 text-red-600"
                }`}
              >
                {verification.label}
              </span>

              {worker.available24Hours && (
                <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide bg-[#F5C518]/15 text-[#3A3A3A] px-2.5 py-1 rounded-full">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  Disponível 24h
                </span>
              )}

              {hasReviews && (
                <span className="flex items-center gap-1.5 text-sm font-medium text-[#0A0A0A]">
                  <StarRating value={Math.round(worker.averageRating)} readOnly size="sm" />
                  {worker.averageRating.toFixed(1)}
                  <span className="text-[#3A3A3A] font-normal">
                    ({worker.reviewCount})
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {hasDescription && (
          <p className="text-sm text-[#3A3A3A] mt-5 pt-5 border-t border-[#F5F2EC]">
            {worker.description}
          </p>
        )}

        <div className="flex items-center gap-2 mt-4 text-sm text-[#3A3A3A]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          {maskPhone(worker.phone)}
        </div>

        {user?.role === "client" && (
          <button
            onClick={() => navigate(buildOpenServiceOrderPath(worker.id))}
            className="w-full mt-5 bg-[#0A0A0A] border-none text-white px-6 py-3 rounded-md text-[14px] font-semibold cursor-pointer hover:bg-[#242424] transition-colors duration-150"
          >
            Solicitar serviço
          </button>
        )}
      </div>

      {/* Avaliações */}
      <ReviewsList subjectId={worker.id} role="worker" />
    </div>
  );
}