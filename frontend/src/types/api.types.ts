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
  data: T[];
  page: number;
  limit: number;
};