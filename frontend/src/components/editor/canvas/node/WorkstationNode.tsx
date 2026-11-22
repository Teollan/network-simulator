import { memo } from 'react';
import {
  type NodeProps,
  type Node,
  Handle,
  Position,
} from '@xyflow/react';
import { cn } from 'cn';
import { NODE_SIZE } from '@/components/editor/canvas/node/node.constants';

type WorkstationNodeProps = NodeProps<Node<{
  label: string;
}>>

export const WorkstationNode = memo(({ data, selected }: WorkstationNodeProps) => {
  const diamondSide = NODE_SIZE / Math.SQRT2;

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={false}
        className="invisible"
      />

      <div
        className="group relative flex items-center justify-center"
        style={{
          width: NODE_SIZE,
          height: NODE_SIZE,
        }}
      >
        <div
          className={cn(
            'absolute rotate-45 rounded-sm bg-primary transition-all group-hover:bg-primary/80',
            selected && 'ring-3 ring-ring/50',
          )}
          style={{
            width: diamondSide,
            height: diamondSide,
          }}
        />

        <span className="relative text-xs font-medium whitespace-nowrap text-primary-foreground">
          {data.label}
        </span>
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
