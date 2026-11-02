import { memo } from 'react';
import { type NodeProps, type Node, Handle, Position } from '@xyflow/react';
import { cn } from 'cn';
import { NODE_SIZE } from '@/components/editor/canvas/node/node.constants';

type RouterNodeProps = NodeProps<Node<{
  label: string;
}>>

export const RouterNode = memo(({ data, selected }: RouterNodeProps) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={false}
        className="invisible"
      />

      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground transition-all hover:bg-primary/80',
          selected && 'ring-3 ring-ring/50',
        )}
        style={{ width: NODE_SIZE, height: NODE_SIZE }}
      >
        {data.label}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={false}
        className="invisible"
      />
    </>
  );
});
