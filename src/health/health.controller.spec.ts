import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: jest.Mocked<Pick<HealthService, 'checkDatabase'>>;

  beforeEach(async () => {
    healthService = {
      checkDatabase: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: healthService,
        },
      ],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  it('returns application health', () => {
    expect(controller.getHealth()).toMatchObject({
      status: 'ok',
      service: 'simulados-bernardo-api',
    });
  });

  it('returns readiness when database is available', async () => {
    healthService.checkDatabase.mockResolvedValue({ ok: true });

    await expect(controller.getReadiness()).resolves.toMatchObject({
      status: 'ready',
      checks: {
        database: 'up',
      },
    });
  });

  it('throws unavailable when database is down', async () => {
    healthService.checkDatabase.mockResolvedValue({ ok: false });

    await expect(controller.getReadiness()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
