import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, CreateUserDto } from '../dto/auth.dto';
import { User } from '../entities/user.entity';
import { OAuth2Client } from 'google-auth-library';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private oAuth2Client: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {
    this.oAuth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    // Generiši verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // 24h

    // Kreiraj CreateUserDto sa dodatnim poljima
    const createUserDto: CreateUserDto = {
      ...registerDto,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isEmailVerified: false,
      authProvider: 'local',
    };

    const user = await this.usersService.createWithVerification(createUserDto);

    // Pošalji verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.firstName,
    );

    return {
      message: 'Registracija uspešna! Proveri svoj email za potvrdu naloga.',
    };
  }

  async verifyEmail(
    token: string,
  ): Promise<{ message: string; token?: string }> {
    const user = await this.usersService.findByVerificationToken(token);

    if (!user) {
      throw new UnauthorizedException('Neispravan verification token');
    }

    if (user.emailVerificationExpires < new Date()) {
      throw new UnauthorizedException('Verification token je istekao');
    }

    // Potvrdi email
    await this.usersService.verifyEmail(user.id);

    // Generiši JWT token za automatsku prijavu
    const jwtToken = this.generateToken(user);

    return {
      message: 'Email uspešno potvrđen! Dobrodošao/la!',
      token: jwtToken,
    };
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('Korisnik ne postoji');
    }

    if (user.isEmailVerified) {
      throw new ConflictException('Email je već potvrđen');
    }

    // Generiši novi token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    await this.usersService.updateVerificationToken(
      user.id,
      verificationToken,
      verificationExpires,
    );

    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.firstName,
    );

    return {
      message: 'Verification email je poslat ponovo.',
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user || !(await user.validatePassword(loginDto.password))) {
      throw new UnauthorizedException('Neispravni podaci za prijavu');
    }

    // Proveri da li je email potvrđen
    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Email nije potvrđen. Proveri svoju poštu ili zatraži novi verification email.',
      );
    }

    const token = this.generateToken(user);

    // Ukloni password iz response-a
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      token,
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // Ne otkrivaj da korisnik ne postoji (security best practice)
      return {
        message: 'Ako account sa ovim email-om postoji, poslat je reset link.',
      };
    }

    // Generiši password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 sat

    await this.usersService.updatePasswordResetToken(
      user.id,
      resetToken,
      resetExpires,
    );

    await this.emailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.firstName,
    );

    return {
      message: 'Ako account sa ovim email-om postoji, poslat je reset link.',
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByPasswordResetToken(token);

    if (!user) {
      throw new UnauthorizedException('Nevaljan reset token');
    }

    if (user.passwordResetExpires < new Date()) {
      throw new UnauthorizedException('Reset token je istekao');
    }

    await this.usersService.resetPassword(user.id, newPassword);

    return {
      message: 'Lozinka je uspešno promenjena!',
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
