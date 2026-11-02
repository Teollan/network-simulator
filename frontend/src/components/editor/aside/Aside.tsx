import { ASIDE_TAB } from '@/components/editor/aside/aside.constants';
import { NetworkTab } from '@/components/editor/aside/tabs/NetworkTab';
import { SimulationTab } from '@/components/editor/aside/tabs/SimulationTab';
import { TraceTab } from '@/components/editor/aside/tabs/TraceTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

export const Aside = () => (
  <aside className="flex h-full flex-col bg-background">
    <Tabs defaultValue={ASIDE_TAB.NETWORK} className="h-full gap-0">
      <div className="border-b p-2">
        <TabsList className="w-full">
          <TabsTrigger value={ASIDE_TAB.NETWORK}>
            Network
          </TabsTrigger>

          <TabsTrigger value={ASIDE_TAB.SIMULATION}>
            Simulation
          </TabsTrigger>

          <TabsTrigger value={ASIDE_TAB.TRACE}>
            Trace
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value={ASIDE_TAB.NETWORK} className="overflow-y-auto p-4">
        <NetworkTab />
      </TabsContent>

      <TabsContent value={ASIDE_TAB.SIMULATION} className="overflow-y-auto p-4">
        <SimulationTab />
      </TabsContent>

      <TabsContent value={ASIDE_TAB.TRACE} className="overflow-y-auto p-4">
        <TraceTab />
      </TabsContent>
    </Tabs>
  </aside>
);
