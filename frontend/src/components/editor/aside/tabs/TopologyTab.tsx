import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AsideSection } from '@/components/editor/aside/AsideSection';
import { FieldError } from '@/components/ui/form/FieldError';
import { toOptionalNumber } from '@/components/editor/aside/toOptionalNumber';
import { keyOf } from '@/components/editor/aside/tabs/topology/keyOf';
import { TopologyRuleCard } from '@/components/editor/aside/tabs/topology/TopologyRuleCard';
import { TopologyRuleDialog } from '@/components/editor/aside/tabs/topology/TopologyRuleDialog';
import {
  makeDefaultFormValues,
  toFormValues,
} from '@/components/editor/aside/tabs/topology/topologyRuleForm';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  TOPOLOGY_BUILDER_ACTION as ACTION,
  type TopologyBuilderAction,
} from '@/modules/network/builder/TopologySpec';
import { NODE_TYPE } from '@/modules/network/node/Node.constants';
import { useNetworkStore } from '@/stores/useNetworkStore';

const networkFormSchema = z.object({
  seed: z.int('Must be a whole number').nonnegative('Must not be negative').optional(),
});

type NetworkForm = z.infer<typeof networkFormSchema>;

// INFO: null while closed; a position when editing, 'new' when adding
type DialogTarget = number | 'new' | null;

const regionLabelsOf = (actions: TopologyBuilderAction[]): string[] => actions.flatMap((action) => (
  action.kind === ACTION.CREATE_REGION ? [action.options.label] : []
));

export const TopologyTab = () => {
  const {
    spec,
    networkLayout,
    isGenerating,
    setSpec,
    addAction,
    updateAction,
    removeAction,
    moveAction,
    resetActions,
    generateNetwork,
  } = useNetworkStore();

  const [dialogTarget, setDialogTarget] = useState<DialogTarget>(null);
  // INFO: kept apart from the target, so the dialog keeps its content while it animates out
  const [lastTarget, setLastTarget] = useState<number | 'new'>('new');

  const regions = regionLabelsOf(spec.actions);
  const editedAction = lastTarget === 'new' ? null : spec.actions.at(lastTarget) ?? null;
  // INFO: a region being edited may keep its own label
  const takenRegions = regionLabelsOf(spec.actions.filter((action) => action !== editedAction));

  const openDialog = (target: number | 'new') => {
    setLastTarget(target);
    setDialogTarget(target);
  };

  const onRuleSubmit = (action: TopologyBuilderAction) => {
    if (lastTarget === 'new') {
      addAction(action);
    } else {
      updateAction(lastTarget, action);
    }

    setDialogTarget(null);
  };

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
      title="Topology"
      description="Builder rules, applied top to bottom on Generate."
    >
      {spec.actions.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No rules yet. Start with a region.
        </p>
      )}

      <Accordion
        type="multiple"
        className="flex flex-col gap-2"
      >
        {spec.actions.map((action, idx) => (
          <TopologyRuleCard
            key={keyOf(action)}
            value={`${keyOf(action)}`}
            action={action}
            position={idx + 1}
            isFirst={idx === 0}
            isLast={idx === spec.actions.length - 1}
            onEdit={() => openDialog(idx)}
            onDelete={() => removeAction(idx)}
            onMoveUp={() => moveAction(idx, -1)}
            onMoveDown={() => moveAction(idx, 1)}
          />
        ))}
      </Accordion>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => openDialog('new')}
        >
          <Plus />
          Add rule
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={resetActions}
        >
          <RotateCcw />
          Reset
        </Button>
      </div>

      <TopologyRuleDialog
        open={dialogTarget !== null}
        title={lastTarget === 'new' ? 'Add rule' : 'Edit rule'}
        regions={regions}
        takenRegions={takenRegions}
        defaultValues={
          editedAction
            ? toFormValues(editedAction, regions)
            : makeDefaultFormValues(regions)
        }
        onOpenChange={(open) => !open && setDialogTarget(null)}
        onSubmit={onRuleSubmit}
      />

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
