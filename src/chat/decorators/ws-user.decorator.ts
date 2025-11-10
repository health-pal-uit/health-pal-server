import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { User } from 'src/users/entities/user.entity';

export const WsUser = createParamDecorator((data: unknown, ctx: ExecutionContext): User => {
  const client: Socket = ctx.switchToWs().getClient();
  return (client as any).user;
});
