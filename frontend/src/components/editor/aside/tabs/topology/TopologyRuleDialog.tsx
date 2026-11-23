import { TopologyRuleForm } from '@/components/editor/aside/tabs/topology/TopologyRuleForm';
import type { TopologyRuleFormValues } from '@/components/editor/aside/tabs/topology/topologyRuleForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import type { TopologyBuilderAction } from '@/modules/network/builder/TopologySpec';

interface TopologyRuleDialogProps {
  open: boolean;
  title: string;
  regions: string[];
  takenRegions: string[];
  defaultValues: TopologyRuleFormValues;
  onOpenChange: (open: boolean) => void;
  onSubmit: (action: TopologyBuilderAction) => void;
}

export const TopologyRuleDialog = ({
  open,
  title,
  regions,
  takenRegions,
  defaultValues,
  onOpenChange,
  onSubmit,
}: TopologyRuleDialogProps) => (
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
          Rules run in order, so a rule only sees what the rules above it built.
        </DialogDescription>
      </DialogHeader>

      <TopologyRuleForm
        regions={regions}
        takenRegions={takenRegions}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      />
    </DialogContent>
  </Dialog>
);
