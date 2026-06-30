import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';
import { WechatConfig } from '../../../config/wechat.config';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockUserRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-token'),
    verify: jest.fn().mockReturnValue({ sub: 1, openid: 'dev_Test', role: 'both' }),
  };

  const mockWechatConfig = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: WechatConfig, useValue: mockWechatConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('dev login', () => {
    it('should create a new dev user and return JWT token', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue({ id: 1, openid: 'dev_Test', nickname: 'Test' });
      mockUserRepo.save.mockResolvedValue({ id: 1 });

      const result = await service.login('dev_Test', 'Tester');
      expect(result.accessToken).toBe('test-token');
      expect(result.user.nickname).toBe('Test');
    });

    it('should return existing dev user without creating', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 2, openid: 'dev_Test', nickname: 'Test' });

      const result = await service.login('dev_Test', 'Tester');
      expect(result.accessToken).toBe('test-token');
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });

    it('should use nicknamed code as name for dev login', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue({ id: 1, openid: 'dev_Tester', nickname: 'Tester' });
      mockUserRepo.save.mockResolvedValue({ id: 1 });

      const result = await service.login('dev_Tester');
      // user.nickname should come from code.replace('dev_', '')
      expect(result.user.nickname).toBe('Tester');
    });
  });

  describe('token refresh', () => {
    it('should issue a new token for valid user', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 1, openid: 'dev_Test' });

      const result = await service.refresh(1);
      expect(result.accessToken).toBe('test-token');
    });

    it('should throw UnauthorizedException for invalid user', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.refresh(999)).rejects.toThrow(UnauthorizedException);
    });
  });
});
