import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'Ime', example: 'Marko' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Prezime', example: 'Petrović' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Email adresa', example: 'marko@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Lozinka (minimum 6 karaktera)',
    example: 'password123',
    minimum: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
export class CreateUserDto extends RegisterDto {
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  isEmailVerified?: boolean;
  googleId?: string;
  profilePicture?: string;
  authProvider?: 'local' | 'google' | 'hybrid';
}

export class LoginDto {
  @ApiProperty({ description: 'Email adresa', example: 'marko@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Lozinka', example: 'password123' })
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto {
  @ApiProperty({ description: 'Ime', example: 'Marko', required: false })
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'Prezime', example: 'Petrović', required: false })
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Email adresa',
    example: 'marko@example.com',
    required: false,
  })
  @IsEmail()
  email?: string;
}
export class GoogleAuthDto {
  @IsString()
  @ApiProperty({ description: 'Google ID token' })
  idToken: string;
}

export class ResendVerificationDto {
  @ApiProperty({
    description: 'Email adresa za resend verification',
    example: 'marko@example.com',
  })
  @IsEmail()
  email: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email adresa za reset lozinke',
    example: 'marko@example.com',
  })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Reset token iz email-a',
    example: 'abc123def456...',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Nova lozinka (minimum 6 karaktera)',
    example: 'newpassword123',
    minimum: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
