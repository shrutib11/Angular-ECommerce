export interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  errorMessage: string | null;
  result: T;
}