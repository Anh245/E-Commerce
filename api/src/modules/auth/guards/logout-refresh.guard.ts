import { Injectable } from '@nestjs/common';
import { RefreshTokenGuard } from './refresh-token.guard';

@Injectable()
export class LogoutRefreshGuard extends RefreshTokenGuard {
  handleRequest<TUser>(_error: unknown, user: TUser): TUser {
    return user || (null as TUser);
  }
}
