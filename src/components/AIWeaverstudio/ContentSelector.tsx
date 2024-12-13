import React, { useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import useNoteStore from '../../store/noteStore';
import useNotebookStore from '../../store/notebookStore';
import useFolderStore from '../../store/folderStore';
import type { Note, Notebook, Folder } from '../../types/Note';

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
  const [openDropdown, setOpenDropdown] = React.useState<'notes' | 'notebooks' | 'folders' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-open dropdowns when searching
  useEffect(() => {
    if (searchQuery) {
      setOpenDropdown('folders');
    } else {
      setOpenDropdown(null);
    }
  }, [searchQuery]);

  // Helper function to get notebooks in a folder
  const getNotebooksInFolder = (folderId: string) => {
    return notebooks.filter(notebook => notebook.folder_id === folderId);
  };

  // Helper function to get notes in a notebook
  const getNotesInNotebook = (notebookId: string) => {
    return notes.filter(note => 
      note.notebook_id === notebookId && 
      !note.is_trashed && 
      !note.is_archived
    );
  };

  // Helper function to get all notes in a folder
  const getNotesInFolder = (folderId: string) => {
    const folderNotebooks = getNotebooksInFolder(folderId);
    return notes.filter(note => 
      folderNotebooks.some(nb => nb.id === note.notebook_id) &&
      !note.is_trashed && 
      !note.is_archived
    );
  };

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

  const hasSearchResults = filteredFolders.length > 0 || filteredNotebooks.length > 0 || filteredNotes.length > 0;

  const toggleNote = (note: Note) => {
    const isSelected = selectedNotes.some(n => n.id === note.id);
    if (isSelected) {
      onNotesChange(selectedNotes.filter(n => n.id !== note.id));
      
      // If this note's notebook is selected, unselect it
      const notebook = notebooks.find(nb => nb.id === note.notebook_id);
      if (notebook && selectedNotebooks.some(n => n.id === notebook.id)) {
        onNotebooksChange(selectedNotebooks.filter(n => n.id !== notebook.id));
        
        // If this notebook's folder is selected, unselect it
        const folder = folders.find(f => f.id === notebook.folder_id);
        if (folder && selectedFolders.some(f => f.id === folder.id)) {
          onFoldersChange(selectedFolders.filter(f => f.id !== folder.id));
        }
      }
    } else {
      onNotesChange([...selectedNotes, note]);
    }
  };

  const toggleNotebook = (notebook: Notebook) => {
    const isSelected = selectedNotebooks.some(n => n.id === notebook.id);
    if (isSelected) {
      // Unselect notebook and its notes
      onNotebooksChange(selectedNotebooks.filter(n => n.id !== notebook.id));
      const notebookNotes = getNotesInNotebook(notebook.id);
      onNotesChange(selectedNotes.filter(n => !notebookNotes.some(nn => nn.id === n.id)));
      
      // If this notebook's folder is selected, unselect it
      const folder = folders.find(f => f.id === notebook.folder_id);
      if (folder && selectedFolders.some(f => f.id === folder.id)) {
        onFoldersChange(selectedFolders.filter(f => f.id !== folder.id));
      }
    } else {
      // Select notebook and all its notes
      onNotebooksChange([...selectedNotebooks, notebook]);
      const notebookNotes = getNotesInNotebook(notebook.id);
      const newNotes = [...selectedNotes];
      notebookNotes.forEach(note => {
        if (!newNotes.some(n => n.id === note.id)) {
          newNotes.push(note);
        }
      });
      onNotesChange(newNotes);
    }
  };

  const toggleFolder = (folder: Folder) => {
    const isSelected = selectedFolders.some(f => f.id === folder.id);
    if (isSelected) {
      // Unselect folder and all its notebooks and notes
      onFoldersChange(selectedFolders.filter(f => f.id !== folder.id));
      const folderNotebooks = getNotebooksInFolder(folder.id);
      onNotebooksChange(selectedNotebooks.filter(n => !folderNotebooks.some(fn => fn.id === n.id)));
      const folderNotes = getNotesInFolder(folder.id);
      onNotesChange(selectedNotes.filter(n => !folderNotes.some(fn => fn.id === n.id)));
    } else {
      // Select folder and all its notebooks and notes
      onFoldersChange([...selectedFolders, folder]);
      const folderNotebooks = getNotebooksInFolder(folder.id);
      const newNotebooks = [...selectedNotebooks];
      folderNotebooks.forEach(notebook => {
        if (!newNotebooks.some(n => n.id === notebook.id)) {
          newNotebooks.push(notebook);
        }
      });
      onNotebooksChange(newNotebooks);
      
      const folderNotes = getNotesInFolder(folder.id);
      const newNotes = [...selectedNotes];
      folderNotes.forEach(note => {
        if (!newNotes.some(n => n.id === note.id)) {
          newNotes.push(note);
        }
      });
      onNotesChange(newNotes);
    }
  };

  const getDropdownSummary = (type: 'notes' | 'notebooks' | 'folders') => {
    const selected = type === 'notes' ? selectedNotes : type === 'notebooks' ? selectedNotebooks : selectedFolders;
    if (selected.length === 0) return `Select ${type}...`;
    return `${selected.length} ${type} selected`;
  };

  const handleClearAll = () => {
    onNotesChange([]);
    onNotebooksChange([]);
    onFoldersChange([]);
    setSearchQuery('');
    setOpenDropdown(null);
  };

  const hasSelections = selectedNotes.length > 0 || selectedNotebooks.length > 0 || selectedFolders.length > 0;

  return (
    <div className="space-y-4" ref={dropdownRef}>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search notes, notebooks, or folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        {hasSelections && (
          <button
            onClick={handleClearAll}
            className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200 flex items-center gap-2 transition-colors"
          >
            <X size={16} />
            Clear All
          </button>
        )}
      </div>

      {searchQuery && !hasSearchResults && (
        <div className="text-center py-4 text-gray-500">
          No results found for "{searchQuery}"
        </div>
      )}

      <div className="space-y-2">
        {/* Folders Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(openDropdown === 'folders' ? null : 'folders');
            }}
            className={`w-full flex items-center justify-between px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 ${
              searchQuery && filteredFolders.length > 0 ? 'border-yellow-500' : ''
            }`}
          >
            <span className="text-sm">{getDropdownSummary('folders')}</span>
            <div className="flex items-center gap-2">
              {searchQuery && filteredFolders.length > 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  {filteredFolders.length}
                </span>
              )}
              <ChevronDown className={`transform transition-transform ${openDropdown === 'folders' ? 'rotate-180' : ''}`} size={16} />
            </div>
          </button>
          {(openDropdown === 'folders' || (searchQuery && filteredFolders.length > 0)) && (
            <div className="absolute z-30 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2 space-y-1">
                {filteredFolders.map(folder => (
                  <label
                    key={folder.id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFolders.some(f => f.id === folder.id)}
                      onChange={() => toggleFolder(folder)}
                      className="mr-2 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                    />
                    <span className="truncate text-sm">{folder.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notebooks Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(openDropdown === 'notebooks' ? null : 'notebooks');
            }}
            className={`w-full flex items-center justify-between px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 ${
              searchQuery && filteredNotebooks.length > 0 ? 'border-yellow-500' : ''
            }`}
          >
            <span className="text-sm">{getDropdownSummary('notebooks')}</span>
            <div className="flex items-center gap-2">
              {searchQuery && filteredNotebooks.length > 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  {filteredNotebooks.length}
                </span>
              )}
              <ChevronDown className={`transform transition-transform ${openDropdown === 'notebooks' ? 'rotate-180' : ''}`} size={16} />
            </div>
          </button>
          {(openDropdown === 'notebooks' || (searchQuery && filteredNotebooks.length > 0)) && (
            <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2 space-y-1">
                {filteredNotebooks.map(notebook => (
                  <label
                    key={notebook.id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedNotebooks.some(n => n.id === notebook.id)}
                      onChange={() => toggleNotebook(notebook)}
                      className="mr-2 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                    />
                    <span className="truncate text-sm">{notebook.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notes Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(openDropdown === 'notes' ? null : 'notes');
            }}
            className={`w-full flex items-center justify-between px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 ${
              searchQuery && filteredNotes.length > 0 ? 'border-yellow-500' : ''
            }`}
          >
            <span className="text-sm">{getDropdownSummary('notes')}</span>
            <div className="flex items-center gap-2">
              {searchQuery && filteredNotes.length > 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  {filteredNotes.length}
                </span>
              )}
              <ChevronDown className={`transform transition-transform ${openDropdown === 'notes' ? 'rotate-180' : ''}`} size={16} />
            </div>
          </button>
          {(openDropdown === 'notes' || (searchQuery && filteredNotes.length > 0)) && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2 space-y-1">
                {filteredNotes.map(note => (
                  <label
                    key={note.id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedNotes.some(n => n.id === note.id)}
                      onChange={() => toggleNote(note)}
                      className="mr-2 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                    />
                    <span className="truncate text-sm">{note.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}