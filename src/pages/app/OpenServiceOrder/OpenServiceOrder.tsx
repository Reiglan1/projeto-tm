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
      <div className="max-w-xl mx-auto px-6 py-10">
        <p className="text-sm text-[#3A3A3A]">
          Só clientes podem abrir chamados.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-6 py-10">
        <p className="text-sm text-[#3A3A3A]">Carregando...</p>
      </div>
    );
  }

  if (loadError || !worker) {
    return (
      <div className="max-w-xl mx-auto px-6 py-10">
        <p className="text-sm text-red-600">
          {loadError ?? "Profissional não encontrado"}
        </p>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="bg-white border border-[#D9D6D0] rounded-xl p-6 text-center">
          <span className="inline-flex w-12 h-12 rounded-full bg-[#26A06D]/10 text-[#1F8A5B] items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          <h1 className="text-lg font-bold text-[#0A0A0A] mb-1.5 uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>
            Chamado aberto com sucesso!
          </h1>
          <p className="text-sm text-[#3A3A3A] mb-6">
            {worker.name} foi notificado(a) e vai te retornar em breve.
          </p>
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="bg-[#0A0A0A] border-none text-white px-6 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#242424] transition-colors duration-150"
          >
            Voltar para profissionais
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A0A0A] uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>Abrir chamado</h1>
        <p className="text-sm text-[#3A3A3A] mt-1">
          Você está solicitando um serviço de <strong className="text-[#0A0A0A]">{worker.name}</strong>.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white border border-[#D9D6D0] rounded-xl p-6 flex flex-col gap-4"
      >
        <div>
          <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
            Categoria do serviço
          </label>
          <select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setFieldErrors((current) => ({ ...current, categoryId: undefined }));
            }}
            className={`w-full border rounded-md px-3.5 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] bg-white ${fieldErrors.categoryId ? "border-red-400" : "border-[#D9D6D0]"
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
            <p className="text-xs text-red-600 mt-1">{fieldErrors.categoryId}</p>
          )}
          {categories.length === 0 && (
            <p className="text-xs text-[#3A3A3A] mt-1">
              Nenhuma categoria cadastrada ainda.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
            Descreva o serviço
          </label>
          <textarea
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setFieldErrors((current) => ({ ...current, description: undefined }));
            }}
            rows={4}
            className={`w-full border rounded-md px-3.5 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] resize-none ${fieldErrors.description ? "border-red-400" : "border-[#D9D6D0]"
              }`}
            placeholder="Ex: Vazamento na pia da cozinha, preciso trocar o sifão."
          />
          {fieldErrors.description && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
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
              className={`w-full border rounded-md px-3.5 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] ${fieldErrors.scheduledAt ? "border-red-400" : "border-[#D9D6D0]"
                }`}
            />
            {fieldErrors.scheduledAt && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.scheduledAt}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
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
              className={`w-full border rounded-md px-3.5 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] ${fieldErrors.value ? "border-red-400" : "border-[#D9D6D0]"
                }`}
              placeholder="150.00"
            />
            {fieldErrors.value && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.value}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
            Endereço
          </label>
          <input
            type="text"
            value={address}
            onChange={(event) => {
              setAddress(event.target.value);
              setFieldErrors((current) => ({ ...current, address: undefined }));
            }}
            className={`w-full border rounded-md px-3.5 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] ${fieldErrors.address ? "border-red-400" : "border-[#D9D6D0]"
              }`}
            placeholder="Rua, número, bairro, cidade"
          />
          {fieldErrors.address && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.address}</p>
          )}
        </div>

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-[#0A0A0A] border-none text-white px-6 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#242424] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Abrindo chamado..." : "Abrir chamado"}
        </button>
      </form>
    </div>
  );
}