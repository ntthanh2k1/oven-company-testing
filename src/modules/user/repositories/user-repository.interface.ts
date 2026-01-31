import { User } from '../entities/user.entity';

export interface IUserRepository {
  getUserBy(condition: Partial<User>): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
