import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Webhook } from './entities/webhook.entity';

@Controller('webhooks')
@UseGuards(AuthGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  async create(
    @Body() createWebhookDto: CreateWebhookDto,
  ): Promise<{ message: string; data: Webhook }> {
    return await this.webhookService.create(createWebhookDto);
  }

  @Get()
  async getAll(): Promise<{ data: Webhook[] }> {
    return await this.webhookService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<{ data: Webhook | null }> {
    return await this.webhookService.getById(id);
  }

  @Get('count')
  async count(): Promise<{ totalWebhooks: number }> {
    return await this.webhookService.count();
  }

  @Delete(':id')
  async clear(): Promise<{ message: string }> {
    return await this.webhookService.clear();
  }
}
