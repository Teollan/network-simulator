import { getStraightPath, useInternalNode, type EdgeProps } from '@xyflow/react';
import { getNodeCenter } from '@/components/editor/canvas/edge/getNodeCenter';

function FloatingEdge({ id, source, target, markerEnd, style }: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const sourceCenter = getNodeCenter(sourceNode);
  const targetCenter = getNodeCenter(targetNode);

  const [edgePath] = getStraightPath({
    sourceX: sourceCenter.x,
    sourceY: sourceCenter.y,
    targetX: targetCenter.x,
    targetY: targetCenter.y,
  });

  return (
    <path
      id={id}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
      style={style}
    />
  );
}

export default FloatingEdge;
