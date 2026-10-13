import {
  Controller,
  INestApplication,
  Logger,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import * as request from 'supertest';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import { AuditInterceptor } from '../src/modules/audit/audit.interceptor';
import { AuditService } from '../src/modules/audit/audit.service';

@Controller()
class SyntheticRecoveryController {
  @Post('auth/reset-password')
  reset() {
    return { success: true };
  }
  @Post('synthetic/unavailable')
  unavailable() {
    throw new ServiceUnavailableException('Temporarily unavailable');
  }
}

// Uses the real Express/Nest pipeline and production interceptors/filter, with
// synthetic operations only. No mail provider, account or existing DB is touched.
describe('Request observability excludes recovery material (Nest + HTTP)', () => {
  let app: INestApplication;
  let logs: jest.SpyInstance;
  let errors: jest.SpyInstance;
  const audit = { create: jest.fn().mockResolvedValue(undefined) };
  const canary = 'synthetic-private-query-canary';
  beforeAll(async () => {
    logs = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    errors = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const moduleRef = await Test.createTestingModule({
      controllers: [SyntheticRecoveryController],
    }).compile();
    app = moduleRef.createNestApplication();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      Object.assign(req, {
        requestId: 'synthetic-request',
        user: { id: 'synthetic-admin', role: UserRole.ADMIN },
      });
      next();
    });
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new AuditInterceptor(audit as unknown as AuditService),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.listen(0, '127.0.0.1');
  });
  beforeEach(() => {
    logs.mockClear();
    errors.mockClear();
    audit.create.mockClear();
  });
  afterAll(async () => {
    await app.close();
    logs.mockRestore();
    errors.mockRestore();
  });

  it('omits URL and body secrets from successful reset logs and audit records', async () => {
    const response = await request(app.getHttpServer())
      .post(`/auth/reset-password?token=${canary}&password=${canary}`)
      .send({ token: canary, password: canary })
      .expect(201);
    expect(response.body).toEqual({ success: true });
    expect(JSON.stringify(logs.mock.calls)).not.toContain(canary);
    expect(JSON.stringify(audit.create.mock.calls)).not.toContain(canary);
    expect(audit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/auth/reset-password',
        metadata: { params: {} },
      }),
    );
    const record = logs.mock.calls.find(
      ([line]) => typeof line === 'string' && line.includes('http_request'),
    );
    expect(JSON.parse(record![0] as string)).toMatchObject({
      path: '/auth/reset-password',
    });
  });
  it('omits URL secrets from failures, error bodies and failed audit records', async () => {
    const response = await request(app.getHttpServer())
      .post(`/synthetic/unavailable?token=${canary}&email=${canary}`)
      .send({ token: canary })
      .expect(503);
    expect(response.body.path).toBe('/synthetic/unavailable');
    expect(JSON.stringify(response.body)).not.toContain(canary);
    expect(JSON.stringify(errors.mock.calls)).not.toContain(canary);
    expect(JSON.stringify(audit.create.mock.calls)).not.toContain(canary);
    expect(audit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'post /synthetic/unavailable_failed',
        path: '/synthetic/unavailable',
        metadata: { params: {} },
      }),
    );
  });
});
