import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getClientProfile } from "@/services/profile";
import { ApiError } from "@/services/apiError";
import { ResponseClientDetailJason } from "@/types/client";
import { maskPhone } from "@/utils/Masks";
import ReviewsList from "@/components/ReviewsList/ReviewsList";

function getInitials(name?: string): string {
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

function getStatusMeta(status?: string): { label: string; className: string } {
  switch ((status ?? "").toUpperCase()) {
    case "ACTIVE":
      return { label: "Ativo", className: "bg-[#3F8F5F]/10 text-[#2F6E48]" };
    case "INACTIVE":
    case "SUSPENDED":
    case "BLOCKED":
      return { label: "Inativo", className: "bg-red-50 text-red-600" };
    default:
      return { label: status ?? "—", className: "bg-[#F1F4F2] text-[#586268]" };
  }
}

export default function ClientProfilePage() {
  const { clientId } = useParams<{ clientId: string }>();

  const [client, setClient] = useState<ResponseClientDetailJason | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    getClientProfile(clientId)
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

  const status = getStatusMeta(client.status);

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
              Cliente desde {formatDate(client.createdAt)}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span
                className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${status.className}`}
              >
                {status.label}
              </span>
              <span
                className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                  client.emailVerified
                    ? "bg-[#3F8F5F]/10 text-[#2F6E48]"
                    : "bg-[#E8A33D]/15 text-[#C97F1E]"
                }`}
              >
                {client.emailVerified ? "E-mail verificado" : "E-mail não verificado"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-5 pt-5 border-t border-[#F1F4F2] text-sm text-[#586268]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          {maskPhone(client.phone)}
        </div>
      </div>

      {/* Avaliações que esse cliente recebeu de outros profissionais */}
      <ReviewsList subjectId={client.id} role="client" />
    </div>
  );
}