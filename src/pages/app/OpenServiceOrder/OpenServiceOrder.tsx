import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLayout } from "@/context/LayoutProvider";
import { ROUTES } from "@/constants/Constants";
import { getWorkerProfile } from "@/services/profile";
import { getCategories } from "@/services/categories";
import { createServiceOrder } from "@/services/serviceOrder";
import { ApiError } from "@/services/apiError";
import { ResponseWorkerDetailJason } from "@/types/worker";
import { ResponseCategoryJason } from "@/types/category";

interface FieldErrors {
  categoryId?: string;
  description?: string;
  scheduledAt?: string;
  value?: string;
  address?: string;
}

function minScheduleValue(): string {
  const now = new Date(Date.now() + 30 * 60 * 1000); // pelo menos 30min à frente
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatScheduled(value: string): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function OpenServiceOrderPage() {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();
  const { user } = useLayout();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [worker, setWorker] = useState<ResponseWorkerDetailJason | null>(null);
  const [categories, setCategories] = useState<ResponseCategoryJason[]>([]);

  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [value, setValue] = useState("");
  const [address, setAddress] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!workerId) return;

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    Promise.all([getWorkerProfile(workerId), getCategories({ pageSize: 50 })])
      .then(([workerData, categoriesData]) => {
        if (cancelled) return;
        setWorker(workerData);
        setCategories(categoriesData.items ?? []);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const apiError = error as ApiError;
        setLoadError(
          apiError.messages?.[0] ?? "Não foi possível carregar os dados"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [workerId]);

  function validate(): FieldErrors {
    const errors: FieldErrors = {};

    if (!categoryId) errors.categoryId = "Escolha uma categoria";
    if (!description.trim()) errors.description = "Descreva o serviço";

    if (!scheduledAt) {
      errors.scheduledAt = "Escolha data e hora";
    } else if (new Date(scheduledAt).getTime() <= Date.now()) {
      errors.scheduledAt = "Escolha um horário no futuro";
    }

    const numericValue = Number(value);
    if (!value || Number.isNaN(numericValue) || numericValue <= 0) {
      errors.value = "Informe um valor válido";
    }

    if (!address.trim()) errors.address = "Informe o endereço";

    return errors;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0 || !workerId) return;

    setSubmitting(true);

    try {
      await createServiceOrder({
        workerId,
        categoryId,
        description,
        scheduledAt: new Date(scheduledAt).toISOString(),
        value: Number(value),
        address,
      });
      setSubmitSuccess(true);
    } catch (error) {
      const apiError = error as ApiError;
      setSubmitError(
        apiError.messages?.join(" ") ?? "Não foi possível abrir o chamado"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (user && user.role !== "client") {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-sm text-[#3A3A3A]">
          Só clientes podem abrir chamados.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-sm text-[#3A3A3A]">Carregando...</p>
      </div>
    );
  }

  if (loadError || !worker) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-sm text-red-600">
          {loadError ?? "Profissional não encontrado"}
        </p>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white border border-[#D9D6D0] rounded-xl p-10 text-center max-w-md mx-auto">
          <span className="inline-flex w-14 h-14 rounded-full bg-[#26A06D]/10 text-[#1F8A5B] items-center justify-center mb-5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          <h1 className="text-2xl text-[#0A0A0A] mb-2 uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>
            Chamado aberto!
          </h1>
          <p className="text-sm text-[#3A3A3A] mb-7">
            {worker.name} foi notificado(a) e vai te retornar em breve.
          </p>
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="bg-[#0A0A0A] border-none text-white px-7 py-3 rounded text-sm font-bold cursor-pointer hover:bg-[#242424] transition-colors duration-150"
          >
            Voltar para profissionais
          </button>
        </div>
      </div>
    );
  }

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const numericValue = Number(value);

  return (
    <div className="max-w-[1080px] mx-auto px-6 sm:px-8 py-10 sm:py-14">
      <div className="mb-9">
        <div className="text-xs font-bold tracking-[.18em] uppercase text-[#C99A00] mb-2.5">
          Novo chamado
        </div>
        <h1 className="text-3xl sm:text-[42px] leading-none text-[#0A0A0A] uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>
          Vamos resolver isso.
        </h1>
        <p className="text-[15px] text-[#5C5C5C] mt-3">
          Você está solicitando um serviço de <strong className="text-[#0A0A0A]">{worker.name}</strong>. Preencha os detalhes abaixo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white border border-[#D9D6D0] rounded-xl p-6 sm:p-8 flex flex-col gap-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-[#0A0A0A] mb-2">
                Categoria do serviço
              </label>
              <select
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setFieldErrors((current) => ({ ...current, categoryId: undefined }));
                }}
                className={`w-full border rounded px-4 py-3 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] bg-white ${fieldErrors.categoryId ? "border-red-400" : "border-[#D9D6D0]"
                  }`}
              >
                <option value="">Selecione...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {fieldErrors.categoryId && (
                <p className="text-xs text-red-600 mt-1.5">{fieldErrors.categoryId}</p>
              )}
              {categories.length === 0 && (
                <p className="text-xs text-[#5C5C5C] mt-1.5">
                  Nenhuma categoria cadastrada ainda.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A0A0A] mb-2">
                Valor combinado (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  setFieldErrors((current) => ({ ...current, value: undefined }));
                }}
                className={`w-full border rounded px-4 py-3 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] ${fieldErrors.value ? "border-red-400" : "border-[#D9D6D0]"
                  }`}
                placeholder="150.00"
              />
              {fieldErrors.value && (
                <p className="text-xs text-red-600 mt-1.5">{fieldErrors.value}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0A0A0A] mb-2">
              Descreva o serviço
            </label>
            <textarea
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setFieldErrors((current) => ({ ...current, description: undefined }));
              }}
              rows={5}
              className={`w-full border rounded px-4 py-3 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] resize-none ${fieldErrors.description ? "border-red-400" : "border-[#D9D6D0]"
                }`}
              placeholder="Ex: Vazamento na pia da cozinha, preciso trocar o sifão."
            />
            {fieldErrors.description && (
              <p className="text-xs text-red-600 mt-1.5">{fieldErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-[#0A0A0A] mb-2">
                Data e hora
              </label>
              <input
                type="datetime-local"
                min={minScheduleValue()}
                value={scheduledAt}
                onChange={(event) => {
                  setScheduledAt(event.target.value);
                  setFieldErrors((current) => ({ ...current, scheduledAt: undefined }));
                }}
                className={`w-full border rounded px-4 py-3 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] ${fieldErrors.scheduledAt ? "border-red-400" : "border-[#D9D6D0]"
                  }`}
              />
              {fieldErrors.scheduledAt && (
                <p className="text-xs text-red-600 mt-1.5">{fieldErrors.scheduledAt}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A0A0A] mb-2">
                Endereço
              </label>
              <input
                type="text"
                value={address}
                onChange={(event) => {
                  setAddress(event.target.value);
                  setFieldErrors((current) => ({ ...current, address: undefined }));
                }}
                className={`w-full border rounded px-4 py-3 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] ${fieldErrors.address ? "border-red-400" : "border-[#D9D6D0]"
                  }`}
                placeholder="Rua, número, bairro, cidade"
              />
              {fieldErrors.address && (
                <p className="text-xs text-red-600 mt-1.5">{fieldErrors.address}</p>
              )}
            </div>
          </div>

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto self-start bg-[#0A0A0A] border-none text-white px-8 py-3.5 rounded text-sm font-bold cursor-pointer hover:bg-[#242424] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Abrindo chamado..." : "Abrir chamado →"}
          </button>
        </form>

        {/* Resumo lateral */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-24">
          <div className="bg-white border border-[#D9D6D0] rounded-xl p-6">
            <p className="text-[11px] font-bold tracking-[.14em] uppercase text-[#8A8A8A] mb-4">
              Profissional
            </p>
            <div className="flex items-center gap-3">
              {worker.profilePhotoUrl ? (
                <img
                  src={worker.profilePhotoUrl}
                  alt={worker.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="w-12 h-12 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-sm">
                  {getInitials(worker.name)}
                </span>
              )}
              <div className="min-w-0">
                <p className="font-bold text-[15px] text-[#0A0A0A] truncate">{worker.name}</p>
                {worker.professions && worker.professions.length > 0 && (
                  <p className="text-xs text-[#5C5C5C] truncate">
                    {worker.professions.map((p) => p.name).join(", ")}
                  </p>
                )}
              </div>
            </div>
            {worker.reviewCount > 0 && (
              <div className="flex items-center gap-1 text-[#C99A00] font-medium text-sm mt-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {worker.averageRating.toFixed(1)}
                <span className="text-[#3A3A3A] font-normal">({worker.reviewCount} avaliações)</span>
              </div>
            )}
          </div>

          <div className="bg-[#0A0A0A] text-white rounded-xl p-6">
            <p className="text-[11px] font-bold tracking-[.14em] uppercase text-[#8A8A8A] mb-4">
              Resumo do chamado
            </p>
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#8A8A8A]">Categoria</dt>
                <dd className="text-white font-medium text-right">{selectedCategory?.name ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#8A8A8A]">Data e hora</dt>
                <dd className="text-white font-medium text-right">{formatScheduled(scheduledAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#8A8A8A]">Endereço</dt>
                <dd className="text-white font-medium text-right truncate max-w-[180px]">{address || "—"}</dd>
              </div>
            </dl>
            <div className="border-t border-[#242424] mt-5 pt-5 flex items-center justify-between">
              <span className="text-[#8A8A8A] text-sm">Valor combinado</span>
              <span className="font-mono text-2xl font-bold text-[#F5C518]">
                {numericValue > 0 ? formatBRL(numericValue) : "—"}
              </span>
            </div>
          </div>

          <p className="text-xs text-[#8A8A8A] leading-relaxed px-1">
            O pagamento fica retido na plataforma e só é liberado ao profissional após a conclusão do serviço.
          </p>
        </div>
      </div>
    </div>
  );
}