import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AsideSection } from '@/components/editor/aside/AsideSection';
import { TrafficGeneratorCard } from '@/components/editor/aside/tabs/traffic/TrafficGeneratorCard';
import { TrafficGeneratorDialog } from '@/components/editor/aside/tabs/traffic/TrafficGeneratorDialog';
import {
  makeDefaultFormValues,
  toFormValues,
} from '@/components/editor/aside/tabs/traffic/trafficGeneratorForm';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { NODE_TYPE } from '@/modules/network/node/Node.constants';
import type { TrafficGeneratorConfig } from '@/modules/traffic/generator/generator.typedefs';
import { useNetworkStore } from '@/stores/useNetworkStore';
import {
  useTrafficStore,
  type TrafficGeneratorEntry,
} from '@/stores/useTrafficStore';

type DialogTarget = TrafficGeneratorEntry | 'new' | null;

export const TrafficTab = () => {
  const { networkLayout } = useNetworkStore();
  const {
    generators,
    addGenerator,
    updateGenerator,
    removeGenerator,
  } = useTrafficStore();

  const [dialogTarget, setDialogTarget] = useState<DialogTarget>(null);
  const [lastTarget, setLastTarget] = useState<TrafficGeneratorEntry | 'new'>('new');

  const workstations = networkLayout?.network.getNodes({ type: NODE_TYPE.WORKSTATION }) ?? [];
  const labelById = new Map(workstations.map(({
    id,
    label,
  }) => [id, label]));
  const labelOf = (id: number) => labelById.get(id) ?? `#${id}`;

  const groups = workstations
    .map((workstation) => ({
      workstation,
      entries: generators.filter(({ config }) => config.sourceId === workstation.id),
    }))
    .filter(({ entries }) => entries.length > 0);

  const openDialog = (target: TrafficGeneratorEntry | 'new') => {
    setLastTarget(target);
    setDialogTarget(target);
  };

  const onSubmit = (config: TrafficGeneratorConfig) => {
    if (lastTarget === 'new') {
      addGenerator(config);
    } else {
      updateGenerator(lastTarget.id, config);
    }

    setDialogTarget(null);
  };

  const canAdd = workstations.length >= 2;

  return (
    <AsideSection
      title="Traffic"
      description="Message generators, grouped by source workstation."
    >
      {groups.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No traffic yet. The simulation will have nothing to send.
        </p>
      )}

      {groups.map(({
        workstation,
        entries,
      }) => (
        <section
          key={workstation.id}
          className="flex flex-col gap-2"
        >
          <h3 className="text-xs font-medium text-muted-foreground">
            {workstation.label}
          </h3>

          <Accordion
            type="multiple"
            className="flex flex-col gap-2"
          >
            {entries.map((entry) => (
              <TrafficGeneratorCard
                key={entry.id}
                entry={entry}
                labelOf={labelOf}
                onEdit={() => openDialog(entry)}
                onDelete={() => removeGenerator(entry.id)}
              />
            ))}
          </Accordion>
        </section>
      ))}

      <Button
        type="button"
        variant="outline"
        disabled={!canAdd}
        onClick={() => openDialog('new')}
      >
        <Plus />
        Add traffic generator
      </Button>

      <TrafficGeneratorDialog
        open={dialogTarget !== null}
        title={lastTarget === 'new' ? 'Add traffic generator' : 'Edit traffic generator'}
        workstations={workstations}
        defaultValues={
          lastTarget === 'new'
            ? makeDefaultFormValues(workstations.at(0)?.id ?? Number.NaN)
            : toFormValues(lastTarget.config)
        }
        onOpenChange={(open) => !open && setDialogTarget(null)}
        onSubmit={onSubmit}
      />
    </AsideSection>
  );
};
