import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshToKenStrategy } from './strategies/refresh-token.strategy';

const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';
const jwtExpiresIn = (process.env.JWT_EXPIRES_IN || '900') as any;

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtSecret,
      signOptions: { expiresIn: jwtExpiresIn },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [AuthService, JwtStrategy, RefreshToKenStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
