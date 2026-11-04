import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { createHash } from 'node:crypto';
import { readRefreshCookie } from '../refresh-cookie';

@Injectable()
export class RefreshToKenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: readRefreshCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-change-me',
      passReqToCallback: true,
    });
  }

  //set validate
  async validate(req: Request, payload: { sub: string; email: string }) {
    // Get refreshToken tu request
    //const authtest = req.headers['authorization'];
    const refreshToken = readRefreshCookie(req);

    if (!refreshToken) {
      throw new UnauthorizedException('Khong tim thay token');
    }

    //Lay thong tin user
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        refreshToken: true,
      },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException(
        'Khong tim thay nguoi dung hoac token khong ton tai',
      );
    }
    const MatchRefreshToken = await bcrypt.compare(
      createHash('sha256').update(refreshToken).digest('hex'),
      user.refreshToken,
    );
    if (!MatchRefreshToken) {
      throw new UnauthorizedException('Token khong hop le');
    }

    return {
      id: user.id,
      email: user.email,

      role: user.role,
      refreshTokenHash: user.refreshToken,
    };
  }
}
