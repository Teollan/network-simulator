import { cn } from 'cn';
import {
  getStraightPath,
  useInternalNode,
  type EdgeProps,
} from '@xyflow/react';
import { getOutlineSegment } from '@/components/editor/canvas/edge/getOutlineSegment';
import type { FloatingEdgeType } from '@/components/editor/canvas/edge/edge.types';

const PACKET_RADIUS = 10; // px

function FloatingEdge({
  id,
  source,
  target,
  markerEnd,
  style,
  data,
}: EdgeProps<FloatingEdgeType>) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const segment = getOutlineSegment(sourceNode, targetNode);

  if (!segment) {
    return null;
  }

  const { start, end } = segment;

  const [edgePath] = getStraightPath({
    sourceX: start.x,
    sourceY: start.y,
    targetX: end.x,
    targetY: end.y,
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={style}
      />

      {data?.packets?.map(({ id: packetId, progress, isCorrupted }) => (
        <circle
          key={packetId}
          className={cn('stroke-background', isCorrupted ? 'fill-destructive' : 'fill-green-500')}
          cx={start.x + (end.x - start.x) * progress}
          cy={start.y + (end.y - start.y) * progress}
          r={PACKET_RADIUS}
          strokeWidth={1.5}
        />
      ))}
    </>
  );
}

export default FloatingEdge;
