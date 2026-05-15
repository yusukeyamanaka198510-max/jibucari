export * from "./resume";

// ─── 汎用API応答型 ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// ─── ページネーション ─────────────────────────────────────────────────────────
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}

// ─── フォームバリデーションエラー ─────────────────────────────────────────────
export interface ValidationError {
  field: string;
  message: string;
}
