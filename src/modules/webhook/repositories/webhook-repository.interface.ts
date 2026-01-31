import { CreateWebhookDto } from '../dto/create-webhook.dto';
import { Webhook } from '../entities/webhook.entity';

export interface IWebhookRepository {
  save(webhookDto: CreateWebhookDto): Promise<Webhook>;
  getAll(): Promise<Webhook[]>;
  getById(id: string): Promise<Webhook | null>;
  count(): Promise<number>;
  clear(): Promise<void>;
}

export const WEBHOOK_REPOSITORY = Symbol('IWebhookRepository');
