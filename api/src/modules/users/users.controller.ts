import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../../commmon/guards/role.guard';
import { UserResponseDto } from './dto/user-response.dto';
import type { RequestWithUser } from '../../commmon/interfaces/request-with-user.interface';
import { Role } from 'prisma-client/client';
import { Roles } from '../../commmon/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser } from '../../commmon/decorators/get-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('users')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //Lay profile user

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Thong tin profile user hien tai',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getProfile(@Req() req: RequestWithUser): Promise<UserResponseDto> {
    return await this.usersService.findOne(req.user.id);
  }

  //Lay all user (chi admin co the truy cap)
  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'list of all user' })
  @ApiResponse({
    status: 200,
    description: 'List of all user',
    type: [UserResponseDto],
  })
  async findAll(): Promise<UserResponseDto[]> {
    return await this.usersService.findAll();
  }

  //Get user by Id (for ADMIN)
  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Lay thong tin user qua id' })
  @ApiResponse({
    status: 200,
    description: 'Thong tin user voi id ',
    type: [UserResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found',
  })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.usersService.findOne(id);
  }

  //Update user profile
  @Patch('me')
  @ApiOperation({ summary: 'update profile of user' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'The updated user profile',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'Not found',
  })
  @ApiResponse({ status: 409, description: 'Email da su dung' })
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return await this.usersService.update(userId, updateUserDto);
  }

  //change current password
  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @GetUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return await this.usersService.changePassword(userId, changePasswordDto);
  }

  //Delete current user account
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete current user password' })
  @ApiResponse({ status: 200, description: 'User is remove completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteAccount(
    @GetUser('id') userId: string,
  ): Promise<{ message: string }> {
    return this.usersService.delete(userId);
  }

  //delete user by Id for ADMIN
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiResponse({ status: 200, description: 'User is deleted by ADMIN' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    return this.usersService.delete(id);
  }
}
