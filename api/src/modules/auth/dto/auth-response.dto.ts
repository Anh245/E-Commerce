import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'prisma-client/client';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: '1',
      email: 'apha@example.com',
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      role: 'USER',
    },
  })
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: Role;
  };
}
