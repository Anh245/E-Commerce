import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';

@Injectable()
export class RefreshToKenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-change-me',
      passReqToCallback: true,
    });
  }

  //set validate
  async validate(req: Request, payload: { sub: string; email: string }) {
    console.log('validate RefreshToken is called');
    console.log(payload);

    // Get refreshToken tu request
    //const authtest = req.headers['authorization'];
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('Khong tim thay token');
      throw new UnauthorizedException('Khong tim thay token');
    }
    const refreshToken = authHeader.split(' ')[1];

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
      refreshToken,
      user.refreshToken,
    );
    if (!MatchRefreshToken) {
      throw new UnauthorizedException('Token khong hop le');
    }

    return {
      id: user.id,
      email: user.email,

      role: user.role,
    };
  }
}
