import type { FieldError as FormFieldError } from 'react-hook-form';

interface FieldErrorProps {
  id: string;
  error?: FormFieldError;
}

export const FieldError = ({ id, error }: FieldErrorProps) => {
  if (!error?.message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className="text-xs text-destructive"
    >
      {error.message}
    </p>
  );
};
