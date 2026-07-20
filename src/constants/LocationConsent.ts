// Valores confirmados com o back-end (20/07) pro consentimento de
// localização do profissional.
export const LOCATION_CONSENT_SCOPE = {
  WHILE_IN_USE: "WhileInUse",
  ALWAYS: "Always",
} as const;

export type LocationConsentScope =
  (typeof LOCATION_CONSENT_SCOPE)[keyof typeof LOCATION_CONSENT_SCOPE];
