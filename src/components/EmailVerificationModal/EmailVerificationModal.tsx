import { FormEvent, useEffect, useState } from "react";
import Modal from "@/components/Modal/Modal";
import { verifyEmail, resendVerification, ApiError } from "@/services/auth";
import { UserRole } from "@/types/auth";

const RESEND_COOLDOWN_SECONDS = 30;

interface EmailVerificationModalProps {
  open: boolean;
  email: string;
  role: UserRole;
  onClose: () => void;
  onVerified: () => void;
}

export default function EmailVerificationModal({
  open,
  email,
  role,
  onClose,
  onVerified,
}: EmailVerificationModalProps) {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!open) {
      setCode("");
      setError(null);
      setResendMessage(null);
      setCooldown(0);
    }
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timeout = setTimeout(() => setCooldown((current) => current - 1), 1000);
    return () => clearTimeout(timeout);
  }, [cooldown]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError("Informe o código recebido por e-mail");
      return;
    }

    setVerifying(true);

    try {
      await verifyEmail({ email, userType: role, code: code.trim() });
      onVerified();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.messages?.join(" ") ?? "Código inválido");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setResendMessage(null);
    setError(null);
    setResending(true);

    try {
      await resendVerification({ email, userType: role });
      setResendMessage("Enviamos um novo código para o seu e-mail.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.messages?.join(" ") ?? "Não foi possível reenviar o código");
    } finally {
      setResending(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Confirme seu e-mail">
      <p className="text-sm text-[#3A3A3A] mb-5">
        Enviamos um código de verificação para{" "}
        <strong className="text-[#0A0A0A]">{email}</strong>. Digite abaixo
        para confirmar.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
            Código de verificação
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="w-full border border-[#D9D6D0] rounded-md px-3.5 py-2.5 text-sm text-[#0A0A0A] tracking-[4px] text-center focus:outline-none focus:border-[#0A0A0A]"
            placeholder="000000"
            autoFocus
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {resendMessage && (
          <p className="text-sm text-[#1F8A5B]">{resendMessage}</p>
        )}

        <button
          type="submit"
          disabled={verifying}
          className="w-full bg-[#0A0A0A] border-none text-white px-6 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#242424] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {verifying ? "Verificando..." : "Confirmar"}
        </button>
      </form>

      <p className="text-sm text-[#3A3A3A] text-center mt-5">
        Não recebeu?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="text-[#0A0A0A] font-semibold bg-transparent border-none cursor-pointer p-0 underline disabled:no-underline disabled:text-[#3A3A3A] disabled:cursor-not-allowed"
        >
          {cooldown > 0
            ? `Reenviar em ${cooldown}s`
            : resending
            ? "Enviando..."
            : "Reenviar código"}
        </button>
      </p>
    </Modal>
  );
}