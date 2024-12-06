import React, { useRef } from 'react';
import { Clipboard, Palette, Eye, X } from 'lucide-react';

interface EditorHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  isReadMode: boolean;
  isSaving: boolean;
  hasNote: boolean;
  onToggleReadMode: () => void;
  onToggleColorPicker: () => void;
  onToggleLabels: () => void;
  onCopyToClipboard: () => void;
  onSave: () => void;
  onClose: () => void;
  labelsCount: number;
  colorButtonRef: React.RefObject<HTMLButtonElement>;
  labelsButtonRef: React.RefObject<HTMLButtonElement>;
}

export function EditorHeader({
  title,
  onTitleChange,
  isReadMode,
  isSaving,
  hasNote,
  onToggleReadMode,
  onToggleColorPicker,
  onToggleLabels,
  onCopyToClipboard,
  onSave,
  onClose,
  labelsCount,
  colorButtonRef,
  labelsButtonRef
}: EditorHeaderProps) {
  return (
    <div className="p-2 sm:p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 rounded-t-lg gap-2">
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Note title"
          className="text-xl sm:text-2xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 flex-1 w-full"
        />
        <div className="flex items-center gap-2 order-first sm:order-none">
          <button
            ref={colorButtonRef}
            onClick={onToggleColorPicker}
            className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors relative"
            title="Change background color"
          >
            <Palette size={18} className="sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={onCopyToClipboard}
            className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            <Clipboard size={18} className="sm:w-5 sm:h-5" />
          </button>
          <button
            ref={labelsButtonRef}
            onClick={onToggleLabels}
            className="px-2 sm:px-3 py-1 text-sm hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
          >
            {labelsCount ? `${labelsCount} labels` : 'Labels'}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {hasNote && (
          <button
            onClick={onToggleReadMode}
            className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="View in read mode"
          >
            <Eye size={18} className="sm:w-5 sm:h-5" />
          </button>
        )}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 text-sm sm:text-base flex-1 sm:flex-auto"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onClose}
          className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Close"
        >
          <X size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}