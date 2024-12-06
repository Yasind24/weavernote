import React from 'react';
import { Panel } from 'reactflow';
import { Layout, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import type { Edge } from 'reactflow';
import type { LayoutType } from '../../utils/graphUtils';

interface GraphControlsProps {
  selectedEdge: Edge | null;
  currentLayout: LayoutType;
  isFullscreen: boolean;
  onRemoveEdge: () => void;
  onLayoutChange: (layout: LayoutType) => void;
  onToggleFullscreen: () => void;
}

export function GraphControls({
  selectedEdge,
  currentLayout,
  isFullscreen,
  onRemoveEdge,
  onLayoutChange,
  onToggleFullscreen,
}: GraphControlsProps) {
  return (
    <Panel position="top-right" className="space-x-2">
      {selectedEdge && (
        <button
          onClick={onRemoveEdge}
          className="px-3 py-2 bg-white rounded-lg shadow-sm border border-red-200 hover:bg-red-50 text-red-600 flex items-center gap-2"
          title="Remove connection"
        >
          <Trash2 size={16} />
          <span className="text-sm">Remove Connection</span>
        </button>
      )}
      <button
        onClick={() => onLayoutChange('circular')}
        className={`px-3 py-2 bg-white rounded-lg shadow-sm border hover:bg-gray-50 ${
          currentLayout === 'circular' ? 'border-yellow-500 text-yellow-600' : 'border-gray-200'
        }`}
        title="Circular layout"
      >
        <Layout size={16} />
      </button>
      <button
        onClick={() => onLayoutChange('grid')}
        className={`px-3 py-2 bg-white rounded-lg shadow-sm border hover:bg-gray-50 ${
          currentLayout === 'grid' ? 'border-yellow-500 text-yellow-600' : 'border-gray-200'
        }`}
        title="Grid layout"
      >
        ⊞
      </button>
      <button
        onClick={() => onLayoutChange('horizontal')}
        className={`px-3 py-2 bg-white rounded-lg shadow-sm border hover:bg-gray-50 ${
          currentLayout === 'horizontal' ? 'border-yellow-500 text-yellow-600' : 'border-gray-200'
        }`}
        title="Horizontal layout"
      >
        ⬌
      </button>
      <button
        onClick={() => onLayoutChange('vertical')}
        className={`px-3 py-2 bg-white rounded-lg shadow-sm border hover:bg-gray-50 ${
          currentLayout === 'vertical' ? 'border-yellow-500 text-yellow-600' : 'border-gray-200'
        }`}
        title="Vertical layout"
      >
        ⬍
      </button>
      <button
        onClick={onToggleFullscreen}
        className="px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50"
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>
    </Panel>
  );
}