import { SetMetadata } from '@nestjs/common';

/**
 * Custom decorator to set response message
 */
export const RESPONSE_MESSAGE_KEY = 'RESPONSE_MESSAGE_KEY';

export const ResponseMessage = (message: string): MethodDecorator =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);
