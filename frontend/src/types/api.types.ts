export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export type Pagination<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};