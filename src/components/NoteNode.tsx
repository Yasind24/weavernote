import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { Note } from '../types/Note';

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
    borderRadius: '50%',
    cursor: 'crosshair',
  };

  return (
    <div className="relative px-4 py-2 shadow-md rounded-md bg-white border border-gray-200 hover:shadow-lg transition-shadow min-w-[150px]">
      <Handle
        type="target"
        position={Position.Top}
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={handleStyle}
      />
      <div className="font-medium text-sm truncate">{data.label}</div>
    </div>
  );
};

export default memo(NoteNode);