import { Module } from '@nestjs/common';
import { WebhookModule } from './modules/webhook/webhook.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './config/database/db.config';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // Cấu hình config để truy cập .env từ mọi file trong project
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Cấu hình rate limit 50 request trong 1 phút
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 50,
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfig,
    }),
    WebhookModule,
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
