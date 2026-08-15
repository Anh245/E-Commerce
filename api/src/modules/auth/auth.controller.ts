import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
//import { RefreshToKenStrategy } from './strategies/refresh-token.strategy';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { GetUser } from '../../commmon/decorators/get-user.decorator';
import { JwtAuthGuard } from './guards/jwt.guard';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //register api
  @Post('register')
  @ApiOperation({
    summary: 'create a new user',
    description: 'create a new user account',
    //type: AuthResponseDto,
  })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: AuthResponseDto,
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
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return await this.authService.register(registerDto);
  }

  //refresh
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('refreshtoken-jwt-auth')
  @ApiOperation({
    summary: 'refresh access token',
    description: 'generate a new access token',
    //type: AuthResponseDto
  })
  @ApiResponse({
    status: 200,
    description: ' new access token generated successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access token expired or invalid',
  })
  @ApiResponse({
    status: 429,
    description: 'To many request, rate limit exceeded',
  })
  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(@GetUser('id') userId: string): Promise<AuthResponseDto> {
    return await this.authService.refreshToken(userId);
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
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email or password',
  })
  @ApiResponse({
    status: 429,
    description: 'To many request, rate limit exceeded',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  //LogOut and invalidate refresh token
  @Post('logout')
  @UseGuards(JwtAuthGuard)
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
  async logout(@GetUser('id') userId: string) {
    await this.authService.logout(userId);
    return { message: 'Logout successfully' };
  }
}
