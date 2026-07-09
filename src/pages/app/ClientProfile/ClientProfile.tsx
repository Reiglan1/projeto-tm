import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getClientPublicProfile } from "@/services/clients";
import { ApiError } from "@/services/apiError";
import { ResponseClientProfileJason } from "@/types/client";
import ReviewsList from "@/components/ReviewsList/ReviewsList";
import StarRating from "@/components/StarRating/StarRating";

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export default function ClientProfilePage() {
  const { clientId } = useParams<{ clientId: string }>();

  const [client, setClient] = useState<ResponseClientProfileJason | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    getClientPublicProfile(clientId)
      .then((data) => {
        if (!cancelled) setClient(data);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const apiError = error as ApiError;
        setLoadError(
          apiError.messages?.[0] ?? "Não foi possível carregar esse cliente"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-sm text-[#586268]">Carregando cliente...</p>
      </div>
    );
  }

  if (loadError || !client) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-sm text-red-600">
          {loadError ?? "Cliente não encontrado"}
        </p>
      </div>
    );
  }

  const hasReviews = client.reviewCount > 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="bg-white border border-[#C7D1CB] rounded-xl p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <span className="w-20 h-20 rounded-full bg-[#12233D] text-white flex items-center justify-center text-2xl font-semibold shrink-0">
            {getInitials(client.name)}
          </span>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-[#12233D]">{client.name}</h1>
            <p className="text-sm text-[#586268] mt-0.5">
              Na plataforma desde {formatDate(client.memberSince)}
            </p>

            {hasReviews && (
              <div className="flex items-center gap-1.5 mt-2.5">
                <StarRating value={Math.round(client.averageRating)} readOnly size="sm" />
                <span className="text-sm font-medium text-[#12233D]">
                  {client.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-[#586268]">
                  ({client.reviewCount})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Avaliações que esse cliente recebeu de outros profissionais */}
      <ReviewsList subjectId={client.id} role="client" />
    </div>
  );
}