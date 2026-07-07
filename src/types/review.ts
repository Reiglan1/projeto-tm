// Tipos baseados no OpenAPI da ProductClientHub.API (recurso Reviews)

export interface RequestCreateReviewJason {
  serviceOrderId: string;
  rating: number; // 1 a 5
  comment?: string;
}

export interface ResponseReviewJason {
  id: string;
  serviceOrderId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  revieweeId: string;
  revieweeName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ResponseAllReviewsJason {
  items: ResponseReviewJason[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  averageRating: number;
}