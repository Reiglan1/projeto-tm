// Tipos baseados no OpenAPI da ProductClientHub.API (recurso Devices)

export interface RequestRegisterDeviceJason {
  token: string;
  platform: string; // ex: "web" | "ios" | "android" (definido pelo back-end)
}
