import { zodResolver } from '@hookform/resolvers/zod';
import {
  Controller,
  useForm,
  useWatch,
  type Control,
} from 'react-hook-form';
import { z } from 'zod';
import { FieldError } from '@/components/ui/form/FieldError';
import { NumberField } from '@/components/ui/form/NumberField';
import {
  ALL_MEDIA,
  TOPOLOGY_RULE_KIND_LABEL,
  toAction,
  type TopologyRuleFormValues,
} from '@/components/editor/aside/tabs/topology/topologyRuleForm';
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
import { LINK_MEDIUM } from '@/modules/network/Link';
import {
  TOPOLOGY_BUILDER_ACTION as ACTION,
  type TopologyBuilderAction,
  type TopologyBuilderActionKind,
} from '@/modules/network/builder/TopologySpec';
import { topologyBuilderActionSchema } from '@/modules/network/builder/topologySpec.schema';

const RULE_KINDS = Object.values(ACTION) as TopologyBuilderActionKind[];

const MEDIUM_LABEL = {
  [ALL_MEDIA]: 'All links',
  [LINK_MEDIUM.GROUND]: 'Ground links',
  [LINK_MEDIUM.SATELLITE]: 'Satellite links',
};

const MEDIA = Object.keys(MEDIUM_LABEL) as (keyof typeof MEDIUM_LABEL)[];

// The form holds every kind's options at once (see TopologyRuleFormValues); toAction keeps
// the chosen kind's options, so the action schema's error paths match the form's field names
const makeTopologyRuleFormSchema = (takenRegions: string[]) => z.custom<TopologyRuleFormValues>()
  .transform(toAction)
  .pipe(topologyBuilderActionSchema)
  .superRefine((action, ctx) => {
    if (action.kind === ACTION.CREATE_REGION && takenRegions.includes(action.options.label)) {
      ctx.addIssue({
        code: 'custom',
        message: 'A region with this label already exists',
        path: ['options', 'label'],
      });
    }
  });

type RegionField = 'options.region' | 'options.sourceRegion' | 'options.targetRegion';

interface RegionSelectProps {
  id: string;
  label: string;
  name: RegionField;
  control: Control<TopologyRuleFormValues, unknown, TopologyBuilderAction>;
  regions: string[];
  error?: { message?: string };
}

const RegionSelect = ({
  id,
  label,
  name,
  control,
  regions,
  error,
}: RegionSelectProps) => (
  <div className="flex flex-col gap-2">
    <Label htmlFor={id}>
      {label}
    </Label>

    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          value={field.value}
          onValueChange={field.onChange}
        >
          <SelectTrigger
            id={id}
            className="w-full"
            aria-invalid={!!error}
            onBlur={field.onBlur}
          >
            <SelectValue placeholder="Pick a region" />
          </SelectTrigger>

          <SelectContent>
            {regions.map((region) => (
              <SelectItem
                key={region}
                value={region}
              >
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />

    <FieldError
      id={`${id}-error`}
      error={error}
    />
  </div>
);

interface TopologyRuleFormProps {
  regions: string[];
  takenRegions: string[];
  defaultValues: TopologyRuleFormValues;
  onSubmit: (action: TopologyBuilderAction) => void;
}

export const TopologyRuleForm = ({
  regions,
  takenRegions,
  defaultValues,
  onSubmit,
}: TopologyRuleFormProps) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TopologyRuleFormValues, unknown, TopologyBuilderAction>({
    resolver: zodResolver(makeTopologyRuleFormSchema(takenRegions)),
    defaultValues,
    mode: 'onChange',
  });

  const kind = useWatch({
    control,
    name: 'kind',
  });

  const hasMedium = kind === ACTION.ASSIGN_BIT_ERROR_RATE
    || kind === ACTION.ASSIGN_LINK_TYPE
    || kind === ACTION.ASSIGN_BUFFER_SIZE;

  const hasPool = kind === ACTION.ASSIGN_LINK_WEIGHTS || kind === ACTION.ASSIGN_BUFFER_SIZE;

  return (
    <form
      className="flex flex-col gap-3"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="rule-kind">
          Rule
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
                id="rule-kind"
                className="w-full"
                onBlur={field.onBlur}
              >
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {RULE_KINDS.map((ruleKind) => (
                  <SelectItem
                    key={ruleKind}
                    value={ruleKind}
                  >
                    {TOPOLOGY_RULE_KIND_LABEL[ruleKind]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {kind === ACTION.CREATE_REGION && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="rule-label">
              Label
            </Label>

            <Input
              id="rule-label"
              placeholder="e.g. US"
              aria-invalid={!!errors.options?.label}
              aria-describedby="rule-label-error"
              {...register('options.label')}
            />

            <FieldError
              id="rule-label-error"
              error={errors.options?.label}
            />
          </div>

          <NumberField
            id="rule-size"
            label="Routers"
            min={1}
            step={1}
            error={errors.options?.size}
            registration={register('options.size', { valueAsNumber: true })}
          />
        </div>
      )}

      {kind === ACTION.LINK_INSIDE_REGION && (
        <div className="grid grid-cols-2 gap-3">
          <RegionSelect
            id="rule-region"
            label="Region"
            name="options.region"
            control={control}
            regions={regions}
            error={errors.options?.region}
          />

          <NumberField
            id="rule-degree"
            label="Mean degree"
            error={errors.options?.degree}
            registration={register('options.degree', { valueAsNumber: true })}
          />
        </div>
      )}

      {kind === ACTION.LINK_REGIONS && (
        <div className="grid grid-cols-2 gap-3">
          <RegionSelect
            id="rule-source-region"
            label="Region"
            name="options.sourceRegion"
            control={control}
            regions={regions}
            error={errors.options?.sourceRegion}
          />

          <RegionSelect
            id="rule-target-region"
            label="Linked to"
            name="options.targetRegion"
            control={control}
            regions={regions}
            error={errors.options?.targetRegion}
          />
        </div>
      )}

      {kind === ACTION.ATTACH_WORKSTATIONS && (
        <div className="grid grid-cols-2 gap-3">
          <RegionSelect
            id="rule-region"
            label="Region"
            name="options.region"
            control={control}
            regions={regions}
            error={errors.options?.region}
          />

          <NumberField
            id="rule-every"
            label="One per N routers"
            min={1}
            step={1}
            error={errors.options?.every}
            registration={register('options.every', { valueAsNumber: true })}
          />
        </div>
      )}

      {hasPool && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="rule-pool">
            {kind === ACTION.ASSIGN_LINK_WEIGHTS ? 'Weights' : 'Buffer sizes, frames'}
          </Label>

          <Input
            id="rule-pool"
            placeholder="e.g. 3, 5, 7"
            aria-invalid={!!errors.options?.pool}
            aria-describedby="rule-pool-error"
            {...register('options.pool')}
          />

          <p className="text-xs text-muted-foreground">
            Comma-separated; each link gets one, picked uniformly.
          </p>

          <FieldError
            id="rule-pool-error"
            error={errors.options?.pool}
          />
        </div>
      )}

      {kind === ACTION.ASSIGN_BIT_ERROR_RATE && (
        <NumberField
          id="rule-ber"
          label="Bit error rate"
          error={errors.options?.value}
          registration={register('options.value', { valueAsNumber: true })}
        />
      )}

      {kind === ACTION.ASSIGN_LINK_TYPE && (
        <NumberField
          id="rule-half-duplex-share"
          label="Half-duplex share, 0 to 1"
          error={errors.options?.halfDuplexShare}
          registration={register('options.halfDuplexShare', { valueAsNumber: true })}
        />
      )}

      {hasMedium && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="rule-medium">
            Applies to
          </Label>

          <Controller
            name="options.medium"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="rule-medium"
                  className="w-full"
                  onBlur={field.onBlur}
                >
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {MEDIA.map((medium) => (
                    <SelectItem
                      key={medium}
                      value={medium}
                    >
                      {MEDIUM_LABEL[medium]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
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
