import React from 'react';
import { Link, X } from 'lucide-react';

interface NoteReferenceProps {
  id: string;
  title: string;
  isFirst?: boolean;
  onRemove?: (id: string) => void;
}

export function NoteReference({ id, title, isFirst = false, onRemove }: NoteReferenceProps) {
  return (
    <div className="flex items-center gap-2 text-gray-700 group">
      {isFirst && <Link size={16} className="text-yellow-500" />}
      <span>{isFirst ? `Connected Notes | ${title}` : `• ${title}`}</span>
      {onRemove && (
        <button
          onClick={() => onRemove(id)}
          className="p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove connection"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}