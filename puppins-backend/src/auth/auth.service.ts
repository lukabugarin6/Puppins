import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from '../dto/auth.dto';
import { User } from '../entities/user.entity';
import { OAuth2Client } from 'google-auth-library';
@Injectable()
export class AuthService {
  private oAuth2Client: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    this.oAuth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: User; token: string }> {
    const user = await this.usersService.create(registerDto);
    const token = this.generateToken(user);

    // Ukloni password iz response-a
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      token,
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
      token,
    };
  }

  async googleAuth(idToken: string): Promise<{ user: User; token: string }> {
    const googleUser = await this.verifyGoogleToken(idToken);
    let user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (!user) {
      // Proveri da li korisnik postoji sa istim email-om
      const existingUser = await this.usersService.findByEmail(
        googleUser.email,
      );

      if (existingUser) {
        // Poveži Google nalog sa postojećim korisnikom
        user = await this.usersService.linkGoogleAccount(existingUser.id, {
          googleId: googleUser.googleId,
          profilePicture: googleUser.picture,
        });
      } else {
        // Kreiraj novog Google korisnika
        const [firstName, ...lastNameParts] = googleUser.name.split(' ');
        const lastName = lastNameParts.join(' ') || '';

        user = await this.usersService.createGoogleUser({
          email: googleUser.email,
          firstName,
          lastName,
          googleId: googleUser.googleId,
          profilePicture: googleUser.picture,
        });
      }
    }

    const token = this.generateToken(user);
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      token,
    };
  }

  private async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await this.oAuth2Client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Neispravan Google token');
      }

      return {
        googleId: payload.sub,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture,
        emailVerified: payload.email_verified,
      };
    } catch (error) {
      throw new UnauthorizedException('Neispravan Google token');
    }
  }

  private generateToken(user: User): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
}
