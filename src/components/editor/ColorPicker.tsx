import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

const presetColors = [
  '#ffffff', // White
  '#f1f5f9', // Slate 100
  '#fee2e2', // Red 100
  '#ffedd5', // Orange 100
  '#fef9c3', // Yellow 100
  '#dcfce7', // Green 100
  '#ccfbf1', // Teal 100
  '#e0f2fe', // Sky 100
  '#dbeafe', // Blue 100
  '#f3e8ff', // Purple 100
  '#fae8ff', // Pink 100
  '#f5f5f4', // Stone 100
];

export function ColorPicker({ color, onChange, onClose }: ColorPickerProps) {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border w-[240px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Choose Color</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {presetColors.map((presetColor) => (
          <button
            key={presetColor}
            onClick={() => onChange(presetColor)}
            className={`w-16 h-16 rounded-lg border hover:scale-105 transition-transform ${
              color === presetColor ? 'ring-2 ring-yellow-500 ring-offset-2' : ''
            }`}
            style={{ backgroundColor: presetColor }}
            title={presetColor}
          />
        ))}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
        >
          <span>Custom Color</span>
          {showCustom ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showCustom && (
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border p-4 w-[240px]">
            <HexColorPicker 
              color={color} 
              onChange={onChange}
            />
            <div className="mt-4 flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: color }}
              />
              <input
                type="text"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 