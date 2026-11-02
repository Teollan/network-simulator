import { Zap } from 'lucide-react';
import { AsideSection } from '@/components/editor/aside/AsideSection';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { ROUTING_POLICY, ROUTING_POLICY_LABEL, type RoutingPolicyId } from '@/modules/routing/routing.constants';
import { DEFAULT_RUN_UNTIL } from '@/modules/simulation/simulation.constants';

const ROUTING_POLICY_IDS = Object.values(ROUTING_POLICY) as RoutingPolicyId[];

export const SimulationTab = () => (
  <AsideSection
    title="Simulation"
    description="Routing policy, traffic and the run controls."
  >
    <div className="flex flex-col gap-2">
      <Label htmlFor="routing-policy">
        Routing policy
      </Label>

      <Select defaultValue={ROUTING_POLICY.HOT_POTATO}>
        <SelectTrigger
          id="routing-policy"
          className="w-full"
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
        defaultValue={DEFAULT_RUN_UNTIL}
      />
    </div>

    <Button>
      <Zap />
      Run
    </Button>
  </AsideSection>
);
