import type { InternalNode, Node, XYPosition } from '@xyflow/react';
import { getNodeCenter } from '@/components/editor/canvas/edge/getNodeCenter';
import { NODE_TYPE } from '@/components/editor/canvas/node/node.constants';

export interface OutlineSegment {
  start: XYPosition;
  end: XYPosition;
}

// distance from the node center to its outline, along the unit vector `direction`
const getOutlineDistance = (node: InternalNode<Node>, direction: XYPosition): number => {
  const { width = 0, height = 0 } = node.measured;
  const radius = Math.min(width, height) / 2;

  switch (node.type) {
    // a diamond is |x| + |y| = radius, with radius being the center-to-corner distance
    case NODE_TYPE.WORKSTATION:
      return radius / (Math.abs(direction.x) + Math.abs(direction.y));

    case NODE_TYPE.ROUTER:
    default:
      return radius;
  }
};

// the part of the center-to-center line that lies outside both nodes,
// null when the nodes overlap and nothing of the line is visible
export const getOutlineSegment = (
  sourceNode: InternalNode<Node>,
  targetNode: InternalNode<Node>,
): OutlineSegment | null => {
  const sourceCenter = getNodeCenter(sourceNode);
  const targetCenter = getNodeCenter(targetNode);

  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) {
    return null;
  }

  const direction = {
    x: dx / length,
    y: dy / length,
  };

  const sourceDistance = getOutlineDistance(sourceNode, direction);
  const targetDistance = getOutlineDistance(targetNode, direction);

  if (sourceDistance + targetDistance >= length) {
    return null;
  }

  return {
    start: {
      x: sourceCenter.x + direction.x * sourceDistance,
      y: sourceCenter.y + direction.y * sourceDistance,
    },
    end: {
      x: targetCenter.x - direction.x * targetDistance,
      y: targetCenter.y - direction.y * targetDistance,
    },
  };
};
