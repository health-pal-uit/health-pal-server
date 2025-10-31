import { IBackendRes } from 'src/interfaces/backend.interface';

export const responseHelper = <T>({
  data,
  message = '',
  error,
  statusCode = 200,
}: {
  data?: T;
  message?: string;
  error?: string | string[];
  statusCode?: number | string;
}): IBackendRes<T> => {
  return {
    data,
    message,
    error,
    statusCode,
  };
};
