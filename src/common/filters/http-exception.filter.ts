import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RequestWithRequestId } from '../middleware/request-id.middleware';

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  method: string;
  requestId?: string;
  timestamp: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<RequestWithRequestId>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;
    const body = this.buildBody(status, request, exceptionResponse);

    if (status >= 500) {
      this.logger.error(
        JSON.stringify({
          event: 'http_exception',
          requestId: request.requestId,
          method: request.method,
          path: request.originalUrl,
          statusCode: status,
        }),
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json(body);
  }

  private buildBody(
    status: number,
    request: Request,
    exceptionResponse: string | object | null,
  ): ErrorResponseBody {
    const responseObject =
      exceptionResponse && typeof exceptionResponse === 'object'
        ? (exceptionResponse as Record<string, unknown>)
        : {};
    const message =
      responseObject.message ??
      (typeof exceptionResponse === 'string'
        ? exceptionResponse
        : 'Internal server error');
    const error =
      typeof responseObject.error === 'string'
        ? responseObject.error
        : status >= 500
          ? 'Internal Server Error'
          : 'Request Error';

    return {
      statusCode: status,
      message: Array.isArray(message) ? message.map(String) : String(message),
      error,
      path: request.originalUrl,
      method: request.method,
      requestId: (request as RequestWithRequestId).requestId,
      timestamp: new Date().toISOString(),
    };
  }
}
