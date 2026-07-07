import { useEffect, useState } from "react";
import { getReviewsByWorker } from "@/services/reviews";
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

export default function ReviewsList({ workerId }: { workerId: string }) {
  const [reviews, setReviews] = useState<ResponseReviewJason[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workerId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getReviewsByWorker(workerId, { page, pageSize: PAGE_SIZE })
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
  }, [workerId, page]);

  return (
    <div className="bg-white border border-[#C7D1CB] rounded-xl p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-sm font-semibold text-[#12233D]">Avaliações recebidas</h2>
        {!loading && !error && totalCount > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#586268]">
            <StarRating value={Math.round(averageRating)} readOnly size="sm" />
            {averageRating.toFixed(1)} ({totalCount})
          </span>
        )}
      </div>

      {loading && <p className="text-sm text-[#586268]">Carregando avaliações...</p>}

      {!loading && error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && reviews.length === 0 && (
        <p className="text-sm text-[#586268]">
          Você ainda não recebeu nenhuma avaliação.
        </p>
      )}

      {!loading && !error && reviews.length > 0 && (
        <>
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex gap-3 pb-4 border-b border-[#F1F4F2] last:border-b-0 last:pb-0"
              >
                <div className="w-9 h-9 rounded-full bg-[#F1F4F2] text-[#12233D] text-xs font-semibold flex items-center justify-center shrink-0">
                  {initials(review.reviewerName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-medium text-[#12233D]">
                      {review.reviewerName}
                    </p>
                    <p className="text-xs text-[#586268]">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <StarRating value={review.rating} readOnly size="sm" />
                  {review.comment && (
                    <p className="text-sm text-[#586268] mt-1.5">{review.comment}</p>
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