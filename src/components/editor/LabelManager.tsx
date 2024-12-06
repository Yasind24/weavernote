import React, { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';

interface LabelManagerProps {
  noteId?: string;
  title: string;
  content: string;
  labels: string[];
  onLabelsUpdate: (labels: string[]) => void;
  onClose: () => void;
}

export function LabelManager({ 
  labels, 
  onLabelsUpdate, 
  onClose 
}: LabelManagerProps) {
  const [newLabel, setNewLabel] = useState('');

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;
    
    const trimmedLabel = newLabel.trim();
    if (!labels.includes(trimmedLabel)) {
      onLabelsUpdate([...labels, trimmedLabel]);
    }
    setNewLabel('');
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    onLabelsUpdate(labels.filter(label => label !== labelToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddLabel();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border min-w-[250px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Manage Labels</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add new label"
          className="flex-1 px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <button
          onClick={handleAddLabel}
          disabled={!newLabel.trim()}
          className="p-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-2">
        {labels.map((label) => (
          <div 
            key={label}
            className="flex items-center justify-between px-3 py-1.5 bg-yellow-50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-yellow-600" />
              <span className="text-sm">{label}</span>
            </div>
            <button
              onClick={() => handleRemoveLabel(label)}
              className="p-1 hover:bg-yellow-100 rounded"
            >
              <X size={14} className="text-yellow-600" />
            </button>
          </div>
        ))}
        {labels.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">
            No labels added yet
          </p>
        )}
      </div>
    </div>
  );
} 