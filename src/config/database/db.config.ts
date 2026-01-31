import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor() {}
  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    const host = process.env.DB_HOST;
    const port = Number(process.env.DB_PORT);
    const username = process.env.DB_USERNAME;
    const password = String(process.env.DB_PASSWORD);
    const database = process.env.DB_NAME;

    return {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      entities: [],
      synchronize: false,
      autoLoadEntities: false,
    };
  }
}
