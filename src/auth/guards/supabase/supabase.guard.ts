import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class SupabaseGuard extends AuthGuard('supabase') {
  constructor() {
    super();
  }
}
