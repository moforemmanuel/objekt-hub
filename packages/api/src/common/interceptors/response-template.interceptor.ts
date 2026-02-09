import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

/**
 * Standard response envelope
 */
export interface ResponseEnvelope<T> {
  status: number;
  message: string;
  data: T | null;
}

/**
 * Default HTTP status messages
 */
const DEFAULT_MESSAGES: Record<number, string> = {
  200: 'Operation successful',
  201: 'Resource created successfully',
  204: 'Operation completed successfully',
  400: 'Bad request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Resource not found',
  500: 'Internal server error',
};

@Injectable()
export class ResponseTemplateInterceptor<T> implements NestInterceptor<
  T,
  ResponseEnvelope<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseEnvelope<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = response.statusCode;

    // Get custom message if set via @ResponseMessage decorator
    const customMessage = this.reflector.getAllAndOverride<string>(
      RESPONSE_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    return next.handle().pipe(
      map((data) => {
        const message =
          customMessage ||
          DEFAULT_MESSAGES[statusCode] ||
          (statusCode >= HttpStatus.BAD_REQUEST
            ? 'An error occurred'
            : 'Operation successful');

        return {
          status: statusCode,
          message,
          data: statusCode === HttpStatus.NO_CONTENT ? null : data,
        };
      }),
    );
  }
}

/**
 * Usage in controller:
 *
 * @Controller('users')
 * export class UsersController {
 *   @Get()
 *   @ResponseMessage('Users retrieved successfully')
 *   findAll() {
 *     return this.userService.findAll();
 *   }
 * }
 */
