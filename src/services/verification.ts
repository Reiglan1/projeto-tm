import { AxiosError } from "axios";
import api from "./api";
import { normalizeError } from "./apiError";
import { UserRole } from "@/types/auth";
import { VerificationFiles, VerificationRecord } from "@/types/verification";

function basePath(role: UserRole): string {
  return role === "client"
    ? "/api/clients/verifications"
    : "/api/workers/verifications";
}

export async function getMyVerification(
  role: UserRole
): Promise<VerificationRecord | null> {
  try {
    const { data } = await api.get(`${basePath(role)}/me`);

    if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
      return null;
    }

    return data as VerificationRecord;
  } catch (error) {
    const axiosError = error as AxiosError;
    // A API não documenta um 404 pra "ainda não enviou verificação", mas
    // tratamos esse caso como "nenhum registro" pra não travar a tela.
    if (axiosError?.response?.status === 404) {
      return null;
    }
    throw normalizeError(error);
  }
}

export async function submitVerification(
  role: UserRole,
  files: VerificationFiles
): Promise<void> {
  const formData = new FormData();
  formData.append("documentFront", files.documentFront);
  formData.append("documentBack", files.documentBack);
  formData.append("selfie", files.selfie);

  try {
    await api.post(basePath(role), formData);
  } catch (error) {
    throw normalizeError(error);
  }
}