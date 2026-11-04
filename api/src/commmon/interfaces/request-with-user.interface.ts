import { Role } from '@prisma/client';
import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  refreshTokenHash?: string;
}

export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}
