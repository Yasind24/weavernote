import React, { useState, useEffect } from 'react';
import { X, Filter } from 'lucide-react';
import { ReactFlowProvider } from 'reactflow';
import { NoteGraph } from './NoteGraph';
import { NoteReadMode } from './NoteReadMode';
import useNoteStore from '../store/noteStore';
import useNotebookStore from '../store/notebookStore';
import useFolderStore from '../store/folderStore';
import useSidebarStore from '../store/sidebarStore';
import type { Note } from '../types/Note';

interface NoteVisualizerProps {
  onNoteSelect: (noteId: string) => void;
  onClose: () => void;
}

export function NoteVisualizer({ onNoteSelect, onClose }: NoteVisualizerProps) {
  const { notes } = useNoteStore();
  const { notebooks } = useNotebookStore();
  const { folders } = useFolderStore();
  const { selectedCategory, selectedFolder: currentFolder } = useSidebarStore();
  const [selectedFolder, setSelectedFolder] = useState<string>(currentFolder || '');
  const [selectedNotebook, setSelectedNotebook] = useState<string>(
    selectedCategory !== 'all' && selectedCategory !== 'archive' && selectedCategory !== 'trash'
      ? selectedCategory
      : ''
  );
  const [showFilters, setShowFilters] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Update selected folder/notebook when sidebar selection changes
  useEffect(() => {
    if (currentFolder) {
      setSelectedFolder(currentFolder);
      setSelectedNotebook('');
    } else if (
      selectedCategory !== 'all' &&
      selectedCategory !== 'archive' &&
      selectedCategory !== 'trash'
    ) {
      const notebook = notebooks.find(n => n.id === selectedCategory);
      if (notebook) {
        setSelectedFolder(notebook.folder_id);
        setSelectedNotebook(notebook.id);
      }
    }
  }, [currentFolder, selectedCategory, notebooks]);

  const filteredNotebooks = selectedFolder
    ? notebooks.filter(notebook => notebook.folder_id === selectedFolder)
    : notebooks;

  const filteredNotes = notes.filter(note => {
    // Basic filters
    if (note.is_trashed || note.is_archived) return false;

    // Filter by notebook if selected
    if (selectedNotebook) {
      return note.notebook_id === selectedNotebook;
    }

    // Filter by folder if selected
    if (selectedFolder) {
      return filteredNotebooks.some(notebook => notebook.id === note.notebook_id);
    }

    // Show all non-archived, non-trashed notes if no filters
    return true;
  });

  const handleFolderChange = (folderId: string) => {
    setSelectedFolder(folderId);
    setSelectedNotebook(''); // Reset notebook selection when folder changes
  };

  const handleNoteSelect = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setSelectedNote(note);
    }
  };

  if (selectedNote) {
    return (
      <NoteReadMode
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
        onEdit={() => {
          onNoteSelect(selectedNote.id);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Note Connections</h2>
            <p className="text-sm text-gray-600">
              Visualize and explore connections between your notes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg ${
                showFilters ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-100'
              }`}
              title="Show filters"
            >
              <Filter size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex gap-4 pt-2">
            <select
              value={selectedFolder}
              onChange={(e) => handleFolderChange(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">All Folders</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>

            <select
              value={selectedNotebook}
              onChange={(e) => setSelectedNotebook(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">All Notebooks</option>
              {filteredNotebooks.map((notebook) => (
                <option key={notebook.id} value={notebook.id}>
                  {notebook.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="flex-1">
        {filteredNotes.length > 0 ? (
          <ReactFlowProvider>
            <NoteGraph notes={filteredNotes} onNoteSelect={handleNoteSelect} />
          </ReactFlowProvider>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No notes found for the selected filters
          </div>
        )}
      </div>
    </div>
  );
}