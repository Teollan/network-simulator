import type {
  FieldError as FormFieldError,
  UseFormRegisterReturn,
} from 'react-hook-form';
import { FieldError } from '@/components/ui/form/FieldError';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface NumberFieldProps {
  id: string;
  label: string;
  error?: FormFieldError;
  registration: UseFormRegisterReturn;
  min?: number;
  step?: number | 'any';
}

export const NumberField = ({
  id,
  label,
  error,
  registration,
  min = 0,
  step = 'any',
}: NumberFieldProps) => (
  <div className="flex flex-col gap-2">
    <Label htmlFor={id}>
      {label}
    </Label>

    <Input
      id={id}
      type="number"
      min={min}
      step={step}
      aria-invalid={!!error}
      aria-describedby={`${id}-error`}
      {...registration}
    />

    <FieldError
      id={`${id}-error`}
      error={error}
    />
  </div>
);
