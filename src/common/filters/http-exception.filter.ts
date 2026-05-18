import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const HTTP_STATUS_CODES: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
    };

    let code = HTTP_STATUS_CODES[status] ?? 'INTERNAL_SERVER_ERROR';
    let message = '서버 오류가 발생했습니다.';

    if (status === 401) message = '인증이 필요합니다.';
    else if (status === 403) message = '접근 권한이 없습니다.';
    else if (status === 404) message = '요청한 리소스를 찾을 수 없습니다.';

    if (typeof exceptionResponse === 'string') {
      code = exceptionResponse;
      message = exceptionResponse;
    } else if (
      exceptionResponse !== null &&
      typeof exceptionResponse === 'object'
    ) {
      const res = exceptionResponse as Record<string, unknown>;
      if (res['code']) code = res['code'] as string;
      else if (
        res['error'] &&
        typeof res['error'] === 'string' &&
        res['error'] !== 'Unauthorized'
      ) {
        code = res['error'];
      }
      if (res['message'] && typeof res['message'] === 'string') {
        message = res['message'];
      } else if (Array.isArray(res['message'])) {
        code = 'VALIDATION_ERROR';
        message = (res['message'] as string[]).join(', ');
      }
    }

    if (status >= 500) {
      this.logger.error(
        `Unhandled exception: ${code} - ${message}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    } else if (!(exception instanceof HttpException)) {
      this.logger.warn(
        `Non-HTTP exception handled as ${status}: ${message}`,
        typeof exception === 'string' ? exception : JSON.stringify(exception),
      );
    }

    response.status(status).json({
      success: false,
      error: { code, message },
    });
  }
}
