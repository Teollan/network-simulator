import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network } from '@/modules/network/model/Network';
import FloatingEdge from '@/modules/network/view/FloatingEdge';
import { CustomNode } from '@/modules/network/view/CustomNode';

const network = new Network();

network.spawn(9, 'us');
network.connect(3.5, (node) => node.label.includes('us'));

const initialNodes: Node[] = network.nodes.map(
  ({ id, label }, idx) => {
    const radius = 200;
    const angle = (2 * Math.PI / network.nodes.length) * idx;

    return {
      id: id.toString(),
      type: 'custom',
      position: { x: radius * Math.cos(angle), y: radius * Math.sin(angle) },
      data: { label },
    };
  },
);

const initialEdges: Edge[] = network.edges.map(
  ({ id, sourceId, targetId }) => ({
    id: id.toString(),
    source: sourceId.toString(),
    target: targetId.toString(),
    type: 'floating',
  }),
);

const nodeTypes = {
  'custom': CustomNode,
};

const edgeTypes = {
  'floating': FloatingEdge,
};

export const GraphPaper = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
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
