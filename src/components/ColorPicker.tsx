import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Gray', value: '#f3f4f6' },
  { name: 'Red', value: '#fee2e2' },
  { name: 'Orange', value: '#ffedd5' },
  { name: 'Yellow', value: '#fef9c3' },
  { name: 'Green', value: '#dcfce7' },
  { name: 'Blue', value: '#dbeafe' },
  { name: 'Purple', value: '#f3e8ff' },
  { name: 'Pink', value: '#fce7f3' },
];

export default function ColorPicker({ color, onChange, onClose }: ColorPickerProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  return (
    <div className="absolute right-0 mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[240px]">
      <div className="grid grid-cols-3 gap-2 mb-4">
        {PRESET_COLORS.map((presetColor) => (
          <button
            key={presetColor.value}
            onClick={() => onChange(presetColor.value)}
            className={`w-full aspect-square rounded-lg border transition-all ${
              color === presetColor.value
                ? 'border-yellow-500 scale-90'
                : 'border-gray-200 hover:scale-95'
            }`}
            style={{ backgroundColor: presetColor.value }}
            title={presetColor.name}
          />
        ))}
      </div>

      <button
        onClick={() => setShowCustomPicker(!showCustomPicker)}
        className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2"
      >
        <span>Custom color</span>
        {showCustomPicker ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {showCustomPicker && (
        <div className="mt-4 space-y-4">
          <HexColorPicker color={color} onChange={onChange} />
          <input
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="#RRGGBB"
          />
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={onClose}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}