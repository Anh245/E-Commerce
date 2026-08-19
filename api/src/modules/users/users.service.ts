import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from 'prisma-client/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  private readonly SALT_ROUND = 10;
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        role: true,
        lastName: true,

        createdAt: true,
        updatedAt: true,

        password: false,
      },
    });

    if (!user) {
      throw new NotFoundException('Khong tim thay user');
    }
    return user;
  }

  //Get all user (for ADMIN)
  async findAll(): Promise<UserResponseDto[]> {
    const users: User[] = await this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  //Update profile user
  async update(userId: string, data: UpdateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) throw new NotFoundException('Khong tim thay user');

    if (data.email && data.email !== existingUser.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailTaken) {
        throw new NotFoundException('Email cap nhat da duoc su dung');
      }
    }

    //update user profile
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });

    return updatedUser;
  }

  //Change Password
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new NotFoundException('Khong tim thay user');
    const isPasswordValid = await bcrypt.compare(
      currentPassword!,
      user.password,
    );

    if (!isPasswordValid) {
      throw new NotFoundException('Mat khau khong dung');
    }

    //Check password moi khong duoc trung

    const isSamePassword = await bcrypt.compare(newPassword!, user.password);

    if (isPasswordValid) {
      throw new NotFoundException(
        'Mat khau moi khong duoc trung voi mat khau hien tai',
      );
    }

    //hash Password
    const hashedPassword = await bcrypt.hash(newPassword!, this.SALT_ROUND);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });
    return { message: 'Password duoc doi thanh cong' };
  }

  //delete password
  async delete(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('Khong tim thay user');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Da xoa thanh cong nguoi dung' };
  }
}
