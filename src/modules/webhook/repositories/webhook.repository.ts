import { Injectable } from '@nestjs/common';
import { CreateWebhookDto } from '../dto/create-webhook.dto';
import { Webhook } from '../entities/webhook.entity';
import { IWebhookRepository } from './webhook-repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class WebhookRepository implements IWebhookRepository {
  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepository: Repository<Webhook>,
  ) {}

  async save(webhookDto: CreateWebhookDto): Promise<Webhook> {
    return await this.webhookRepository.save(webhookDto);
  }

  async getAll(): Promise<Webhook[]> {
    return await this.webhookRepository.find();
  }

  async getById(id: string): Promise<Webhook | null> {
    return await this.webhookRepository.findOne({ where: { id } });
  }

  async count(): Promise<number> {
    return await this.webhookRepository.count();
  }

  async clear(): Promise<void> {
    return await this.webhookRepository.clear();
  }
}
