// A spec não documenta o formato de resposta desses endpoints (só "200 OK"
// sem schema), então tratamos o registro de forma flexível/defensiva.
export interface VerificationRecord {
  id?: string;
  status?: string;
  decision?: string;
  reason?: string;
  createdAt?: string;
  reviewedAt?: string;
  [key: string]: unknown;
}

export interface VerificationFiles {
  documentFront: File;
  documentBack: File;
  selfie: File;
}