export interface IBackendRes<T> {
  error?: string | string[];
  message: string;
  statusCode: number;
  data?: T;
}
