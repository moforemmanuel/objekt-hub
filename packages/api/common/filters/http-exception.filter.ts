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
    let errors: Record<string, string[]> = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errors = { general: [exceptionResponse] };
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;

        // Handle validation errors - convert to field-based object
        if (Array.isArray(responseObj.message)) {
          // Convert array of validation errors to field-based object
          errors = this.parseValidationErrors(responseObj.message);
          message = 'Validation failed';
        } else if (responseObj.errors) {
          if (
            typeof responseObj.errors === 'object' &&
            !Array.isArray(responseObj.errors)
          ) {
            // Already in object format
            errors = responseObj.errors;
          } else if (Array.isArray(responseObj.errors)) {
            // Convert array to object format
            errors = this.parseValidationErrors(responseObj.errors);
          }
        } else if (responseObj.error) {
          if (
            typeof responseObj.error === 'object' &&
            !Array.isArray(responseObj.error)
          ) {
            errors = responseObj.error;
          } else if (Array.isArray(responseObj.error)) {
            errors = this.parseValidationErrors(responseObj.error);
          } else {
            errors = { general: [responseObj.error] };
          }
        } else {
          errors = { general: [message] };
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errors = { general: [exception.message] };
      this.logger.error(
        `Unhandled Error: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error('Unknown exception', exception);
      errors = { general: ['An unexpected error occurred'] };
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
    );

    // Send response
    response.status(status).json({
      status,
      message,
      errors:
        Object.keys(errors).length > 0
          ? errors
          : { general: ['An error occurred'] },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private parseValidationErrors(errors: any[]): Record<string, string[]> {
    const parsed: Record<string, string[]> = {};

    errors.forEach((error) => {
      if (typeof error === 'string') {
        // Try to extract field name from error message (e.g., "field must be required")
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
