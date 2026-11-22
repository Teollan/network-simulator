import { zodResolver } from '@hookform/resolvers/zod';
import { Zap } from 'lucide-react';
import {
  Controller,
  useForm,
} from 'react-hook-form';
import { AsideSection } from '@/components/editor/aside/AsideSection';
import { FieldError } from '@/components/editor/aside/FieldError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  ROUTING_POLICY,
  ROUTING_POLICY_LABEL,
  type RoutingPolicyId,
} from '@/modules/routing/routing.constants';
import {
  simulationConfigSchema,
  type SimulationConfig,
} from '@/modules/simulation/simulationConfig.schema';
import { useNetworkStore } from '@/stores/useNetworkStore';
import { useSimulationStore } from '@/stores/useSimulationStore';

const ROUTING_POLICY_IDS = Object.values(ROUTING_POLICY) as RoutingPolicyId[];

export const SimulationTab = () => {
  const {
    simulationConfig,
    setSimulationConfig,
    runSimulation,
  } = useSimulationStore();

  const { networkLayout } = useNetworkStore();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SimulationConfig>({
    resolver: zodResolver(simulationConfigSchema),
    defaultValues: simulationConfig,
    mode: 'onChange',
  });

  const onSubmit = (config: SimulationConfig) => {
    setSimulationConfig(config);
    runSimulation();
  };

  return (
    <AsideSection
      title="Simulation"
      description="Routing policy, traffic and the run controls."
    >
      <form
        className="flex flex-col gap-3"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="routing-policy">
            Routing policy
          </Label>

          <Controller
            name="routingPolicyId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="routing-policy"
                  className="w-full"
                  onBlur={field.onBlur}
                >
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {ROUTING_POLICY_IDS.map((policyId) => (
                    <SelectItem
                      key={policyId}
                      value={policyId}
                    >
                      {ROUTING_POLICY_LABEL[policyId]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <FieldError
            id="routing-policy-error"
            error={errors.routingPolicyId}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="run-until">
            Run until
          </Label>

          <Input
            id="run-until"
            type="number"
            min={0}
            step="any"
            aria-invalid={!!errors.runUntil}
            aria-describedby="run-until-error"
            {...register('runUntil', { valueAsNumber: true })}
          />

          <FieldError
            id="run-until-error"
            error={errors.runUntil}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="max-packet-size">
            MTU, bytes
          </Label>

          <Input
            id="max-packet-size"
            type="number"
            min={1}
            step={1}
            aria-invalid={!!errors.maxPacketSize}
            aria-describedby="max-packet-size-error"
            {...register('maxPacketSize', { valueAsNumber: true })}
          />

          <FieldError
            id="max-packet-size-error"
            error={errors.maxPacketSize}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="max-hops">
            TTL, hops
          </Label>

          <Input
            id="max-hops"
            type="number"
            min={1}
            step={1}
            aria-invalid={!!errors.maxHops}
            aria-describedby="max-hops-error"
            {...register('maxHops', { valueAsNumber: true })}
          />

          <FieldError
            id="max-hops-error"
            error={errors.maxHops}
          />
        </div>

        <Button
          type="submit"
          disabled={!networkLayout}
        >
          <Zap />
          Run
        </Button>
      </form>
    </AsideSection>
  );
};
