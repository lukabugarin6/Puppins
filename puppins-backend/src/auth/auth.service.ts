import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from '../dto/auth.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; token: string }> {
    const user = await this.usersService.create(registerDto);
    const token = this.generateToken(user);
    
    // Ukloni password iz response-a
    const { password, ...userWithoutPassword } = user;
    
    return { 
      user: userWithoutPassword as User, 
      token 
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user || !(await user.validatePassword(loginDto.password))) {
      throw new UnauthorizedException('Neispravni podaci za prijavu');
    }

    const token = this.generateToken(user);
    
    // Ukloni password iz response-a
    const { password, ...userWithoutPassword } = user;
    
    return { 
      user: userWithoutPassword as User, 
      token 
    };
  }

  private generateToken(user: User): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
}