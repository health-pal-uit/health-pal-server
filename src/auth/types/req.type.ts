import { RoleLevel } from 'src/auth/enums/role-level.enum';

export type AppRole = 'user' | 'admin' | 'expert';

export interface ReqUserType {
  id: string;
  email: string;
  role: AppRole;
  roleLevel: RoleLevel;
}
