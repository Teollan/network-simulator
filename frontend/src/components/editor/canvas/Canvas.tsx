import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network } from '@/modules/network/Network';
import FloatingEdge from '@/components/editor/canvas/edge/FloatingEdge';
import { CustomNode } from '@/components/editor/canvas/node/CustomNode';
import { useElkLayout } from '@/modules/layout/view/useElkLayout';
import { networkNodeToFlowNode } from '@/modules/graph/model/networkNodeToFlowNode';
import { networkLinkToFlowEdge } from '@/modules/graph/model/networkLinkToFlowEdge';
import { Simulation } from '@/modules/simulation/Simulation';
import { SIMULATION_EVENT_KIND } from '@/modules/simulation/SimulationEvent';
import { HotPotatoRP } from '@/modules/routing/HotPotatoRP';
import { NODE_TYPE } from '@/components/editor/canvas/node/node.constants';
import { EDGE_TYPE } from '@/components/editor/canvas/edge/edge.constants';

const network = new Network();

network.spawn(9, 'us');
network.connect(
  2.5,
  (node) => node.label.includes('us'),
  [3, 5, 7, 8, 11, 12, 15, 18, 21, 25],
);

const simulation = new Simulation(network, new HotPotatoRP());

simulation.schedule({
  kind: SIMULATION_EVENT_KIND.MESSAGE_SENT,
  data: {
    fromNodeId: 1,
    toNodeId: 9,
    message: { id: 1, length: 10 },
  },
  time: 0,
});

simulation.run();

const initialEdges = network.links.map(networkLinkToFlowEdge);

const NODE_TYPES = {
  [NODE_TYPE.ROUTER]: CustomNode,
};

const EDGE_TYPES = {
  [EDGE_TYPE.GROUND_CONNECTION]: FloatingEdge,
};

export const Canvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((connection: Connection) => (
    setEdges((eds) => addEdge(connection, eds))
  ), [setEdges]);

  const positions = useElkLayout(network);

  useEffect(() => {
    if (!positions) {
      return;
    }

    setNodes(network.nodes.map((node) => {
      const position = positions.get(node.id) ?? { x: 0, y: 0 };

      return networkNodeToFlowNode(node, position);
    }));
  }, [positions, setNodes]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
