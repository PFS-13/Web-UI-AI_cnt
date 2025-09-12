// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity'; // Adjust the import path as necessary

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }
  
  async activate(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (user) {
      user.is_active = true;
      await this.usersRepository.save(user);
    }
    return user;
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    const savedUser = await this.usersRepository.save(newUser);
    return savedUser;
  }
}
