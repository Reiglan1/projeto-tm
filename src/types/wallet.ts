// A spec não documenta o formato de resposta desses endpoints (só "200 OK"
// sem schema), então tratamos os registros de forma flexível/defensiva.

export interface WalletBalance {
  [key: string]: unknown;
}

export interface WithdrawalRecord {
  id?: string;
  amount?: number;
  pixKey?: string;
  status?: string;
  result?: string;
  createdAt?: string;
  processedAt?: string;
  failureReason?: string;
  [key: string]: unknown;
}

export interface RequestWithdrawalJason {
  amount: number;
  pixKey: string;
}