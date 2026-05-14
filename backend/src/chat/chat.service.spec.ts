import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ChatGateway } from './chat.gateway';
import { XpService } from 'src/xp/xp.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { action_type_score } from '@prisma/client';

describe('ChatService', () => {
  let service: ChatService;

  const mockPrisma = {
    user: { findUnique: jest.fn() },
    chat: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    message: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    user_shop_item: {
      findMany: jest.fn(),
    },
  };

  const mockConfig = {
    getOrThrow: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  const mockGateway = {
    server: {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    },
  };

  const mockXp = {
    awardXp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
        { provide: ChatGateway, useValue: mockGateway },
        { provide: XpService, useValue: mockXp },
      ],
    }).compile();

    service = module.get(ChatService);

    jest.clearAllMocks();
  });

  // ---------------- CREATE CHAT ----------------
  describe('createChat', () => {
    it('should throw if user tries to chat with himself', async () => {
      await expect(service.createChat(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if recipient not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.createChat(1, 2)).rejects.toThrow(NotFoundException);
    });

    it('should return existing chat', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 2 });

      mockPrisma.chat.findUnique.mockResolvedValue({
        id: 1,
      });

      const result = await service.createChat(1, 2);

      expect(result).toEqual({ id: 1 });
    });

    it('should create new chat', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 2 });

      mockPrisma.chat.findUnique.mockResolvedValue(null);

      mockPrisma.chat.create.mockResolvedValue({ id: 10 });

      const result = await service.createChat(1, 2);

      expect(mockPrisma.chat.create).toHaveBeenCalled();
      expect(result).toEqual({ id: 10 });
    });
  });

  // ---------------- REMOVE CHAT ----------------
  describe('removeChat', () => {
    it('should throw if chat not found', async () => {
      mockPrisma.chat.findUnique.mockResolvedValue(null);

      await expect(service.removeChat(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw if user not participant', async () => {
      mockPrisma.chat.findUnique.mockResolvedValue({
        id: 1,
        first_user_id: 2,
        second_user_id: 3,
      });

      await expect(service.removeChat(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should delete chat', async () => {
      mockPrisma.chat.findUnique.mockResolvedValue({
        id: 1,
        first_user_id: 1,
        second_user_id: 2,
      });

      mockPrisma.chat.delete.mockResolvedValue({});

      const result = await service.removeChat(1, 1);

      expect(mockPrisma.chat.delete).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Chat removed successfully',
      });
    });
  });

  // ---------------- SEND MESSAGE ----------------
  describe('sendMessage', () => {
    it('should throw if chat not found', async () => {
      mockPrisma.chat.findUnique.mockResolvedValue(null);

      await expect(
        service.sendMessage(1, { chat_id: 1, text: 'hi' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should send message and emit event', async () => {
      mockPrisma.chat.findUnique.mockResolvedValue({
        id: 1,
        first_user_id: 1,
        second_user_id: 2,
      });

      mockPrisma.message.create.mockResolvedValue({
        id: 1,
        text_content: 'hi',
        is_read: false,
        chat_id: 1,
        created_at: new Date(),
        sender_id: 1,
        sender: {
          id: 1,
          username: 'user',
        },
      });

      mockPrisma.user_shop_item.findMany.mockResolvedValue([]);

      const result = await service.sendMessage(1, {
        chat_id: 1,
        text: 'hi',
      } as any);

      expect(mockGateway.server.to).toHaveBeenCalledWith('chat_1');
      expect(mockGateway.server.emit).toHaveBeenCalled();

      expect(mockXp.awardXp).toHaveBeenCalledWith(
        1,
        action_type_score.CREATE_MESSAGE,
      );

      expect(result.text_content).toBe('hi');
    });
  });

  // ---------------- UNREAD ----------------
  describe('getUnreadChatsCount', () => {
    it('should return count', async () => {
      mockPrisma.chat.count.mockResolvedValue(3);

      const result = await service.getUnreadChatsCount(1);

      expect(result).toBe(3);
    });
  });

  // ---------------- REMOVE MESSAGE ----------------
  describe('removeMessage', () => {
    it('should throw if message not found', async () => {
      mockPrisma.message.findUnique.mockResolvedValue(null);

      await expect(service.removeMessage(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete message', async () => {
      mockPrisma.message.findUnique.mockResolvedValue({
        id: 1,
        sender_id: 1,
        chat_id: 10,
      });

      mockPrisma.message.delete.mockResolvedValue({});

      const result = await service.removeMessage(1, 1);

      expect(result.chat_id).toBe(10);
    });
  });
});
