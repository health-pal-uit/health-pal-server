import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { RoleLevel } from 'src/auth/enums/role-level.enum';

@Injectable()
export class ExpertSupabaseGuard extends AuthGuard('supabase') implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw new UnauthorizedException('Authentication required');
    }

    if ((user.roleLevel ?? 0) < RoleLevel.EXPERT) {
      throw new ForbiddenException('Expert access required');
    }

    return user;
  }
}
