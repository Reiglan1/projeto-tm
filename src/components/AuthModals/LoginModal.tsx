import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "@/components/Modal/Modal";
import RoleTabs from "./RoleTabs";
import { useLayout } from "@/context/LayoutProvider";
import { loginClient, loginWorker, ApiError } from "@/services/auth";
import { UserRole } from "@/types/auth";
import { isValidEmail } from "@/utils/Validators";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginModal({
  open,
  onClose,
  onSwitchToRegister,
}: LoginModalProps) {
  const navigate = useNavigate();
  const { login } = useLayout();

  const [role, setRole] = useState<UserRole>("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  function resetAndClose() {
    setEmail("");
    setPassword("");
    setFieldErrors({});
    setFormError(null);
    setLoading(false);
    onClose();
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {};

    if (!email.trim()) {
      errors.email = "Informe seu e-mail";
    } else if (!isValidEmail(email)) {
      errors.email = "E-mail inválido";
    }

    if (!password) {
      errors.password = "Informe sua senha";
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
          ? await loginClient({ email, password })
          : await loginWorker({ email, password });

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
      setFormError(apiError.messages?.join(" ") ?? "Não foi possível entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={resetAndClose} title="Entrar">
      <RoleTabs value={role} onChange={setRole} />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#12233D] mb-1.5">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setFieldErrors((current) => ({ ...current, email: undefined }));
            }}
            className={`w-full border rounded-md px-3.5 py-2.5 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D] ${
              fieldErrors.email ? "border-red-400" : "border-[#C7D1CB]"
            }`}
            placeholder="voce@email.com"
          />
          {fieldErrors.email && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#12233D] mb-1.5">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setFieldErrors((current) => ({ ...current, password: undefined }));
            }}
            className={`w-full border rounded-md px-3.5 py-2.5 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D] ${
              fieldErrors.password ? "border-red-400" : "border-[#C7D1CB]"
            }`}
            placeholder="••••••••"
          />
          {fieldErrors.password && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
          )}
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#12233D] border-none text-white px-[22px] py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#1B3350] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-sm text-[#586268] text-center mt-5">
        Não tem uma conta?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-[#12233D] font-semibold bg-transparent border-none cursor-pointer p-0 underline"
        >
          Cadastre-se
        </button>
      </p>
    </Modal>
  );
}