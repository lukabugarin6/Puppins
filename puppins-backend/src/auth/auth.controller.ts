// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Put,
  Delete,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { join } from 'path';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import {
  RegisterDto,
  LoginDto,
  UpdateUserDto,
  GoogleAuthDto,
  ResetPasswordDto,
  ForgotPasswordDto,
} from '../dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Prijava korisnika' })
  @ApiResponse({ status: 200, description: 'Uspešna prijava' })
  @ApiResponse({
    status: 401,
    description: 'Neispravni podaci ili email nije potvrđen',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('google')
  @ApiOperation({ summary: 'Prijava putem Google naloga' })
  @ApiResponse({ status: 200, description: 'Uspešna prijava' })
  @ApiResponse({ status: 401, description: 'Nevaljan Google token' })
  async googleAuth(@Body() googleAuthDto: GoogleAuthDto) {
    return this.authService.googleAuth(googleAuthDto.idToken);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registracija novog korisnika' })
  @ApiResponse({
    status: 201,
    description: 'Korisnik uspešno registrovan - email verification potreban',
    schema: {
      example: {
        message: 'Registracija uspešna! Proveri svoj email za potvrdu naloga.',
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Korisnik već postoji' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Pošalji verification email ponovo' })
  @ApiResponse({
    status: 200,
    description: 'Verification email poslat ponovo',
    schema: {
      example: {
        message: 'Verification email je poslat ponovo.',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Korisnik ne postoji' })
  @ApiResponse({ status: 409, description: 'Email je već potvrđen' })
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerification(body.email);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Zatraži reset lozinke' })
  @ApiResponse({
    status: 200,
    description: 'Reset email poslat',
    schema: {
      example: {
        message: 'Ako account sa ovim email-om postoji, poslat je reset link.',
      },
    },
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Resetuj lozinku' })
  @ApiResponse({
    status: 200,
    description: 'Lozinka uspešno promenjena',
    schema: {
      example: {
        message: 'Lozinka je uspešno promenjena!',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Nevaljan ili istekao token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dobij podatke o trenutnom korisniku' })
  @ApiResponse({ status: 200, description: 'Podaci o korisniku' })
  async getProfile(@Request() req) {
    const { password, ...userWithoutPassword } = req.user;
    return userWithoutPassword;
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Potvrdi email adresu' })
  @ApiQuery({
    name: 'token',
    description: 'Email verification token',
    example: 'abc123def456...',
  })
  @ApiResponse({
    status: 200,
    description: 'Email uspešno potvrđen',
    schema: {
      example: {
        message: 'Email uspešno potvrđen! Dobrodošao/la!',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Nevaljan ili istekao token' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Get('verify-email-page')
  @ApiOperation({ summary: 'Web stranica za verifikaciju email-a' })
  verifyEmailPage(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'verify-email.html'));
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ažuriraj podatke korisnika' })
  @ApiResponse({ status: 200, description: 'Podaci uspešno ažurirani' })
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.update(
      req.user.id,
      updateUserDto,
    );
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('account')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obriši korisnički nalog' })
  @ApiResponse({ status: 200, description: 'Nalog uspešno obrisan' })
  async deleteAccount(@Request() req) {
    await this.usersService.delete(req.user.id);
    return { message: 'Nalog je uspešno obrisan' };
  }
}
