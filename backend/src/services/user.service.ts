// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { User } from '../entity/user.entity'; // Adjust the import path as necessary
import { UUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string, manager?: EntityManager) {
      const repo = manager ? manager.getRepository(User) : this.usersRepository;
      return repo.findOne({ where: { email } });
    }

  async findById(id: UUID, manager?:EntityManager): Promise<User | null> {
      const repo = manager ? manager.getRepository(User) : this.usersRepository;
      return repo.findOne({ where: { id } });  
    }
  
  async activate(id: UUID, manager?: EntityManager): Promise<User | null> {
    const repo = manager ? manager.getRepository(User) : this.usersRepository;
    const user = await repo.findOne({ where: { id } });
    if (user) {
      user.is_active = true;
      await repo.save(user);
    }
    return user;
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    const savedUser = await this.usersRepository.save(newUser);
    return savedUser;
  }
}
