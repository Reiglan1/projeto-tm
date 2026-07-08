// ATENÇÃO: confirmado com o backend (07/07) que o formato real é PascalCase
// (Cpf, Cnpj, Email, Phone, Random) — não tudo maiúsculo como CPF/CNPJ.
export const PIX_KEY_TYPES = {
  CPF: "Cpf",
  CNPJ: "Cnpj",
  EMAIL: "Email",
  PHONE: "Phone",
  RANDOM: "Random",
} as const;

export type PixKeyType = (typeof PIX_KEY_TYPES)[keyof typeof PIX_KEY_TYPES];

export const PIX_KEY_TYPE_OPTIONS: { value: PixKeyType; label: string }[] = [
  { value: PIX_KEY_TYPES.CPF, label: "CPF" },
  { value: PIX_KEY_TYPES.CNPJ, label: "CNPJ" },
  { value: PIX_KEY_TYPES.EMAIL, label: "E-mail" },
  { value: PIX_KEY_TYPES.PHONE, label: "Telefone" },
  { value: PIX_KEY_TYPES.RANDOM, label: "Chave aleatória" },
];