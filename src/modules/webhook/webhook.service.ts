import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import {
  IWebhookRepository,
  WEBHOOK_REPOSITORY,
} from './repositories/webhook-repository.interface';
import { Webhook } from './entities/webhook.entity';

@Injectable()
export class WebhookService {
  constructor(
    @Inject(WEBHOOK_REPOSITORY)
    private readonly webhookRepository: IWebhookRepository,
  ) {}

  async create(
    createWebhookDto: CreateWebhookDto,
  ): Promise<{ message: string; data: Webhook }> {
    const newWebhook = await this.webhookRepository.save(createWebhookDto);

    return {
      message: 'Create webhook successfully.',
      data: newWebhook,
    };
  }

  async getAll(): Promise<{ data: Webhook[] }> {
    const webhooks = await this.webhookRepository.getAll();

    return {
      data: webhooks,
    };
  }

  async getById(id: string): Promise<{ data: Webhook | null }> {
    const webhook = await this.webhookRepository.getById(id);

    if (!webhook) {
      throw new NotFoundException('Webhook not found.');
    }

    return {
      data: webhook,
    };
  }

  async count(): Promise<{ totalWebhooks: number }> {
    const count = await this.webhookRepository.count();

    return {
      totalWebhooks: count,
    };
  }

  async clear(): Promise<{ message: string }> {
    await this.webhookRepository.clear();

    return { message: 'Clear webhooks successfully.' };
  }
}
