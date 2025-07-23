import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Put,
  Delete,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import {
  RegisterDto,
  LoginDto,
  UpdateUserDto,
  GoogleAuthDto,
} from '../dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registracija novog korisnika' })
  @ApiResponse({ status: 201, description: 'Korisnik uspešno registrovan' })
  @ApiResponse({ status: 409, description: 'Korisnik već postoji' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Prijava korisnika' })
  @ApiResponse({ status: 200, description: 'Uspešna prijava' })
  @ApiResponse({ status: 401, description: 'Neispravni podaci' })
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

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dobij podatke o trenutnom korisniku' })
  @ApiResponse({ status: 200, description: 'Podaci o korisniku' })
  async getProfile(@Request() req) {
    const { password, ...userWithoutPassword } = req.user;
    return userWithoutPassword;
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
