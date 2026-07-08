// Tipos baseados no OpenAPI da ProductClientHub.API (recurso ClientWallet)
// Diferente da carteira do worker (/api/wallet/*, usada pros repasses de
// serviço prestado), essa é a carteira pré-paga do cliente: ele deposita
// saldo aqui pra pagar chamados, e pode sacar o que sobrar.

export interface ResponseClientWalletTransactionJason {
  amount: number;
  type: string | null;
  description: string | null;
  createdAt: string;
}

export interface ResponseClientWalletJason {
  balance: number;
  transactions: ResponseClientWalletTransactionJason[] | null;
}

export interface RequestCreateDepositJason {
  amount: number;
}

export interface ResponseWalletDepositJason {
  id: string;
  amount: number;
  status: string | null;
  qrCode: string | null;
  ticketUrl: string | null;
  createdAt: string;
}

export interface RequestClientWithdrawalJason {
  amount: number;
}

export interface ResponseClientWithdrawalJason {
  id: string;
  amount: number;
  status: string | null;
  efiE2eId: string | null;
  lastError: string | null;
  createdAt: string;
}