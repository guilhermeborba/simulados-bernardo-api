import { RequestIdMiddleware } from './request-id.middleware';

describe('RequestIdMiddleware', () => {
  it('uses incoming x-request-id when present', () => {
    const middleware = new RequestIdMiddleware();
    const request: { header: jest.Mock; requestId?: string } = {
      header: jest.fn().mockReturnValue('request-123'),
    };
    const response = {
      setHeader: jest.fn(),
    };
    const next = jest.fn();

    middleware.use(request as never, response as never, next);

    expect(request).toMatchObject({
      requestId: 'request-123',
    });
    expect(response.setHeader).toHaveBeenCalledWith('x-request-id', 'request-123');
    expect(next).toHaveBeenCalled();
  });

  it('generates request id when header is absent', () => {
    const middleware = new RequestIdMiddleware();
    const request: { header: jest.Mock; requestId?: string } = {
      header: jest.fn().mockReturnValue(undefined),
    };
    const response = {
      setHeader: jest.fn(),
    };
    const next = jest.fn();

    middleware.use(request as never, response as never, next);

    expect(typeof request.requestId).toBe('string');
    expect(response.setHeader).toHaveBeenCalledWith(
      'x-request-id',
      request.requestId,
    );
    expect(next).toHaveBeenCalled();
  });
});
