import { ValidationError } from 'class-validator';

export function formatValidationErrors(
  errors: ValidationError[],
): Record<string, unknown> {
  return errors.reduce(
    (acc: Record<string, unknown>, error) => {
      const constraints = Object.values(error.constraints || {});
      if (error.children && error.children.length > 0) {
        acc[error.property] = formatValidationErrors(error.children);
      } else {
        acc[error.property] = constraints;
      }
      return acc;
    },
    {} as Record<string, unknown>,
  );
}
