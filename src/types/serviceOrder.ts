// Tipos baseados no OpenAPI da ProductClientHub.API (recurso ServiceOrders)

export interface RequestCreateServiceOrderJason {
  workerId: string;
  categoryId: string;
  description: string;
  scheduledAt: string; // ISO date-time
  value: number;
  address: string;
}

export interface ResponseServiceOrderJason {
  id: string;
  clientId: string;
  clientName: string;
  workerId: string;
  workerName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  scheduledAt: string;
  value: number;
  address: string;
  status: string;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResponseAllServiceOrdersJason {
  items: ResponseServiceOrderJason[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RequestCancelServiceOrderJason {
  cancellationReason: string;
}

export interface RequestUpdateServiceOrderStatusJason {
  status: string;
}