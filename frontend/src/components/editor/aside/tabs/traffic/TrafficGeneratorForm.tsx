import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Trash2,
} from 'lucide-react';
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import { z } from 'zod';
import { FieldError } from '@/components/ui/form/FieldError';
import { NumberField } from '@/components/ui/form/NumberField';
import {
  DEFAULT_MESSAGE_SIZE,
  TRAFFIC_GENERATOR_KIND_LABEL,
  type TrafficGeneratorFormValues,
} from '@/components/editor/aside/tabs/traffic/trafficGeneratorForm';
import { Button } from '@/components/ui/Button';
import {
  DialogClose,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import type { Node } from '@/modules/network/node/Node';
import type {
  TrafficGeneratorConfig,
  TrafficGeneratorKind,
} from '@/modules/traffic/generator/generator.typedefs';
import { trafficGeneratorSchema } from '@/modules/traffic/generator/trafficGenerator.schema';

// The form holds every kind's fields at once (see TrafficGeneratorFormValues), a superset
// of the schema's input; the schema picks the chosen kind's fields and strips the rest
const trafficGeneratorFormSchema = z.custom<TrafficGeneratorFormValues>()
  .transform((values): z.input<typeof trafficGeneratorSchema> => values)
  .pipe(trafficGeneratorSchema);

const TRAFFIC_GENERATOR_KINDS = Object.keys(TRAFFIC_GENERATOR_KIND_LABEL) as TrafficGeneratorKind[];
const UNIFORM_DESTINATION = 'uniform';

const toSelectValue = (id: number) => (Number.isNaN(id) ? '' : `${id}`);

interface TrafficGeneratorFormProps {
  workstations: Node[];
  defaultValues: TrafficGeneratorFormValues;
  onSubmit: (config: TrafficGeneratorConfig) => void;
}

export const TrafficGeneratorForm = ({
  workstations,
  defaultValues,
  onSubmit,
}: TrafficGeneratorFormProps) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrafficGeneratorFormValues, unknown, TrafficGeneratorConfig>({
    resolver: zodResolver(trafficGeneratorFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    fields: transmissionFields,
    append: appendTransmission,
    remove: removeTransmission,
  } = useFieldArray({
    control,
    name: 'transmissions',
  });

  const kind = useWatch({
    control,
    name: 'kind',
  });
  const sourceId = useWatch({
    control,
    name: 'sourceId',
  });
  const sizeKind = useWatch({
    control,
    name: 'size.kind',
  });

  const destinations = workstations.filter(({ id }) => id !== sourceId);

  const renderDestinationItems = () => destinations.map(({
    id,
    label,
  }) => (
    <SelectItem
      key={id}
      value={`${id}`}
    >
      {label}
    </SelectItem>
  ));

  return (
    <form
      className="flex flex-col gap-3"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="traffic-source">
            Source
          </Label>

          <Controller
            name="sourceId"
            control={control}
            render={({ field }) => (
              <Select
                value={toSelectValue(field.value)}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger
                  id="traffic-source"
                  className="w-full"
                  aria-invalid={!!errors.sourceId}
                  onBlur={field.onBlur}
                >
                  <SelectValue placeholder="Pick a workstation" />
                </SelectTrigger>

                <SelectContent>
                  {workstations.map(({
                    id,
                    label,
                  }) => (
                    <SelectItem
                      key={id}
                      value={`${id}`}
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <FieldError
            id="traffic-source-error"
            error={errors.sourceId}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="traffic-kind">
            Kind
          </Label>

          <Controller
            name="kind"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="traffic-kind"
                  className="w-full"
                  onBlur={field.onBlur}
                >
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {TRAFFIC_GENERATOR_KINDS.map((generatorKind) => (
                    <SelectItem
                      key={generatorKind}
                      value={generatorKind}
                    >
                      {TRAFFIC_GENERATOR_KIND_LABEL[generatorKind]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {kind === 'periodic' && (
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            id="traffic-period"
            label="Period"
            error={errors.period}
            registration={register('period', { valueAsNumber: true })}
          />

          <NumberField
            id="traffic-phase"
            label="Phase"
            error={errors.phase}
            registration={register('phase', { valueAsNumber: true })}
          />
        </div>
      )}

      {kind === 'poisson' && (
        <NumberField
          id="traffic-rate"
          label="Rate, messages per time unit"
          error={errors.rate}
          registration={register('rate', { valueAsNumber: true })}
        />
      )}

      {kind !== 'scripted' && (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="traffic-destination">
              Destination
            </Label>

            <Controller
              name="destination"
              control={control}
              render={({ field }) => (
                <Select
                  value={
                    field.value.kind === 'uniform'
                      ? UNIFORM_DESTINATION
                      : toSelectValue(field.value.destinationId)
                  }
                  onValueChange={(value) => field.onChange(
                    value === UNIFORM_DESTINATION
                      ? {
                        kind: 'uniform',
                        destinationId: Number.NaN,
                      }
                      : {
                        kind: 'constant',
                        destinationId: Number(value),
                      },
                  )}
                >
                  <SelectTrigger
                    id="traffic-destination"
                    className="w-full"
                    aria-invalid={!!errors.destination?.destinationId}
                    onBlur={field.onBlur}
                  >
                    <SelectValue placeholder="Pick a workstation" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={UNIFORM_DESTINATION}>
                      Any other workstation, uniformly
                    </SelectItem>

                    {renderDestinationItems()}
                  </SelectContent>
                </Select>
              )}
            />

            <FieldError
              id="traffic-destination-error"
              error={errors.destination?.destinationId}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="traffic-size-kind">
              Message size
            </Label>

            <Controller
              name="size.kind"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="traffic-size-kind"
                    className="w-full"
                    onBlur={field.onBlur}
                  >
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="constant">
                      Constant
                    </SelectItem>

                    <SelectItem value="range">
                      Uniform in a range
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {sizeKind === 'constant' && (
            <NumberField
              id="traffic-size"
              label="Size, bytes"
              min={1}
              step={1}
              error={errors.size?.size}
              registration={register('size.size', { valueAsNumber: true })}
            />
          )}

          {sizeKind === 'range' && (
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                id="traffic-size-min"
                label="Min, bytes"
                min={1}
                step={1}
                error={errors.size?.min}
                registration={register('size.min', { valueAsNumber: true })}
              />

              <NumberField
                id="traffic-size-max"
                label="Max, bytes"
                min={1}
                step={1}
                error={errors.size?.max}
                registration={register('size.max', { valueAsNumber: true })}
              />
            </div>
          )}
        </>
      )}

      {kind === 'scripted' && (
        <div className="flex flex-col gap-2">
          <Label>
            Messages
          </Label>

          {transmissionFields.length > 0 && (
            <div className="grid grid-cols-[1fr_1.4fr_1fr_auto] gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>
                Time
              </span>

              <span>
                To
              </span>

              <span>
                Size, bytes
              </span>

              <span className="w-7" />
            </div>
          )}

          {transmissionFields.map((transmission, idx) => {
            const rowErrors = errors.transmissions?.[idx];

            return (
              <div
                key={transmission.id}
                className="flex flex-col gap-1"
              >
                <div className="grid grid-cols-[1fr_1.4fr_1fr_auto] items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    aria-label={`Message ${idx + 1} time`}
                    aria-invalid={!!rowErrors?.time}
                    {...register(`transmissions.${idx}.time`, { valueAsNumber: true })}
                  />

                  <Controller
                    name={`transmissions.${idx}.destinationId`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={toSelectValue(field.value)}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-label={`Message ${idx + 1} destination`}
                          aria-invalid={!!rowErrors?.destinationId}
                          onBlur={field.onBlur}
                        >
                          <SelectValue placeholder="Pick" />
                        </SelectTrigger>

                        <SelectContent>
                          {renderDestinationItems()}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  <Input
                    type="number"
                    min={1}
                    step={1}
                    aria-label={`Message ${idx + 1} size`}
                    aria-invalid={!!rowErrors?.size}
                    {...register(`transmissions.${idx}.size`, { valueAsNumber: true })}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove message ${idx + 1}`}
                    onClick={() => removeTransmission(idx)}
                  >
                    <Trash2 />
                  </Button>
                </div>

                {(['time', 'destinationId', 'size'] as const).map((field) => (
                  <FieldError
                    key={field}
                    id={`traffic-transmission-${idx}-${field}-error`}
                    error={rowErrors?.[field]}
                  />
                ))}
              </div>
            );
          })}

          <FieldError
            id="traffic-transmissions-error"
            error={errors.transmissions?.root ?? errors.transmissions}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => appendTransmission({
              time: 0,
              destinationId: destinations.at(0)?.id ?? Number.NaN,
              size: DEFAULT_MESSAGE_SIZE,
            })}
          >
            <Plus />
            Add message
          </Button>
        </div>
      )}

      <DialogFooter>
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        </DialogClose>

        <Button type="submit">
          Save
        </Button>
      </DialogFooter>
    </form>
  );
};
