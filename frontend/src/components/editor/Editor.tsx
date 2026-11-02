import { Aside } from '@/components/editor/aside/Aside';
import { Canvas } from '@/components/editor/canvas/Canvas';
import { Timeline } from '@/components/editor/timeline/Timeline';
import { Toolbar } from '@/components/editor/toolbar/Toolbar';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/Resizable';

export const Editor = () => (
  <ResizablePanelGroup orientation="horizontal" className="h-full">
    <ResizablePanel defaultSize="360px" minSize="280px" maxSize="50%">
      <Aside />
    </ResizablePanel>

    <ResizableHandle withHandle />

    <ResizablePanel minSize="30%">
      <div className="flex h-full flex-col">
        <Toolbar />

        <div className="min-h-0 flex-1">
          <Canvas />
        </div>

        <Timeline />
      </div>
    </ResizablePanel>
  </ResizablePanelGroup>
);
