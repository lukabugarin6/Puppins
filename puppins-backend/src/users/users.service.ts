import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RegisterDto, UpdateUserDto } from '../dto/auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    // Proveri da li korisnik već postoji
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Korisnik sa ovim email-om već postoji');
    }

    const user = this.userRepository.create(registerDto);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { googleId } });
  }

  async createGoogleUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    googleId: string;
    profilePicture?: string;
  }): Promise<User> {
    const user = this.userRepository.create({
      ...userData,
      authProvider: 'google',
      isEmailVerified: true,
    });

    return this.userRepository.save(user);
  }

  async linkGoogleAccount(
    userId: number,
    googleData: {
      googleId: string;
      profilePicture?: string;
    },
  ): Promise<User> {
    await this.userRepository.update(userId, {
      ...googleData,
      authProvider: 'hybrid',
    });
    return this.findById(userId);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Korisnik nije pronađen');
    }

    // Proveri da li email već postoji (ako se menja)
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Korisnik sa ovim email-om već postoji');
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Korisnik nije pronađen');
    }

    await this.userRepository.delete(id);
  }
}
