// Validações usadas nos formulários de autenticação

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11) return false;
  // CPFs com todos os dígitos iguais (000.000.000-00, 111.111.111-11, ...) são inválidos
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const digits = cpf.split("").map(Number);

  function calcCheckDigit(base: number[]): number {
    let sum = 0;
    let multiplier = base.length + 1;
    for (const digit of base) {
      sum += digit * multiplier;
      multiplier -= 1;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  const firstCheck = calcCheckDigit(digits.slice(0, 9));
  const secondCheck = calcCheckDigit(digits.slice(0, 10));

  return firstCheck === digits[9] && secondCheck === digits[10];
}

export function isValidPhone(value: string): boolean {
  const phone = onlyDigits(value);
  // Aceita telefone fixo (10 dígitos) ou celular com 9º dígito (11 dígitos)
  return phone.length === 10 || phone.length === 11;
}

export interface PasswordRuleResult {
  label: string;
  valid: boolean;
}

export function checkPasswordRules(password: string): PasswordRuleResult[] {
  return [
    { label: "Pelo menos 8 caracteres", valid: password.length >= 8 },
    { label: "Uma letra maiúscula", valid: /[A-Z]/.test(password) },
    { label: "Uma letra minúscula", valid: /[a-z]/.test(password) },
    { label: "Um número", valid: /\d/.test(password) },
  ];
}

export function isValidPassword(password: string): boolean {
  return checkPasswordRules(password).every((rule) => rule.valid);
}

export function isValidCNPJ(value: string): boolean {
  const cnpj = onlyDigits(value);

  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const digits = cnpj.split("").map(Number);

  function calcCheckDigit(base: number[]): number {
    const weights =
      base.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = base.reduce((acc, digit, index) => acc + digit * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  const firstCheck = calcCheckDigit(digits.slice(0, 12));
  const secondCheck = calcCheckDigit(digits.slice(0, 13));

  return firstCheck === digits[12] && secondCheck === digits[13];
}

// Chave aleatória (EVP) do Pix: 32 caracteres hexadecimais, geralmente
// exibida no formato UUID (8-4-4-4-12).
export function isValidRandomPixKey(value: string): boolean {
  const cleaned = value.replace(/-/g, "");
  return /^[a-fA-F0-9]{32}$/.test(cleaned);
}

export function isValidPixKey(type: string, value: string): boolean {
  if (!value.trim()) return false;

  switch (type.toUpperCase()) {
    case "CPF":
      return isValidCPF(value);
    case "CNPJ":
      return isValidCNPJ(value);
    case "EMAIL":
      return isValidEmail(value);
    case "PHONE":
      return isValidPhone(value);
    case "RANDOM":
      return isValidRandomPixKey(value);
    default:
      return false;
  }
}