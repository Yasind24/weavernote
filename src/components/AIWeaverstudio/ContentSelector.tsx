import React from 'react';
import { Search } from 'lucide-react';
import useNoteStore from '../../store/noteStore';
import useNotebookStore from '../../store/notebookStore';
import useFolderStore from '../../store/folderStore';
import type { Note, Notebook, Folder } from '../../types';

interface ContentSelectorProps {
  selectedNotes: Note[];
  selectedNotebooks: Notebook[];
  selectedFolders: Folder[];
  onNotesChange: (notes: Note[]) => void;
  onNotebooksChange: (notebooks: Notebook[]) => void;
  onFoldersChange: (folders: Folder[]) => void;
}

export function ContentSelector({
  selectedNotes,
  selectedNotebooks,
  selectedFolders,
  onNotesChange,
  onNotebooksChange,
  onFoldersChange,
}: ContentSelectorProps) {
  const { notes } = useNoteStore();
  const { notebooks } = useNotebookStore();
  const { folders } = useFolderStore();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredNotes = notes.filter(note => 
    !note.is_trashed && 
    !note.is_archived &&
    (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     note.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredNotebooks = notebooks.filter(notebook =>
    notebook.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleNote = (note: Note) => {
    const isSelected = selectedNotes.some(n => n.id === note.id);
    if (isSelected) {
      onNotesChange(selectedNotes.filter(n => n.id !== note.id));
    } else {
      onNotesChange([...selectedNotes, note]);
    }
  };

  const toggleNotebook = (notebook: Notebook) => {
    const isSelected = selectedNotebooks.some(n => n.id === notebook.id);
    if (isSelected) {
      onNotebooksChange(selectedNotebooks.filter(n => n.id !== notebook.id));
    } else {
      onNotebooksChange([...selectedNotebooks, notebook]);
    }
  };

  const toggleFolder = (folder: Folder) => {
    const isSelected = selectedFolders.some(f => f.id === folder.id);
    if (isSelected) {
      onFoldersChange(selectedFolders.filter(f => f.id !== folder.id));
    } else {
      onFoldersChange([...selectedFolders, folder]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search notes, notebooks, or folders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-medium mb-2">Notes</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredNotes.map(note => (
              <label
                key={note.id}
                className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedNotes.some(n => n.id === note.id)}
                  onChange={() => toggleNote(note)}
                  className="mr-2 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                />
                <span className="truncate">{note.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Notebooks</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredNotebooks.map(notebook => (
              <label
                key={notebook.id}
                className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedNotebooks.some(n => n.id === notebook.id)}
                  onChange={() => toggleNotebook(notebook)}
                  className="mr-2 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                />
                <span className="truncate">{notebook.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Folders</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredFolders.map(folder => (
              <label
                key={folder.id}
                className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedFolders.some(f => f.id === folder.id)}
                  onChange={() => toggleFolder(folder)}
                  className="mr-2 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                />
                <span className="truncate">{folder.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}