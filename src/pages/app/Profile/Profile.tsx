import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLayout } from "@/context/LayoutProvider";
import { ROUTES } from "@/constants/Constants";
import {
  getClientProfile,
  updateClientProfile,
  getWorkerProfile,
  updateWorkerProfile,
  deleteClientAccount,
  deleteWorkerAccount,
} from "@/services/profile";
import { getCategories } from "@/services/categories";
import { ApiError } from "@/services/apiError";
import { isValidPhone, onlyDigits } from "@/utils/Validators";
import { maskPhone } from "@/utils/Masks";
import { ResponseCategoryJason } from "@/types/category";
import CategoryPicker from "@/components/CategoryPicker/CategoryPicker";
import EmailVerificationModal from "@/components/EmailVerificationModal/EmailVerificationModal";

interface ProfileState {
  name: string;
  email: string;
  phone: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  verificationStatus?: string;
  available24Hours?: boolean;
  description?: string | null;
  categoryIds?: string[];
  averageRating?: number;
  reviewCount?: number;
}

interface FieldErrors {
  name?: string;
  phone?: string;
  categoryIds?: string;
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

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useLayout();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileState | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [available24Hours, setAvailable24Hours] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [categories, setCategories] = useState<ResponseCategoryJason[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    const request: Promise<ProfileState> =
      user.role === "client"
        ? getClientProfile(user.id).then(
          (data): ProfileState => ({
            name: data.name,
            email: data.email,
            phone: data.phone,
            status: data.status,
            emailVerified: data.emailVerified,
            createdAt: data.createdAt,
          })
        )
        : getWorkerProfile(user.id).then(
          (data): ProfileState => ({
            name: data.name,
            email: data.email,
            phone: data.phone,
            status: data.status,
            emailVerified: data.emailVerified,
            createdAt: data.createdAt,
            verificationStatus: data.verificationStatus,
            available24Hours: data.available24Hours,
            description: data.description,
            categoryIds: (data.professions ?? []).map((p) => p.categoryId),
            averageRating: data.averageRating,
            reviewCount: data.reviewCount,
          })
        );

    request
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setName(data.name);
        setPhone(maskPhone(data.phone));
        setDescription(data.description ?? "");
        setCategoryIds(data.categoryIds ?? []);
        setAvailable24Hours(Boolean(data.available24Hours));
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const apiError = error as ApiError;
        setLoadError(
          apiError.messages?.[0] ?? "Não foi possível carregar seu perfil"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Categorias só interessam ao profissional, então só busca nesse caso.
  useEffect(() => {
    if (user?.role !== "worker") return;

    let cancelled = false;
    setCategoriesLoading(true);

    getCategories({ pageSize: 100 })
      .then((response) => {
        if (!cancelled) setCategories(response.items ?? []);
      })
      .catch(() => {
        // Sem categorias disponíveis não bloqueia a tela, só limita a escolha.
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  function handleEmailVerified() {
    setShowVerificationModal(false);
    setProfile((current) => (current ? { ...current, emailVerified: true } : current));
  }

  function handleCategoriesChange(ids: string[]) {
    setCategoryIds(ids);
    setFieldErrors((current) => ({ ...current, categoryIds: undefined }));
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = "Informe seu nome";
    if (!isValidPhone(phone)) errors.phone = "Telefone inválido";
    if (user?.role === "worker" && categoryIds.length === 0) {
      errors.categoryIds = "Escolha ao menos uma categoria de serviço";
    }
    return errors;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0 || !user) return;

    setSaving(true);

    try {
      if (user.role === "client") {
        const updated = await updateClientProfile(user.id, {
          name,
          phone: onlyDigits(phone),
        });
        setProfile((current) =>
          current ? { ...current, name: updated.name, phone: updated.phone } : current
        );
      } else {
        const updated = await updateWorkerProfile(user.id, {
          name,
          phone: onlyDigits(phone),
          categoryIds,
          description: description || undefined,
          available24Hours,
        });
        setProfile((current) =>
          current
            ? {
              ...current,
              name: updated.name,
              phone: updated.phone,
              description: updated.description,
              categoryIds: (updated.professions ?? []).map((p) => p.categoryId),
              available24Hours: updated.available24Hours,
            }
            : current
        );
      }

      setUser({ ...user, name });
      setSaveSuccess(true);
    } catch (error) {
      const apiError = error as ApiError;
      setSaveError(
        apiError.messages?.join(" ") ?? "Não foi possível salvar as alterações"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(event: FormEvent) {
    event.preventDefault();
    setDeleteError(null);

    if (!deletePassword) {
      setDeleteError("Informe sua senha para confirmar");
      return;
    }
    if (!user) return;

    setDeleting(true);

    try {
      if (user.role === "client") {
        await deleteClientAccount({ password: deletePassword });
      } else {
        await deleteWorkerAccount({ password: deletePassword });
      }
      logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      const apiError = error as ApiError;
      setDeleteError(
        apiError.messages?.join(" ") ?? "Não foi possível excluir sua conta"
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-sm text-[#586268]">Carregando seu perfil...</p>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-sm text-red-600">
          {loadError ?? "Não foi possível carregar seu perfil"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#12233D]">Meu perfil</h1>
        <p className="text-sm text-[#586268] mt-1">
          Membro desde {formatDate(profile.createdAt)}
        </p>
      </div>

      {/* Verificação de identidade */}
      <div className="bg-white border border-[#C7D1CB] rounded-xl p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold text-[#12233D]">
            Verificação de identidade
          </h2>
          <p className="text-sm text-[#586268] mt-1">
            {user?.role === "worker" && profile.verificationStatus
              ? "Confira o status ou envie seus documentos."
              : "Envie seus documentos para confirmar sua identidade."}
          </p>
        </div>
        <button
          onClick={() => navigate(ROUTES.VERIFICATION)}
          className="bg-transparent border border-[#12233D] text-[#12233D] px-5 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#12233D] hover:text-white transition-colors duration-150 shrink-0"
        >
          Verificar identidade
        </button>
      </div>

      {/* Dados da conta */}
      <div className="bg-white border border-[#C7D1CB] rounded-xl p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-[11px] font-semibold uppercase tracking-wide bg-[#F1F4F2] text-[#586268] px-2.5 py-1 rounded-full">
            {profile.status}
          </span>
          <span
            className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${profile.emailVerified
              ? "bg-[#3F8F5F]/10 text-[#2F6E48]"
              : "bg-[#E8A33D]/15 text-[#C97F1E]"
              }`}
          >
            {profile.emailVerified ? "E-mail verificado" : "E-mail não verificado"}
          </span>
          {!profile.emailVerified && (
            <button
              type="button"
              onClick={() => setShowVerificationModal(true)}
              className="text-[11px] font-semibold uppercase tracking-wide text-[#3E6990] bg-transparent border-none cursor-pointer underline"
            >
              Verificar
            </button>
          )}
          {user?.role === "worker" && profile.verificationStatus && (
            <span className="text-[11px] font-semibold uppercase tracking-wide bg-[#3E6990]/10 text-[#3E6990] px-2.5 py-1 rounded-full">
              {profile.verificationStatus}
            </span>
          )}
          {user?.role === "worker" && typeof profile.reviewCount === "number" && (
            <span className="text-[11px] font-semibold uppercase tracking-wide bg-[#E8A33D]/15 text-[#C97F1E] px-2.5 py-1 rounded-full">
              ★ {(profile.averageRating ?? 0).toFixed(1)} ({profile.reviewCount})
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#12233D] mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setFieldErrors((current) => ({ ...current, name: undefined }));
              }}
              className={`w-full border rounded-md px-3.5 py-2.5 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D] ${fieldErrors.name ? "border-red-400" : "border-[#C7D1CB]"
                }`}
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#12233D] mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full border border-[#C7D1CB] rounded-md px-3.5 py-2.5 text-sm text-[#586268] bg-[#F1F4F2] cursor-not-allowed"
            />
            <p className="text-xs text-[#586268] mt-1">
              O e-mail não pode ser alterado por aqui.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#12233D] mb-1.5">
              Telefone
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(event) => {
                setPhone(maskPhone(event.target.value));
                setFieldErrors((current) => ({ ...current, phone: undefined }));
              }}
              className={`w-full border rounded-md px-3.5 py-2.5 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D] ${fieldErrors.phone ? "border-red-400" : "border-[#C7D1CB]"
                }`}
              placeholder="(00) 00000-0000"
            />
            {fieldErrors.phone && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>
            )}
          </div>

          {user?.role === "worker" && (
            <div>
              <label className="block text-sm font-medium text-[#12233D] mb-1.5">
                Categorias de serviço
              </label>
              <CategoryPicker
                categories={categories}
                selectedIds={categoryIds}
                onChange={handleCategoriesChange}
                loading={categoriesLoading}
                hasError={Boolean(fieldErrors.categoryIds)}
              />
              {fieldErrors.categoryIds && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.categoryIds}</p>
              )}
            </div>
          )}

          {user?.role === "worker" && (
            <div>
              <label className="block text-sm font-medium text-[#12233D] mb-1.5">
                Sobre você <span className="text-[#586268] font-normal">(opcional)</span>
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="w-full border border-[#C7D1CB] rounded-md px-3.5 py-2.5 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D] resize-none"
                placeholder="Conte um pouco da sua experiência para os clientes"
              />
            </div>
          )}

          {user?.role === "worker" && (
            <label className="flex items-center gap-2 text-sm text-[#586268]">
              <input
                type="checkbox"
                checked={available24Hours}
                onChange={(event) => setAvailable24Hours(event.target.checked)}
              />
              Disponível 24 horas
            </label>
          )}

          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          {saveSuccess && (
            <p className="text-sm text-[#2F6E48]">Alterações salvas com sucesso.</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-[#12233D] border-none text-white px-6 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#1B3350] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>

      {/* Zona de risco */}
      <div className="bg-white border border-red-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-red-600 mb-1.5">
          Excluir conta
        </h2>
        <p className="text-sm text-[#586268] mb-4">
          Essa ação é permanente e não pode ser desfeita.
        </p>

        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="bg-transparent border border-red-200 text-red-600 px-5 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-red-50 transition-colors duration-150"
          >
            Excluir minha conta
          </button>
        ) : (
          <form onSubmit={handleDelete} noValidate className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#12233D] mb-1.5">
                Confirme sua senha
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(event) => {
                  setDeletePassword(event.target.value);
                  setDeleteError(null);
                }}
                className="w-full border border-[#C7D1CB] rounded-md px-3.5 py-2.5 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D]"
                placeholder="••••••••"
              />
            </div>

            {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={deleting}
                className="bg-red-600 border-none text-white px-5 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-red-700 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleting ? "Excluindo..." : "Confirmar exclusão"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmingDelete(false);
                  setDeletePassword("");
                  setDeleteError(null);
                }}
                className="bg-transparent border border-[#C7D1CB] text-[#12233D] px-5 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:border-[#12233D] transition-colors duration-150"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
      {user && (
        <EmailVerificationModal
          open={showVerificationModal}
          email={profile.email}
          role={user.role}
          onClose={() => setShowVerificationModal(false)}
          onVerified={handleEmailVerified}
        />
      )}
    </div>
  );
}