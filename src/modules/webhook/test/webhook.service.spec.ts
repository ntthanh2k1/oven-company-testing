import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from '../webhook.service';
import {
  IWebhookRepository,
  WEBHOOK_REPOSITORY,
} from '../repositories/webhook-repository.interface';
import { Webhook } from '../entities/webhook.entity';
import { NotFoundException } from '@nestjs/common';

describe('WebhookService', () => {
  let service: WebhookService;
  let repository: jest.Mocked<IWebhookRepository>;

  // Mock data
  const mockWebhook: Webhook = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    source: 'github',
    event: 'push',
    payload: { ref: 'main' },
    receivedAt: new Date(),
  } as Webhook;

  // Mock repository
  const mockWebhookRepository = (): jest.Mocked<IWebhookRepository> => ({
    save: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    count: jest.fn(),
    clear: jest.fn(),
  });

  // Hàm này chạy trước mỗi test case
  // tạo instance WebhookService
  // Inject dependencies vào constructor
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        {
          provide: WEBHOOK_REPOSITORY,
          useFactory: mockWebhookRepository,
        },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
    repository = module.get(WEBHOOK_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });

  // Test create
  describe('Test create', () => {
    it('Should return create webhook successfully', async () => {
      repository.save.mockResolvedValue(mockWebhook);

      const result = await service.create({
        source: 'github',
        event: 'push',
        payload: { ref: 'main' },
      });

      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Create webhook successfully.',
        data: mockWebhook,
      });
    });
  });

  // Test getAll
  describe('Test getAll', () => {
    it('should return all webhooks', async () => {
      repository.getAll.mockResolvedValue([mockWebhook]);

      const result = await service.getAll();

      expect(repository.getAll).toHaveBeenCalled();
      expect(result).toEqual({
        data: [mockWebhook],
      });
    });
  });

  // Test getById
  describe('Test getById', () => {
    it('Should return webhook if found', async () => {
      repository.getById.mockResolvedValue(mockWebhook);

      const result = await service.getById(mockWebhook.id);

      expect(repository.getById).toHaveBeenCalledWith(mockWebhook.id);
      expect(result).toEqual({
        data: mockWebhook,
      });
    });

    it('Should return error if not found', async () => {
      repository.getById.mockResolvedValue(null);

      await expect(service.getById('not-exist-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // Test count
  describe('test count', () => {
    it('Should return total webhooks', async () => {
      repository.count.mockResolvedValue(10);

      const result = await service.count();

      expect(repository.count).toHaveBeenCalled();
      expect(result).toEqual({
        totalWebhooks: 10,
      });
    });
  });

  // Test clear webhooks
  describe('Test clear', () => {
    it('Should clear all webhooks', async () => {
      repository.clear.mockResolvedValue(undefined);

      const result = await service.clear();

      expect(repository.clear).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Clear webhooks successfully.',
      });
    });
  });
});
