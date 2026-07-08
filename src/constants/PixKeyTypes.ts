// ATENÇÃO: a API não documenta um enum pros valores de pixKeyType (o schema
// aceita qualquer string). Os valores abaixo são uma suposição baseada em
// convenção comum de mercado — confirme com o backend os valores exatos
// aceitos antes de ir pra produção.
export const PIX_KEY_TYPES = {
  CPF: "CPF",
  CNPJ: "CNPJ",
  EMAIL: "EMAIL",
  PHONE: "PHONE",
  RANDOM: "RANDOM",
} as const;

export type PixKeyType = (typeof PIX_KEY_TYPES)[keyof typeof PIX_KEY_TYPES];

export const PIX_KEY_TYPE_OPTIONS: { value: PixKeyType; label: string }[] = [
  { value: PIX_KEY_TYPES.CPF, label: "CPF" },
  { value: PIX_KEY_TYPES.CNPJ, label: "CNPJ" },
  { value: PIX_KEY_TYPES.EMAIL, label: "E-mail" },
  { value: PIX_KEY_TYPES.PHONE, label: "Telefone" },
  { value: PIX_KEY_TYPES.RANDOM, label: "Chave aleatória" },
];