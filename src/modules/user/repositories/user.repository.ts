import { Injectable } from '@nestjs/common';
import { IUserRepository } from './user-repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getUserBy(condition: Partial<User>): Promise<User | null> {
    return await this.userRepository.findOne({ where: condition });
  }
}
