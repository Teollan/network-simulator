import type { InternalNode, Node, XYPosition } from '@xyflow/react';

export const getNodeCenter = (node: InternalNode<Node>): XYPosition => {
  const { x, y } = node.internals.positionAbsolute;
  const { width = 0, height = 0 } = node.measured;

  return {
    x: x + width / 2,
    y: y + height / 2,
  };
};
