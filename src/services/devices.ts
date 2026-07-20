import api from "./api";
import { normalizeError } from "./apiError";
import { RequestRegisterDeviceJason } from "@/types/device";

export async function registerDevice(
  payload: RequestRegisterDeviceJason
): Promise<void> {
  try {
    await api.post("/api/devices/register", payload);
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function unregisterDevice(token: string): Promise<void> {
  try {
    await api.delete("/api/devices", { params: { token } });
  } catch (error) {
    throw normalizeError(error);
  }
}
