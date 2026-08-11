import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if ()
  }
}
