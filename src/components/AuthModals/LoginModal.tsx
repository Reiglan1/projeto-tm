import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "@/components/Modal/Modal";
import PasswordInput from "@/components/PasswordInput/PasswordInput";
import RoleTabs from "./RoleTabs";
import { useLayout } from "@/context/LayoutProvider";
import {
  loginClient,
  loginWorker,
  verifyEmail,
  resendVerification,
  forgotPassword,
  ApiError,
} from "@/services/auth";
import { UserRole } from "@/types/auth";
import { isValidEmail } from "@/utils/Validators";

const RESEND_COOLDOWN_SECONDS = 30;

interface LoginModalProps {
  open: boolean;
  defaultRole?: UserRole;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

type Step = "login" | "verify" | "forgot";

// O backend não manda um código de erro estruturado, só uma mensagem de
// texto — então detectamos "precisa verificar o e-mail" pelo conteúdo dela.
function isEmailNotVerifiedError(apiError: ApiError): boolean {
  return apiError.messages.some((message) => {
    const normalized = message.toLowerCase();
    return normalized.includes("verific") || normalized.includes("confirm");
  });
}

export default function LoginModal({
  open,
  defaultRole = "client",
  onClose,
  onSwitchToRegister,
}: LoginModalProps) {
  const navigate = useNavigate();
  const { login } = useLayout();

  const [step, setStep] = useState<Step>("login");
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    if (open) {
      setRole(defaultRole);
    }
  }, [open, defaultRole]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timeout = setTimeout(() => setCooldown((current) => current - 1), 1000);
    return () => clearTimeout(timeout);
  }, [cooldown]);

  function resetAndClose() {
    setStep("login");
    setEmail("");
    setPassword("");
    setFieldErrors({});
    setFormError(null);
    setLoading(false);
    setCode("");
    setVerifyError(null);
    setResendMessage(null);
    setCooldown(0);
    setForgotLoading(false);
    setForgotError(null);
    setForgotSent(false);
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

  async function completeLogin() {
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
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    try {
      await completeLogin();
    } catch (error) {
      const apiError = error as ApiError;
      if (isEmailNotVerifiedError(apiError)) {
        setStep("verify");
      } else {
        setFormError(apiError.messages?.join(" ") ?? "Não foi possível entrar");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyAndLogin(event: FormEvent) {
    event.preventDefault();
    setVerifyError(null);

    if (!code.trim()) {
      setVerifyError("Informe o código recebido por e-mail");
      return;
    }

    setVerifying(true);

    try {
      await verifyEmail({ email, userType: role, code: code.trim() });
      // E-mail confirmado — agora sim completa o login com a mesma senha
      // que a pessoa já tinha digitado.
      await completeLogin();
    } catch (error) {
      const apiError = error as ApiError;
      setVerifyError(apiError.messages?.join(" ") ?? "Código inválido");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setResendMessage(null);
    setVerifyError(null);
    setResending(true);

    try {
      await resendVerification({ email, userType: role });
      setResendMessage("Enviamos um novo código para o seu e-mail.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      const apiError = error as ApiError;
      setVerifyError(
        apiError.messages?.join(" ") ?? "Não foi possível reenviar o código"
      );
    } finally {
      setResending(false);
    }
  }

  async function handleForgotSubmit(event: FormEvent) {
    event.preventDefault();
    setForgotError(null);

    if (!email.trim() || !isValidEmail(email)) {
      setForgotError("Informe um e-mail válido");
      return;
    }

    setForgotLoading(true);

    try {
      await forgotPassword({ email, userType: role });
      setForgotSent(true);
    } catch (error) {
      const apiError = error as ApiError;
      setForgotError(
        apiError.messages?.join(" ") ?? "Não foi possível enviar o link"
      );
    } finally {
      setForgotLoading(false);
    }
  }

  if (step === "forgot") {
    return (
      <Modal open={open} onClose={resetAndClose} title="Redefinir senha">
        {forgotSent ? (
          <div>
            <p className="text-sm text-[#586268]">
              Se existir uma conta com o e-mail{" "}
              <strong className="text-[#12233D]">{email}</strong>, enviamos um
              link pra você redefinir sua senha. Confira sua caixa de entrada.
            </p>
            <button
              type="button"
              onClick={() => setStep("login")}
              className="w-full bg-[#12233D] border-none text-white px-6 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#1B3350] transition-colors duration-150 mt-5"
            >
              Voltar para o login
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#586268] mb-5">
              Informe seu e-mail e o tipo de conta — vamos te mandar um link
              pra criar uma nova senha.
            </p>

            <RoleTabs value={role} onChange={setRole} />

            <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#12233D] mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full border border-[#C7D1CB] rounded-md px-3.5 py-2.5 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D]"
                  placeholder="voce@email.com"
                  autoFocus
                />
              </div>

              {forgotError && <p className="text-sm text-red-600">{forgotError}</p>}

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-[#12233D] border-none text-white px-6 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#1B3350] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {forgotLoading ? "Enviando..." : "Enviar link de redefinição"}
              </button>
            </form>

            <p className="text-sm text-[#586268] text-center mt-5">
              <button
                type="button"
                onClick={() => setStep("login")}
                className="text-[#586268] bg-transparent border-none cursor-pointer p-0 underline"
              >
                Voltar
              </button>
            </p>
          </>
        )}
      </Modal>
    );
  }

  if (step === "verify") {
    return (
      <Modal open={open} onClose={resetAndClose} title="Confirme seu e-mail">
        <p className="text-sm text-[#586268] mb-5">
          Sua conta ainda não foi verificada. Enviamos um código para{" "}
          <strong className="text-[#12233D]">{email}</strong> — digite abaixo
          para continuar.
        </p>

        <form onSubmit={handleVerifyAndLogin} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#12233D] mb-1.5">
              Código de verificação
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="w-full border border-[#C7D1CB] rounded-md px-3.5 py-2.5 text-sm text-[#12233D] tracking-[4px] text-center focus:outline-none focus:border-[#12233D]"
              placeholder="000000"
              autoFocus
            />
          </div>

          {verifyError && <p className="text-sm text-red-600">{verifyError}</p>}
          {resendMessage && (
            <p className="text-sm text-[#2F6E48]">{resendMessage}</p>
          )}

          <button
            type="submit"
            disabled={verifying}
            className="w-full bg-[#12233D] border-none text-white px-6 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#1B3350] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {verifying ? "Verificando..." : "Confirmar e entrar"}
          </button>
        </form>

        <p className="text-sm text-[#586268] text-center mt-5">
          Não recebeu?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="text-[#12233D] font-semibold bg-transparent border-none cursor-pointer p-0 underline disabled:no-underline disabled:text-[#586268] disabled:cursor-not-allowed"
          >
            {cooldown > 0
              ? `Reenviar em ${cooldown}s`
              : resending
              ? "Enviando..."
              : "Reenviar código"}
          </button>
        </p>

        <p className="text-sm text-[#586268] text-center mt-2">
          <button
            type="button"
            onClick={() => setStep("login")}
            className="text-[#586268] bg-transparent border-none cursor-pointer p-0 underline"
          >
            Voltar
          </button>
        </p>
      </Modal>
    );
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
          <PasswordInput
            value={password}
            onChange={(value) => {
              setPassword(value);
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
          <button
            type="button"
            onClick={() => setStep("forgot")}
            className="text-xs text-[#3E6990] font-medium bg-transparent border-none cursor-pointer p-0 mt-1.5 underline"
          >
            Esqueci minha senha
          </button>
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