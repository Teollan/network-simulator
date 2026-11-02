import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { LoaderCircle } from 'lucide-react';
import FloatingEdge from '@/components/editor/canvas/edge/FloatingEdge';
import { networkNodeToFlowNode } from '@/modules/graph/model/networkNodeToFlowNode';
import { networkLinkToFlowEdge } from '@/modules/graph/model/networkLinkToFlowEdge';
import { EDGE_TYPE } from '@/components/editor/canvas/edge/edge.constants';
import { useNetworkStore } from '@/stores/useNetworkStore';
import { NODE_TYPES } from '@/components/editor/canvas/node/node.constants';

const EDGE_TYPES = {
  [EDGE_TYPE.GROUND_CONNECTION]: FloatingEdge,
};

const CanvasFlow = () => {
  const { networkLayout, isGenerating } = useNetworkStore();
  const { fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect = useCallback((connection: Connection) => (
    setEdges((eds) => addEdge(connection, eds))
  ), [setEdges]);

  useEffect(() => {
    if (!networkLayout) {
      return;
    }

    const { network, positions } = networkLayout;

    setNodes(network.nodes.map((node) => {
      const position = positions.get(node.id) ?? { x: 0, y: 0 };

      return networkNodeToFlowNode(node, position);
    }));

    setEdges(network.links.map(networkLinkToFlowEdge));

    fitView();
  }, [networkLayout, setNodes, setEdges, fitView]);

  return (
    <div className="relative size-full">
      {isGenerating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
          <LoaderCircle
            className="size-6 animate-spin text-muted-foreground"
            aria-label="Generating network"
          />
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        colorMode="system"
        fitView
      >
        <Background />

        <Controls />
      </ReactFlow>
    </div>
  );
};

export const Canvas = () => (
  <ReactFlowProvider>
    <CanvasFlow />
  </ReactFlowProvider>
);
