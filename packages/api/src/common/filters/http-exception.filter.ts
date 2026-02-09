import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string | Record<string, string[]> = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const exceptionName = exception.constructor.name;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errors = exceptionName; // Use exception name as error
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;

        // Handle validation errors - convert to field-based object
        if (Array.isArray(responseObj.message)) {
          // Validation errors - keep as object
          errors = this.parseValidationErrors(responseObj.message);
          message = 'Validation failed';
        } else if (responseObj.errors) {
          // Custom errors object provided
          if (
            typeof responseObj.errors === 'object' &&
            !Array.isArray(responseObj.errors)
          ) {
            errors = responseObj.errors;
          } else if (Array.isArray(responseObj.errors)) {
            errors = this.parseValidationErrors(responseObj.errors);
          } else {
            errors = String(responseObj.errors);
          }
        } else {
          // Simple exception - use exception name
          errors = exceptionName;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errors = exception.name;
      this.logger.error(
        `Unhandled Error: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error('Unknown exception', exception);
      errors = 'UnknownException';
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
    );

    // Send response
    response.status(status).json({
      status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private parseValidationErrors(errors: any[]): Record<string, string[]> {
    const parsed: Record<string, string[]> = {};

    errors.forEach((error) => {
      if (typeof error === 'string') {
        // Try to extract field name from error message
        const fieldMatch = error.match(/^(\w+)\s/);
        const field = fieldMatch ? fieldMatch[1] : 'general';

        if (!parsed[field]) {
          parsed[field] = [];
        }
        parsed[field].push(error);
      } else if (error && typeof error === 'object') {
        // If error is an object with property/field info
        const field: string = error.property || error.field || 'general';
        if (!parsed[field]) {
          parsed[field] = [];
        }

        // Get error message
        const msg: string = error.message || error.msg || JSON.stringify(error);
        parsed[field].push(msg);
      }
    });

    return parsed;
  }
}
