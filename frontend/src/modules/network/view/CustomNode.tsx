import { memo } from 'react';
import { type NodeProps, type Node, Handle, Position } from '@xyflow/react';

type CustomNodeProps = NodeProps<Node<{
  label: string;
}>>

export const CustomNode = memo(({ data }: CustomNodeProps) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={false}
        style={{ border: 'none', background: 'none', pointerEvents: 'none' }}
      />
      < div className='my-div'>
        <div>{data.label}</div>
      </div >
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={false}
        style={{ border: 'none', background: 'none', pointerEvents: 'none' }}
      />
    </>
  );
});
