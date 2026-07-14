import { useEffect, useState } from "react";
import { getReviewsByWorker, getReviewsByClient } from "@/services/reviews";
import { ResponseReviewJason } from "@/types/review";
import { ApiError } from "@/services/apiError";
import StarRating from "@/components/StarRating/StarRating";

const PAGE_SIZE = 5;

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

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

interface ReviewsListProps {
  subjectId: string;
  role: "worker" | "client";
}

export default function ReviewsList({ subjectId, role }: ReviewsListProps) {
  const [reviews, setReviews] = useState<ResponseReviewJason[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subjectId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const request =
      role === "worker"
        ? getReviewsByWorker(subjectId, { page, pageSize: PAGE_SIZE })
        : getReviewsByClient(subjectId, { page, pageSize: PAGE_SIZE });

    request
      .then((response) => {
        if (cancelled) return;
        setReviews(response.items ?? []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.totalCount || 0);
        setAverageRating(response.averageRating || 0);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const apiError = err as ApiError;
        setError(
          apiError.messages?.[0] ?? "Não foi possível carregar as avaliações"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [subjectId, role, page]);

  return (
    <div className="bg-white border border-[#D9D6D0] rounded-xl p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-sm font-semibold text-[#0A0A0A]">Avaliações recebidas</h2>
        {!loading && !error && totalCount > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#3A3A3A]">
            <StarRating value={Math.round(averageRating)} readOnly size="sm" />
            {averageRating.toFixed(1)} ({totalCount})
          </span>
        )}
      </div>

      {loading && <p className="text-sm text-[#3A3A3A]">Carregando avaliações...</p>}

      {!loading && error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && reviews.length === 0 && (
        <p className="text-sm text-[#3A3A3A]">
          {role === "worker"
            ? "Você ainda não recebeu nenhuma avaliação."
            : "Você ainda não recebeu nenhuma avaliação de profissionais."}
        </p>
      )}

      {!loading && !error && reviews.length > 0 && (
        <>
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex gap-3 pb-4 border-b border-[#F5F2EC] last:border-b-0 last:pb-0"
              >
                <div className="w-9 h-9 rounded-full bg-[#F5F2EC] text-[#0A0A0A] text-xs font-semibold flex items-center justify-center shrink-0">
                  {initials(review.reviewerName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-medium text-[#0A0A0A]">
                      {review.reviewerName}
                    </p>
                    <p className="text-xs text-[#3A3A3A]">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <StarRating value={review.rating} readOnly size="sm" />
                  {review.comment && (
                    <p className="text-sm text-[#3A3A3A] mt-1.5">{review.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
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