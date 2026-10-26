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
import { Network } from '@/modules/network/model/Network';
import FloatingEdge from '@/modules/network/view/FloatingEdge';
import { CustomNode } from '@/modules/network/view/CustomNode';
import { useElkLayout } from '@/modules/layout/view/useElkLayout';
import { networkNodeToFlowNode } from '@/modules/graph/model/networkNodeToFlowNode';
import { networkConnectionToFlowEdge } from '@/modules/graph/model/networkConnectionToFlowEdge';
import { EDGE_TYPE, NODE_TYPE } from '@/modules/graph/view/graph.constants';

const network = new Network();

network.spawn(9, 'us');
network.connect(3.5, (node) => node.label.includes('us'));

const initialEdges = network.connections.map(networkConnectionToFlowEdge);

const NODE_TYPES = {
  [NODE_TYPE.ROUTER]: CustomNode,
};

const EDGE_TYPES = {
  [EDGE_TYPE.GROUND_CONNECTION]: FloatingEdge,
};

export const GraphPaper = () => {
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
