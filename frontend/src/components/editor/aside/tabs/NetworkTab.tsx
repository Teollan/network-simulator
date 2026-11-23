import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AsideSection } from '@/components/editor/aside/AsideSection';
import { FieldError } from '@/components/editor/aside/FieldError';
import { toOptionalNumber } from '@/components/editor/aside/toOptionalNumber';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { NODE_TYPE } from '@/modules/network/node/Node.constants';
import { useNetworkStore } from '@/stores/useNetworkStore';

const networkFormSchema = z.object({
  seed: z.int('Must be a whole number').nonnegative('Must not be negative').optional(),
});

type NetworkForm = z.infer<typeof networkFormSchema>;

export const NetworkTab = () => {
  const {
    spec,
    networkLayout,
    isGenerating,
    setSpec,
    generateNetwork,
  } = useNetworkStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NetworkForm>({
    resolver: zodResolver(networkFormSchema),
    defaultValues: { seed: spec.seed },
    mode: 'onChange',
  });

  const onSubmit = ({ seed }: NetworkForm) => {
    setSpec({ seed });
    void generateNetwork();
  };

  const nodes = networkLayout?.network.getNodes() ?? [];
  const routerCount = nodes.filter(({ type }) => type === NODE_TYPE.ROUTER).length;
  const workstationCount = nodes.filter(({ type }) => type === NODE_TYPE.WORKSTATION).length;
  const linkCount = networkLayout?.network.getLinks().length ?? 0;
  const actualDegree = nodes.length ? (2 * linkCount) / nodes.length : 0;

  return (
    <AsideSection
      title="Network"
      description="Topology generation."
    >
      <form
        className="flex flex-col gap-3"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="network-seed">
            Seed
          </Label>

          <Input
            id="network-seed"
            type="number"
            min={0}
            step={1}
            placeholder="Random"
            aria-invalid={!!errors.seed}
            aria-describedby="network-seed-error"
            {...register('seed', { setValueAs: toOptionalNumber })}
          />

          <FieldError
            id="network-seed-error"
            error={errors.seed}
          />
        </div>

        <Button
          type="submit"
          disabled={isGenerating}
        >
          <RefreshCw />
          Generate
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">
        {`${routerCount} routers · ${workstationCount} workstations · ${linkCount} links · degree ${actualDegree.toFixed(2)}`}
      </p>

      {networkLayout && (
        <p className="text-xs text-muted-foreground">
          {`seed ${networkLayout.seed}`}
        </p>
      )}
    </AsideSection>
  );
};
