import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier', example: 1 })
  id: number;

  @Column({ name: 'first_name', length: 50 })
  @ApiProperty({ description: 'Ime korisnika', example: 'Marko' })
  firstName: string;

  @Column({ name: 'last_name', length: 50 })
  @ApiProperty({ description: 'Prezime korisnika', example: 'Petrović' })
  lastName: string;

  @Column({ unique: true, length: 100 })
  @ApiProperty({ description: 'Email adresa', example: 'marko@example.com' })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ name: 'password_reset_token', nullable: true })
  passwordResetToken?: string;

  @Column({ name: 'password_reset_expires', nullable: true })
  passwordResetExpires?: Date;

  @Column({ name: 'google_id', nullable: true, unique: true })
  @ApiProperty({ description: 'Google ID korisnika' })
  googleId?: string;

  @Column({ name: 'profile_picture', nullable: true })
  @ApiProperty({ description: 'URL profilne slike' })
  profilePicture?: string;

  @Column({
    type: 'enum',
    enum: ['local', 'google', 'hybrid'],
    default: 'local',
  })
  @ApiProperty({ description: 'Način autentifikacije' })
  authProvider: 'local' | 'google' | 'hybrid';

  @Column({ name: 'is_email_verified', default: false })
  @ApiProperty({ description: 'Da li je email verifikovan' })
  isEmailVerified: boolean;

  @Column({ name: 'email_verification_token', nullable: true })
  emailVerificationToken?: string;

  @Column({ name: 'email_verification_expires', nullable: true })
  emailVerificationExpires?: Date;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiProperty({ description: 'Datum kreiranja' })
  createdAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  }
}
