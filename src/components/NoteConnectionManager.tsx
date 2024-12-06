import React, { useState } from 'react';
import { Link } from 'lucide-react';
import useNoteStore from '../store/noteStore';
import { insertNoteReference } from '../utils/noteUtils';
import type { Note } from '../types';

interface NoteConnectionManagerProps {
  currentNote: Note | null;
  onUpdateContent: (content: string) => void;
}

export function NoteConnectionManager({ currentNote, onUpdateContent }: NoteConnectionManagerProps) {
  const { notes } = useNoteStore();
  const [selectedNoteId, setSelectedNoteId] = useState('');

  const availableNotes = notes.filter(note => 
    note.id !== currentNote?.id &&
    !note.is_trashed &&
    !note.is_archived
  );

  const handleAddReference = () => {
    if (!currentNote || !selectedNoteId) return;
    
    const selectedNote = notes.find(note => note.id === selectedNoteId);
    if (!selectedNote) return;

    const updatedContent = insertNoteReference(currentNote.content, selectedNote.id, selectedNote.title);
    onUpdateContent(updatedContent);
    setSelectedNoteId('');
  };

  return (
    <div className="border-t">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Link size={16} className="text-gray-500" />
          <span className="text-sm font-medium">Connect Notes</span>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedNoteId}
            onChange={(e) => setSelectedNoteId(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="">Select a note to connect...</option>
            {availableNotes.map(note => (
              <option key={note.id} value={note.id}>
                {note.title}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddReference}
            disabled={!selectedNoteId}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}