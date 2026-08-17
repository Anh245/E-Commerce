import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../../commmon/guards/role.guard';

@ApiTags('users')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard , RoleGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //Lay profile user 

  // @Get('me')
  // @ApiOperation({summary:'Get current user profile'})
  // @ApiResponse({
  //   status:200,
  //   description:'Thong tin profile user hien tai',
  //   type:UseResponseDto,
  // })
}
