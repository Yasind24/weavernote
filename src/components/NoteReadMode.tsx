import React, { useState } from 'react';
import { X, Edit2, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { formatNoteContent } from '../utils/noteUtils';
import type { Note } from '../types/Note';

interface NoteReadModeProps {
  note: Note;
  onEdit: () => void;
  onClose: () => void;
}

export function NoteReadMode({ note, onEdit, onClose }: NoteReadModeProps) {
  const [contentWidth, setContentWidth] = useState<'narrow' | 'medium' | 'wide' | 'full'>('medium');
  const formattedContent = formatNoteContent(note.content);

  const widthClasses = {
    narrow: 'max-w-2xl',
    medium: 'max-w-4xl',
    wide: 'max-w-6xl',
    full: 'max-w-none'
  };

  const handleWidthChange = () => {
    const widths: ('narrow' | 'medium' | 'wide' | 'full')[] = ['narrow', 'medium', 'wide', 'full'];
    const currentIndex = widths.indexOf(contentWidth);
    const nextIndex = (currentIndex + 1) % widths.length;
    setContentWidth(widths[nextIndex]);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">{note.title}</h1>
          <button
            onClick={handleWidthChange}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 text-sm text-gray-600"
            title="Adjust reading width"
          >
            {contentWidth === 'full' ? (
              <>
                <Minimize2 size={18} />
                <span>Narrow view</span>
              </>
            ) : (
              <>
                <Maximize2 size={18} />
                <span>Wider view</span>
              </>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Edit note"
          >
            <Edit2 size={20} />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div 
        className="flex-1 overflow-auto py-8 px-4"
        style={{ backgroundColor: note.color }}
      >
        <div className={`mx-auto ${widthClasses[contentWidth]} transition-all duration-300`}>
          <div 
            className="prose prose-lg max-w-none bg-white rounded-lg p-8 shadow-sm [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:break-words"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white rounded-full shadow-lg p-2">
        <button
          onClick={() => setContentWidth('narrow')}
          className={`p-2 rounded-lg transition-colors ${
            contentWidth === 'narrow' ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-100'
          }`}
          title="Narrow width"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setContentWidth('medium')}
          className={`p-2 rounded-lg transition-colors ${
            contentWidth === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-100'
          }`}
          title="Medium width"
        >
          <span className="w-4 h-4 block bg-current rounded-sm transform scale-75" />
        </button>
        <button
          onClick={() => setContentWidth('wide')}
          className={`p-2 rounded-lg transition-colors ${
            contentWidth === 'wide' ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-100'
          }`}
          title="Wide width"
        >
          <span className="w-4 h-4 block bg-current rounded-sm" />
        </button>
        <button
          onClick={() => setContentWidth('full')}
          className={`p-2 rounded-lg transition-colors ${
            contentWidth === 'full' ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-100'
          }`}
          title="Full width"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}