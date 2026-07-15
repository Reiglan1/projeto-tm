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
import { isValidPhone, isValidPixKey, onlyDigits } from "@/utils/Validators";
import { maskCNPJ, maskCPF, maskPhone } from "@/utils/Masks";
import { ResponseCategoryJason } from "@/types/category";
import { PIX_KEY_TYPE_OPTIONS } from "@/constants/PixKeyTypes";
import CategoryPicker from "@/components/CategoryPicker/CategoryPicker";
import EmailVerificationModal from "@/components/EmailVerificationModal/EmailVerificationModal";
import ReviewsList from "@/components/ReviewsList/ReviewsList";

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
  pixKey?: string | null;
  pixKeyType?: string | null;
}

interface FieldErrors {
  name?: string;
  phone?: string;
  categoryIds?: string;
  pixKey?: string;
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

function formatPixKeyValue(type: string, value: string): string {
  switch (type.toUpperCase()) {
    case "CPF":
      return maskCPF(value);
    case "CNPJ":
      return maskCNPJ(value);
    case "PHONE":
      return maskPhone(value);
    default:
      return value;
  }
}

function normalizePixKeyValue(type: string, value: string): string {
  switch (type.toUpperCase()) {
    case "CPF":
    case "CNPJ":
    case "PHONE":
      return onlyDigits(value);
    case "EMAIL":
      return value.trim().toLowerCase();
    default:
      return value.trim();
  }
}

function pixKeyTypeLabel(type: string): string {
  return PIX_KEY_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

// A API pode não devolver o valor real da chave por segurança (só o tipo),
// então mostramos os últimos 4 caracteres quando disponível, ou um texto
// genérico quando só sabemos que existe uma chave cadastrada.
function maskPixKeyDisplay(key: string | null | undefined): string {
  if (!key) return "Chave cadastrada";
  const visible = key.slice(-4);
  return `•••• ${visible}`;
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
  const [pixKeyType, setPixKeyType] = useState("");
  const [pixKeyValue, setPixKeyValue] = useState("");
  const [editingPixKey, setEditingPixKey] = useState(false);
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
            pixKey: data.pixKey,
            pixKeyType: data.pixKeyType,
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
            pixKey: data.pixKey,
            pixKeyType: data.pixKeyType,
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

    // Chave Pix só é validada quando o usuário está de fato adicionando ou
    // trocando uma chave. Remoção e visualização não passam por aqui.
    if (editingPixKey) {
      if (!pixKeyType) {
        errors.pixKey = "Escolha o tipo da chave";
      } else if (!isValidPixKey(pixKeyType, pixKeyValue)) {
        errors.pixKey = "Chave Pix inválida para o tipo escolhido";
      }
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

    const hasPixKey = Boolean(editingPixKey && pixKeyType && pixKeyValue.trim());
    const normalizedPixKey = hasPixKey
      ? normalizePixKeyValue(pixKeyType, pixKeyValue)
      : undefined;
    const normalizedPixKeyType = hasPixKey ? pixKeyType : undefined;

    try {
      if (user.role === "client") {
        const updated = await updateClientProfile(user.id, {
          name,
          phone: onlyDigits(phone),
          pixKey: normalizedPixKey,
          pixKeyType: normalizedPixKeyType,
        });
        setProfile((current) =>
          current
            ? {
              ...current,
              name: updated.name,
              phone: updated.phone,
              pixKey: updated.pixKey,
              pixKeyType: updated.pixKeyType,
            }
            : current
        );
      } else {
        const updated = await updateWorkerProfile(user.id, {
          name,
          phone: onlyDigits(phone),
          categoryIds,
          description: description || undefined,
          available24Hours,
          pixKey: normalizedPixKey,
          pixKeyType: normalizedPixKeyType,
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
              pixKey: updated.pixKey,
              pixKeyType: updated.pixKeyType,
            }
            : current
        );
      }

      setUser({ ...user, name });
      setEditingPixKey(false);
      setPixKeyType("");
      setPixKeyValue("");
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
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <p className="text-sm text-[#3A3A3A]">Carregando seu perfil...</p>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <p className="text-sm text-red-600">
          {loadError ?? "Não foi possível carregar seu perfil"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-10 sm:py-14">
      <div className="mb-9">
        <h1 className="text-3xl sm:text-[42px] leading-none text-[#0A0A0A] uppercase" style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}>Meu perfil</h1>
        <p className="text-[15px] text-[#5C5C5C] mt-3">
          Membro desde {formatDate(profile.createdAt)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">

        {/* Coluna lateral fixa */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
          <div className="bg-white border border-[#D9D6D0] rounded-xl p-6 text-center">
            <span className="inline-flex w-16 h-16 rounded-full bg-[#0A0A0A] text-white items-center justify-center text-xl font-bold mb-4">
              {name ? name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase() : "?"}
            </span>
            <p className="font-bold text-[17px] text-[#0A0A0A] truncate">{profile.name}</p>
            <p className="text-sm text-[#5C5C5C] truncate mt-0.5">{profile.email}</p>

            <div className="flex flex-wrap justify-center gap-2 mt-5">
              <span className="text-[11px] font-semibold uppercase tracking-wide bg-[#F5F2EC] text-[#3A3A3A] px-2.5 py-1 rounded-full">
                {profile.status}
              </span>
              <span
                className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${profile.emailVerified
                  ? "bg-[#26A06D]/10 text-[#1F8A5B]"
                  : "bg-[#F5C518]/15 text-[#C99A00]"
                  }`}
              >
                {profile.emailVerified ? "E-mail verificado" : "E-mail não verificado"}
              </span>
              {user?.role === "worker" && profile.verificationStatus && (
                <span className="text-[11px] font-semibold uppercase tracking-wide bg-[#F5C518]/15 text-[#3A3A3A] px-2.5 py-1 rounded-full">
                  {profile.verificationStatus}
                </span>
              )}
              {user?.role === "worker" && typeof profile.reviewCount === "number" && (
                <span className="text-[11px] font-semibold uppercase tracking-wide bg-[#F5C518]/15 text-[#C99A00] px-2.5 py-1 rounded-full">
                  ★ {(profile.averageRating ?? 0).toFixed(1)} ({profile.reviewCount})
                </span>
              )}
            </div>

            {!profile.emailVerified && (
              <button
                type="button"
                onClick={() => setShowVerificationModal(true)}
                className="mt-4 w-full text-[13px] font-bold text-[#0A0A0A] bg-transparent border border-[#D9D6D0] rounded px-4 py-2.5 cursor-pointer hover:border-[#0A0A0A] transition-colors duration-150"
              >
                Verificar e-mail
              </button>
            )}
          </div>

          <div className="bg-white border border-[#D9D6D0] rounded-xl p-6">
            <h2 className="text-sm font-bold text-[#0A0A0A] mb-1.5">
              Verificação de identidade
            </h2>
            <p className="text-sm text-[#5C5C5C] mb-4">
              {user?.role === "worker" && profile.verificationStatus
                ? "Confira o status ou envie seus documentos."
                : "Envie seus documentos para confirmar sua identidade."}
            </p>
            <button
              onClick={() => navigate(ROUTES.VERIFICATION)}
              className="w-full bg-transparent border border-[#0A0A0A] text-[#0A0A0A] px-5 py-2.5 rounded text-[13px] font-bold cursor-pointer hover:bg-[#0A0A0A] hover:text-white transition-colors duration-150"
            >
              Verificar identidade
            </button>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <div className="flex flex-col gap-6 min-w-0">

        {/* Dados da conta */}
        <div className="bg-white border border-[#D9D6D0] rounded-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-[#0A0A0A] mb-2">
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setFieldErrors((current) => ({ ...current, name: undefined }));
              }}
              className={`w-full border rounded px-4 py-3 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] ${fieldErrors.name ? "border-red-400" : "border-[#D9D6D0]"
                }`}
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-600 mt-1.5">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0A0A0A] mb-2">
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
              className={`w-full border rounded px-4 py-3 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] ${fieldErrors.phone ? "border-red-400" : "border-[#D9D6D0]"
                }`}
              placeholder="(00) 00000-0000"
            />
            {fieldErrors.phone && (
              <p className="text-xs text-red-600 mt-1.5">{fieldErrors.phone}</p>
            )}
          </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0A0A0A] mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full border border-[#D9D6D0] rounded px-4 py-3 text-sm text-[#5C5C5C] bg-[#F5F2EC] cursor-not-allowed"
            />
            <p className="text-xs text-[#5C5C5C] mt-1.5">
              O e-mail não pode ser alterado por aqui.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0A0A0A] mb-2">
              Chave Pix <span className="text-[#5C5C5C] font-normal">(obrigatório)</span>
            </label>

            {editingPixKey ? (
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={pixKeyType}
                    onChange={(event) => {
                      setPixKeyType(event.target.value);
                      setPixKeyValue("");
                      setFieldErrors((current) => ({ ...current, pixKey: undefined }));
                    }}
                    className="sm:w-40 shrink-0 border border-[#D9D6D0] rounded px-3.5 py-3 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] bg-white"
                  >
                    <option value="">Tipo</option>
                    {PIX_KEY_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={pixKeyValue}
                    disabled={!pixKeyType}
                    onChange={(event) => {
                      setPixKeyValue(formatPixKeyValue(pixKeyType, event.target.value));
                      setFieldErrors((current) => ({ ...current, pixKey: undefined }));
                    }}
                    placeholder={
                      pixKeyType ? "Digite sua chave Pix" : "Escolha o tipo primeiro"
                    }
                    className={`flex-1 min-w-0 border rounded px-4 py-3 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] disabled:bg-[#F5F2EC] disabled:cursor-not-allowed ${fieldErrors.pixKey ? "border-red-400" : "border-[#D9D6D0]"
                      }`}
                  />
                </div>
                {fieldErrors.pixKey && (
                  <p className="text-xs text-red-600">{fieldErrors.pixKey}</p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditingPixKey(false);
                    setPixKeyType("");
                    setPixKeyValue("");
                    setFieldErrors((current) => ({ ...current, pixKey: undefined }));
                  }}
                  className="text-xs text-[#5C5C5C] font-medium underline bg-transparent border-none cursor-pointer self-start"
                >
                  Cancelar
                </button>
              </div>
            ) : profile.pixKeyType ? (
              <div className="flex items-center justify-between gap-3 border border-[#D9D6D0] rounded px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[#0A0A0A]">
                    {pixKeyTypeLabel(profile.pixKeyType)}
                  </p>
                  <p className="text-xs text-[#5C5C5C]">
                    {maskPixKeyDisplay(profile.pixKey)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPixKey(true);
                    setPixKeyType(profile.pixKeyType ?? "");
                    setPixKeyValue("");
                  }}
                  className="text-xs text-[#5C5C5C] font-medium underline bg-transparent border-none cursor-pointer shrink-0"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingPixKey(true);
                  setPixKeyType("");
                  setPixKeyValue("");
                }}
                className="text-sm text-[#5C5C5C] font-medium underline bg-transparent border-none cursor-pointer"
              >
                + Adicionar chave Pix
              </button>
            )}

            {!editingPixKey && (
              <p className="text-xs text-[#5C5C5C] mt-1.5">
                {profile.pixKeyType
                  ? "Usada para receber seus repasses/saques via Pix. Não é possível remover, só trocar por outra."
                  : "Usada para receber seus repasses/saques via Pix."}
              </p>
            )}
          </div>

          {user?.role === "worker" && (
            <div>
              <label className="block text-sm font-bold text-[#0A0A0A] mb-2">
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
                <p className="text-xs text-red-600 mt-1.5">{fieldErrors.categoryIds}</p>
              )}
            </div>
          )}

          {user?.role === "worker" && (
            <div>
              <label className="block text-sm font-bold text-[#0A0A0A] mb-2">
                Sobre você <span className="text-[#5C5C5C] font-normal">(opcional)</span>
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="w-full border border-[#D9D6D0] rounded px-4 py-3 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] resize-none"
                placeholder="Conte um pouco da sua experiência para os clientes"
              />
            </div>
          )}

          {user?.role === "worker" && (
            <label className="flex items-center gap-2 text-sm text-[#3A3A3A]">
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
            <p className="text-sm text-[#1F8A5B]">Alterações salvas com sucesso.</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="self-start bg-[#0A0A0A] border-none text-white px-7 py-3 rounded text-sm font-bold cursor-pointer hover:bg-[#242424] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
          </form>
        </div>

        {user && <ReviewsList subjectId={user.id} role={user.role} />}

        {/* Zona de risco */}
        <div className="bg-white border border-red-200 rounded-xl p-6 sm:p-8">
          <h2 className="text-sm font-bold text-red-600 mb-1.5">
            Excluir conta
          </h2>
          <p className="text-sm text-[#5C5C5C] mb-4">
            Essa ação é permanente e não pode ser desfeita.
          </p>

          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="bg-transparent border border-red-200 text-red-600 px-5 py-2.5 rounded text-[13px] font-bold cursor-pointer hover:bg-red-50 transition-colors duration-150"
            >
              Excluir minha conta
            </button>
          ) : (
            <form onSubmit={handleDelete} noValidate className="flex flex-col gap-3 max-w-sm">
              <div>
                <label className="block text-sm font-bold text-[#0A0A0A] mb-2">
                  Confirme sua senha
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(event) => {
                    setDeletePassword(event.target.value);
                    setDeleteError(null);
                  }}
                  className="w-full border border-[#D9D6D0] rounded px-4 py-3 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                  placeholder="••••••••"
                />
              </div>

              {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={deleting}
                  className="bg-red-600 border-none text-white px-5 py-2.5 rounded text-[13px] font-bold cursor-pointer hover:bg-red-700 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
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
                  className="bg-transparent border border-[#D9D6D0] text-[#0A0A0A] px-5 py-2.5 rounded text-[13px] font-bold cursor-pointer hover:border-[#0A0A0A] transition-colors duration-150"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
        </div>
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