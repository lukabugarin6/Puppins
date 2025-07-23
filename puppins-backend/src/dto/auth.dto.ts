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
