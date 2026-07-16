import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  it('returns standardized error response with requestId', () => {
    const filter = new HttpExceptionFilter();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({ status }),
        getRequest: jest.fn().mockReturnValue({
          originalUrl: '/auth/login',
          method: 'POST',
          requestId: 'request-123',
        }),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(new BadRequestException('Invalid payload'), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Invalid payload',
        path: '/auth/login',
        method: 'POST',
        requestId: 'request-123',
      }),
    );
  });
});
