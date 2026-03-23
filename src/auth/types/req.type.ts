export type AppRole = 'user' | 'admin' | 'expert';

export interface ReqUserType {
  id: string;
  email: string;
  role: AppRole;
}
