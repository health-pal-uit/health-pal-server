export type AppRole = 'user' | 'admin';

export interface ReqUserType {
  id: string;
  email: string;
  role: AppRole;
}
