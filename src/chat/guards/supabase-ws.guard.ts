import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class SupabaseWsGuard implements CanActivate {
  private localSupabase;

  public constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    this.localSupabase = createClient(
      this.configService.get('SUPABASE_URL')!,
      this.configService.get('SUPABASE_KEY')!,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'ws') {
      return false;
    }
    const client: Socket = context.switchToWs().getClient();

    try {
      const r = await this.validateToken(client);
      if (!r) {
        Logger.warn('WebSocket connection denied: Invalid token');
        return false;
      }
      Logger.log('WebSocket connection established:', client.id);
      return true;
    } catch (error) {
      Logger.error('WebSocket connection error:', error);
      return false;
    }
  }

  private async validateToken(client: Socket): Promise<boolean> {
    const { authorization } = client.handshake.headers;
    Logger.log('WebSocket connection attempt with authorization header:', authorization);

    if (!authorization) {
      return false;
    }

    const token = authorization?.split(' ')[1];

    const { data, error } = await this.localSupabase.auth.getUser(token);
    if (error || !data?.user) {
      return false;
    }
    const user = await this.userService.findOneByEmail(data.user.email!);
    if (!user) {
      return false;
    }

    // Attach user to socket for later use
    (client as any).user = user;

    return true;
  }
}
