import { TrafficGeneratorForm } from '@/components/editor/aside/tabs/traffic/TrafficGeneratorForm';
import type { TrafficGeneratorFormValues } from '@/components/editor/aside/tabs/traffic/trafficGeneratorForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import type { Node } from '@/modules/network/node/Node';
import type { TrafficGeneratorConfig } from '@/modules/traffic/generator/generator.typedefs';

interface TrafficGeneratorDialogProps {
  open: boolean;
  title: string;
  workstations: Node[];
  defaultValues: TrafficGeneratorFormValues;
  onOpenChange: (open: boolean) => void;
  onSubmit: (config: TrafficGeneratorConfig) => void;
}

export const TrafficGeneratorDialog = ({
  open,
  title,
  workstations,
  defaultValues,
  onOpenChange,
  onSubmit,
}: TrafficGeneratorDialogProps) => (
  <Dialog
    open={open}
    onOpenChange={onOpenChange}
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {title}
        </DialogTitle>

        <DialogDescription>
          Messages a workstation sends over the run.
        </DialogDescription>
      </DialogHeader>

      <TrafficGeneratorForm
        workstations={workstations}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      />
    </DialogContent>
  </Dialog>
);
