// A spec não documenta o formato de resposta desses endpoints (só "200 OK"
// sem schema), então tratamos o registro de forma flexível/defensiva.
export interface PaymentRecord {
  id?: string;
  status?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  paymentUrl?: string;
  [key: string]: unknown;
}

export interface RequestInitiatePaymentJason {
  serviceOrderId: string;
  method: string;
  payerEmail?: string;
  cardToken?: string;
  paymentMethodId?: string;
  installments?: number;
}