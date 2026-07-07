import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "@/components/Modal/Modal";
import CategoryPicker from "@/components/CategoryPicker/CategoryPicker";
import RoleTabs from "./RoleTabs";
import { useLayout } from "@/context/LayoutProvider";
import { registerClient, registerWorker, ApiError } from "@/services/auth";
import { getCategories } from "@/services/categories";
import { RequestClientJason, RequestWorkerJason, UserRole } from "@/types/auth";
import { ResponseCategoryJason } from "@/types/category";
import {
  isValidEmail,
  isValidCPF,
  isValidPhone,
  checkPasswordRules,
  isValidPassword,
  onlyDigits,
} from "@/utils/Validators";
import { maskCPF, maskPhone } from "@/utils/Masks";

interface RegisterModalProps {
  open: boolean;
  defaultRole?: UserRole;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const initialForm = {
  name: "",
  email: "",
  cpf: "",
  phone: "",
  categoryIds: [] as string[],
  description: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

type FormField = keyof typeof initialForm;
type FieldErrors = Partial<Record<FormField, string>>;

export default function RegisterModal({
  open,
  defaultRole = "client",
  onClose,
  onSwitchToLogin,
}: RegisterModalProps) {
  const navigate = useNavigate();
  const { login } = useLayout();

  const [role, setRole] = useState<UserRole>(defaultRole);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [categories, setCategories] = useState<ResponseCategoryJason[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setRole(defaultRole);
    }
  }, [open, defaultRole]);

  // Busca as categorias só quando o modal abre e o profissional precisa
  // escolher — evita chamada desnecessária pra quem só quer logar como cliente.
  useEffect(() => {
    if (!open || role !== "worker" || categories.length > 0) return;

    let cancelled = false;
    setCategoriesLoading(true);

    getCategories({ pageSize: 100 })
      .then((response) => {
        if (!cancelled) setCategories(response.items ?? []);
      })
      .catch(() => {
        // Se não conseguir carregar, o multi-select fica vazio e o usuário
        // vê a mensagem de "nenhuma categoria" — não é um erro bloqueante.
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, role, categories.length]);

  function updateField<K extends FormField>(
    field: K,
    value: (typeof initialForm)[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    // limpa o erro do campo assim que o usuário começa a corrigir
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  // function toggleCategory(categoryId: string) {
  //   setForm((current) => {
  //     const alreadySelected = current.categoryIds.includes(categoryId);
  //     return {
  //       ...current,
  //       categoryIds: alreadySelected
  //         ? current.categoryIds.filter((id) => id !== categoryId)
  //         : [...current.categoryIds, categoryId],
  //     };
  //   });
  //   setFieldErrors((current) => ({ ...current, categoryIds: undefined }));
  // }

  function resetAndClose() {
    setForm(initialForm);
    setFieldErrors({});
    setFormError(null);
    setLoading(false);
    onClose();
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {};

    if (!form.name.trim()) {
      errors.name = "Informe seu nome completo";
    }

    if (!form.email.trim()) {
      errors.email = "Informe um e-mail";
    } else if (!isValidEmail(form.email)) {
      errors.email = "E-mail inválido";
    }

    if (!isValidCPF(form.cpf)) {
      errors.cpf = "CPF inválido";
    }

    if (!isValidPhone(form.phone)) {
      errors.phone = "Telefone inválido";
    }

    if (role === "worker" && form.categoryIds.length === 0) {
      errors.categoryIds = "Escolha ao menos uma categoria de serviço";
    }

    if (!isValidPassword(form.password)) {
      errors.password = "A senha não atende aos requisitos abaixo";
    }

    if (form.confirmPassword !== form.password) {
      errors.confirmPassword = "As senhas não coincidem";
    }

    if (!form.acceptTerms) {
      errors.acceptTerms = "Você precisa aceitar os termos de uso";
    }

    return errors;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    try {
      const response =
        role === "client"
          ? await registerClient(buildClientPayload())
          : await registerWorker(buildWorkerPayload());

      login(response.token, {
        id: response.id,
        name: response.name,
        email: response.email,
        role,
      });

      resetAndClose();
      navigate("/");
    } catch (error) {
      const apiError = error as ApiError;
      setFormError(apiError.messages?.join(" ") ?? "Não foi possível cadastrar");
    } finally {
      setLoading(false);
    }
  }

  // Cada role manda só os campos que a API dela espera (o backend rejeita
  // propriedades extras), então montamos os payloads separadamente.
  function buildClientPayload(): RequestClientJason {
    return {
      name: form.name,
      email: form.email,
      cpf: onlyDigits(form.cpf),
      phone: onlyDigits(form.phone),
      password: form.password,
      confirmPassword: form.confirmPassword,
      acceptTerms: form.acceptTerms,
    };
  }

  function buildWorkerPayload(): RequestWorkerJason {
    return {
      name: form.name,
      email: form.email,
      cpf: onlyDigits(form.cpf),
      phone: onlyDigits(form.phone),
      categoryIds: form.categoryIds,
      description: form.description || undefined,
      password: form.password,
      confirmPassword: form.confirmPassword,
      acceptTerms: form.acceptTerms,
    };
  }

  const passwordRules = checkPasswordRules(form.password);

  return (
    <Modal open={open} onClose={resetAndClose} title="Criar conta">
      <RoleTabs value={role} onChange={setRole} />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#12233D] mb-1.5">
            Nome completo
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className={`w-full border rounded-md px-3.5 py-2.5 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D] ${
              fieldErrors.name ? "border-red-400" : "border-[#C7D1CB]"
            }`}
            placeholder="Seu nome"
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
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className={`w-full border rounded-md px-3.5 py-2.5 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D] ${
              fieldErrors.email ? "border-red-400" : "border-[#C7D1CB]"
            }`}
            placeholder="voce@email.com"
          />
          {fieldErrors.email && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#12233D] mb-1.5">
              CPF
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={form.cpf}
              onChange={(event) =>
                updateField("cpf", maskCPF(event.target.value))
              }
              className={`w-full border rounded-md px-3.5 py-2.5 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D] ${
                fieldErrors.cpf ? "border-red-400" : "border-[#C7D1CB]"
              }`}
              placeholder="000.000.000-00"
            />
            {fieldErrors.cpf && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.cpf}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#12233D] mb-1.5">
              Telefone
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={(event) =>
                updateField("phone", maskPhone(event.target.value))
              }
              className={`w-full border rounded-md px-3.5 py-2.5 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D] ${
                fieldErrors.phone ? "border-red-400" : "border-[#C7D1CB]"
              }`}
              placeholder="(00) 00000-0000"
            />
            {fieldErrors.phone && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>
            )}
          </div>
        </div>

        {role === "worker" && (
          <>
            <div>
              <label className="block text-sm font-medium text-[#12233D] mb-1.5">
                Categorias de serviço
              </label>
              <CategoryPicker
                categories={categories}
                selectedIds={form.categoryIds}
                onChange={(ids) => updateField("categoryIds", ids)}
                loading={categoriesLoading}
                hasError={Boolean(fieldErrors.categoryIds)}
              />
              {fieldErrors.categoryIds && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.categoryIds}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#12233D] mb-1.5">
                Sobre você <span className="text-[#586268] font-normal">(opcional)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                rows={3}
                className="w-full border border-[#C7D1CB] rounded-md px-3.5 py-2.5 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D] resize-none"
                placeholder="Conte um pouco da sua experiência para os clientes"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-[#12233D] mb-1.5">
            Senha
          </label>
          <input
            type="password"
            value={form.password}
            onFocus={() => setPasswordFocused(true)}
            onChange={(event) => updateField("password", event.target.value)}
            className={`w-full border rounded-md px-3.5 py-2.5 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D] ${
              fieldErrors.password ? "border-red-400" : "border-[#C7D1CB]"
            }`}
            placeholder="••••••••"
          />
          {fieldErrors.password && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
          )}

          {(passwordFocused || form.password.length > 0) && (
            <ul className="mt-2 space-y-1">
              {passwordRules.map((rule) => (
                <li
                  key={rule.label}
                  className={`text-xs flex items-center gap-1.5 ${
                    rule.valid ? "text-green-600" : "text-[#586268]"
                  }`}
                >
                  <span>{rule.valid ? "✓" : "•"}</span>
                  {rule.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#12233D] mb-1.5">
            Confirmar senha
          </label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(event) =>
              updateField("confirmPassword", event.target.value)
            }
            className={`w-full border rounded-md px-3.5 py-2.5 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D] ${
              fieldErrors.confirmPassword ? "border-red-400" : "border-[#C7D1CB]"
            }`}
            placeholder="••••••••"
          />
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-red-600 mt-1">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-start gap-2 text-sm text-[#586268]">
            <input
              type="checkbox"
              checked={form.acceptTerms}
              onChange={(event) =>
                updateField("acceptTerms", event.target.checked)
              }
              className="mt-0.5"
            />
            Li e aceito os termos de uso e a política de privacidade
          </label>
          {fieldErrors.acceptTerms && (
            <p className="text-xs text-red-600 mt-1">
              {fieldErrors.acceptTerms}
            </p>
          )}
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#12233D] border-none text-white px-[22px] py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#1B3350] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      <p className="text-sm text-[#586268] text-center mt-5">
        Já tem uma conta?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[#12233D] font-semibold bg-transparent border-none cursor-pointer p-0 underline"
        >
          Entrar
        </button>
      </p>
    </Modal>
  );
}