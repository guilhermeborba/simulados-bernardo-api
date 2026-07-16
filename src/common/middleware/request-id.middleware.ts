import { randomUUID } from 'node:crypto';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export interface RequestWithRequestId extends Request {
  requestId?: string;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: RequestWithRequestId, response: Response, next: NextFunction) {
    const headerRequestId = request.header('x-request-id');
    request.requestId = headerRequestId || randomUUID();
    response.setHeader('x-request-id', request.requestId);
    next();
  }
}
