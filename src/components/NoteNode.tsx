import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { Note } from '../types';

interface NoteNodeProps {
  data: {
    label: string;
    note: Note;
  };
}

const NoteNode = ({ data }: NoteNodeProps) => {
  const handleStyle = {
    width: '12px',
    height: '12px',
    backgroundColor: '#eab308',
    border: '2px solid #fff',
  };

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer min-w-[150px]">
      <Handle
        type="source"
        position={Position.Top}
        style={handleStyle}
        id="source-top"
      />
      <Handle
        type="target"
        position={Position.Top}
        style={handleStyle}
        id="target-top"
      />
      
      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle}
        id="source-right"
      />
      <Handle
        type="target"
        position={Position.Right}
        style={handleStyle}
        id="target-right"
      />
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={handleStyle}
        id="source-bottom"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        style={handleStyle}
        id="target-bottom"
      />
      
      <Handle
        type="source"
        position={Position.Left}
        style={handleStyle}
        id="source-left"
      />
      <Handle
        type="target"
        position={Position.Left}
        style={handleStyle}
        id="target-left"
      />

      <div className="font-medium text-sm truncate">{data.label}</div>
    </div>
  );
};

export default memo(NoteNode);