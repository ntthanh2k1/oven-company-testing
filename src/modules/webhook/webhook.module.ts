import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Webhook } from './entities/webhook.entity';
import { WEBHOOK_REPOSITORY } from './repositories/webhook-repository.interface';
import { WebhookRepository } from './repositories/webhook.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Webhook]), UserModule],
  controllers: [WebhookController],
  providers: [
    WebhookService,
    {
      provide: WEBHOOK_REPOSITORY,
      useClass: WebhookRepository,
    },
  ],
})
export class WebhookModule {}
