import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface LabelManagerProps {
  labels: string[];
  onUpdate: (labels: string[]) => void;
  onClose: () => void;
}

export default function LabelManager({ labels, onUpdate, onClose }: LabelManagerProps) {
  const [newLabel, setNewLabel] = useState('');
  const [currentLabels, setCurrentLabels] = useState(labels);

  const handleAddLabel = () => {
    if (!newLabel.trim() || currentLabels.includes(newLabel.trim())) return;
    const updatedLabels = [...currentLabels, newLabel.trim()];
    setCurrentLabels(updatedLabels);
    setNewLabel('');
  };

  const handleRemoveLabel = (label: string) => {
    const updatedLabels = currentLabels.filter(l => l !== label);
    setCurrentLabels(updatedLabels);
  };

  const handleSave = () => {
    onUpdate(currentLabels);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Labels</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Add new label"
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
            />
            <button
              onClick={handleAddLabel}
              disabled={!newLabel.trim()}
              className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {currentLabels.map((label) => (
              <div
                key={label}
                className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg"
              >
                <span>{label}</span>
                <button
                  onClick={() => handleRemoveLabel(label)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}