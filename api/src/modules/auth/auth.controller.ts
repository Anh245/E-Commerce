import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import {
  AuthResponseDto,
  AuthSessionResponseDto,
} from './dto/auth-response.dto';
//import { RefreshToKenStrategy } from './strategies/refresh-token.strategy';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { GetUser } from '../../commmon/decorators/get-user.decorator';
import type { Response, Request } from 'express';
import { LogoutRefreshGuard } from './guards/logout-refresh.guard';
import { AuthOriginGuard } from './guards/auth-origin.guard';
import {
  REFRESH_COOKIE,
  REFRESH_TTL_MS,
  refreshCookieOptions,
} from './refresh-cookie';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
@UseGuards(AuthOriginGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //register api
  @Post('register')
  @ApiOperation({
    summary: 'create a new user',
    description: 'create a new user account',
    //type: AuthSessionResponseDto,
  })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: AuthSessionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'failed to create, user is exsists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 429,
    description: 'To many request, rate limit exceeded',
  })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.sessionResponse(await this.authService.register(dto), res);
  }

  //refresh
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  // Refresh authentication is cookie-only.
  @ApiOperation({
    summary: 'refresh access token',
    description: 'generate a new access token',
    //type: AuthResponseDto
  })
  @ApiResponse({
    status: 200,
    description: ' new access token generated successfully',
    type: AuthSessionResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access token expired or invalid',
  })
  @ApiResponse({
    status: 429,
    description: 'To many request, rate limit exceeded',
  })
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @GetUser('id') userId: string,
    @GetUser('refreshTokenHash') hash: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.sessionResponse(
      await this.authService.refreshToken(userId, hash),
      res,
    );
  }

  //Login
  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Login with email and password',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successfully',
    type: AuthSessionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email or password',
  })
  @ApiResponse({
    status: 429,
    description: 'To many request, rate limit exceeded',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.sessionResponse(await this.authService.login(dto), res);
  }

  //LogOut and invalidate refresh token
  @Post('logout')
  @UseGuards(LogoutRefreshGuard)
  @ApiOperation({
    summary: 'Log out',
    description: 'Log out account ',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access token expired or invalid',
  })
  @ApiResponse({
    status: 429,
    description: 'To many request, rate limit exceeded',
  })
  async logout(
    @Req() req: Request & { user?: { id: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    if (req.user) await this.authService.logout(req.user.id);
    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
    res.setHeader('Cache-Control', 'no-store');
    return { message: 'Logout successfully' };
  }
  private sessionResponse(session: AuthResponseDto, res: Response) {
    res.cookie(REFRESH_COOKIE, session.refreshToken, {
      ...refreshCookieOptions(),
      maxAge: REFRESH_TTL_MS,
    });
    res.setHeader('Cache-Control', 'no-store');
    return { accessToken: session.accessToken, user: session.user };
  }
}
