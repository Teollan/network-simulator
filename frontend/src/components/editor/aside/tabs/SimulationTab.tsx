import { Zap } from 'lucide-react';
import { AsideSection } from '@/components/editor/aside/AsideSection';
import { onNumberChange } from '@/components/editor/aside/onNumberChange';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { ROUTING_POLICY, ROUTING_POLICY_LABEL, type RoutingPolicyId } from '@/modules/routing/routing.constants';
import { useNetworkStore } from '@/stores/useNetworkStore';
import { useSimulationStore } from '@/stores/useSimulationStore';

const ROUTING_POLICY_IDS = Object.values(ROUTING_POLICY) as RoutingPolicyId[];

export const SimulationTab = () => {
  const { simulationConfig, setSimulationConfig, runSimulation } = useSimulationStore();
  const { networkLayout } = useNetworkStore();

  return (
    <AsideSection
      title="Simulation"
      description="Routing policy, traffic and the run controls."
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="routing-policy">
          Routing policy
        </Label>

        <Select
          value={simulationConfig.routingPolicyId}
          onValueChange={(routingPolicyId: RoutingPolicyId) => setSimulationConfig({ routingPolicyId })}
        >
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
          defaultValue={simulationConfig.runUntil}
          onChange={onNumberChange((runUntil) => setSimulationConfig({ runUntil }))}
        />
      </div>

      <Button
        onClick={runSimulation}
        disabled={!networkLayout}
      >
        <Zap />
        Run
      </Button>
    </AsideSection>
  );
};
