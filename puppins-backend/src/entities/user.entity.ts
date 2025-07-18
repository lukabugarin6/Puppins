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

  @Column()
  password: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ description: 'Datum kreiranja' })
  createdAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}