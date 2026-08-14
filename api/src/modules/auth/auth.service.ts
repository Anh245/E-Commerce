import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      throw new ConflictException('Người dùng đã tồn tại!');
    }
    try {
      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          password: false,
        },
      });

      const tokens = await this.generateTokens(user.id, user.email);
      await this.updateRefreshToken(user.id, tokens.refreshToken);
      return {
        ...tokens,
        user,
      };
    } catch (error) {
      console.log('Loi khi dang ky tai khoan', error);
      throw new ConflictException('Loi khi dang ky tai khoan');
    }
  }

  //create Token
  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    //Implement for token generate
    const payload = { sub: userId, email };
    const refreshId = crypto.randomBytes(16).toString('hex');
    const [accessToken, refreshToken] = await Promise.all([
      //Thiet lap accessToken
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),

      //Thiet lap refreshToken
      this.jwtService.signAsync(
        { ...payload, refreshId },
        {
          expiresIn: '7d',
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  //Update refresh token trong database
  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken,
      },
    });
  }

  async refreshToken(userId: string): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Khong tim thay nguoi dung');
    }
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user,
    };
  }

  //LogOut

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: null,
      },
    });
  }
  //Login
  async login(loginDto: LoginDto) { 
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user || (await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email hoac mat khau khong dung');
    }
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
