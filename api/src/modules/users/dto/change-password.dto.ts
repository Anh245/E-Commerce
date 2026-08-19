import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password for the user',
    example: 'abc@123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password must not be empty' })
  currentPassword?: string;

  @ApiProperty({
    description: 'New password for the user',
    example: 'xyz@345',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'New password must not be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: 'ít nhất 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt',
    },
  )
  newPassword?: string;
}
