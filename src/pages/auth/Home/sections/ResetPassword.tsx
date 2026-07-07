import { FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthModal } from "@/context/AuthModalContext";
import { resetPassword, ApiError } from "@/services/auth";
import { checkPasswordRules, isValidPassword } from "@/utils/Validators";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { openLogin } = useAuthModal();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordRules = checkPasswordRules(newPassword);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("Link inválido ou expirado.");
      return;
    }

    if (!isValidPassword(newPassword)) {
      setError("A senha não atende aos requisitos abaixo.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword({ token, newPassword, confirmPassword });
      setSuccess(true);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.messages?.join(" ") ?? "Não foi possível redefinir sua senha");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-[#12233D] mb-2">
          Link inválido
        </h1>
        <p className="text-sm text-[#586268]">
          Esse link de redefinição de senha é inválido ou já expirou. Solicite
          um novo pela tela de login.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-[#12233D] mb-2">
          Senha redefinida!
        </h1>
        <p className="text-sm text-[#586268] mb-6">
          Sua senha foi alterada com sucesso. Já pode entrar com ela.
        </p>
        <button
          onClick={() => openLogin()}
          className="bg-[#12233D] border-none text-white px-6 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#1B3350] transition-colors duration-150"
        >
          Entrar agora
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-[#12233D] mb-2">
        Criar nova senha
      </h1>
      <p className="text-sm text-[#586268] mb-6">
        Escolha uma nova senha para acessar sua conta.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white border border-[#C7D1CB] rounded-xl p-6 flex flex-col gap-4"
      >
        <div>
          <label className="block text-sm font-medium text-[#12233D] mb-1.5">
            Nova senha
          </label>
          <input
            type="password"
            value={newPassword}
            onFocus={() => setPasswordFocused(true)}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full border border-[#C7D1CB] rounded-md px-3.5 py-2.5 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D]"
            placeholder="••••••••"
          />

          {(passwordFocused || newPassword.length > 0) && (
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
            Confirmar nova senha
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full border border-[#C7D1CB] rounded-md px-3.5 py-2.5 text-sm text-[#12233D] focus:outline-none focus:border-[#12233D]"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-[#12233D] border-none text-white px-6 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer hover:bg-[#1B3350] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Salvando..." : "Redefinir senha"}
        </button>
      </form>
    </div>
  );
}