import React, { useState, useEffect } from 'react';
import { Book, Folder } from 'lucide-react';
import useNotebookStore from '../store/notebookStore';
import useFolderStore from '../store/folderStore';
import useAuthStore from '../store/authStore';

interface FolderNotebookSelectProps {
  selectedNotebookId: string;
  initialFolderId?: string;
  onNotebookSelect: (notebookId: string) => void;
}

export function FolderNotebookSelect({ 
  selectedNotebookId, 
  initialFolderId, 
  onNotebookSelect 
}: FolderNotebookSelectProps) {
  const { user } = useAuthStore();
  const { notebooks, addNotebook } = useNotebookStore();
  const { folders, addFolder } = useFolderStore();
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [showNewNotebookInput, setShowNewNotebookInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newNotebookName, setNewNotebookName] = useState('');
  const [error, setError] = useState('');

  // Initialize selected folder based on selected notebook or initial folder
  useEffect(() => {
    if (selectedNotebookId) {
      const notebook = notebooks.find(n => n.id === selectedNotebookId);
      if (notebook) {
        setSelectedFolderId(notebook.folder_id);
      }
    } else if (initialFolderId) {
      setSelectedFolderId(initialFolderId);
    } else if (folders.length > 0 && !selectedFolderId) {
      const defaultFolder = folders.find(f => f.is_default);
      if (defaultFolder) {
        setSelectedFolderId(defaultFolder.id);
      }
    }
  }, [selectedNotebookId, initialFolderId, notebooks, folders, selectedFolderId]);

  const filteredNotebooks = notebooks.filter(
    notebook => notebook.folder_id === selectedFolderId
  );

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Please enter a folder name');
      return;
    }
    if (!user) {
      setError('You must be logged in to create a folder');
      return;
    }
    setError('');

    try {
      const folder = {
        name: newFolderName.trim(),
        user_id: user.id,
        color: '#ffffff',
        is_default: false,
      };
      
      const result = await addFolder(folder);
      if (!result) {
        throw new Error('Failed to create folder');
      }
      
      setShowNewFolderInput(false);
      setNewFolderName('');
    } catch (error) {
      console.error('Error creating folder:', error);
      setError(error instanceof Error ? error.message : 'Failed to create folder');
    }
  };

  const handleCreateNotebook = async () => {
    if (!newNotebookName.trim()) {
      setError('Please enter a notebook name');
      return;
    }
    if (!user) {
      setError('You must be logged in to create a notebook');
      return;
    }
    if (!selectedFolderId) {
      setError('Please select a folder first');
      return;
    }
    setError('');

    try {
      const notebook = {
        name: newNotebookName.trim(),
        user_id: user.id,
        color: '#ffffff',
        folder_id: selectedFolderId,
      };

      const newNotebook = await addNotebook(notebook);
      if (!newNotebook) {
        throw new Error('Failed to create notebook');
      }

      onNotebookSelect(newNotebook.id);
      setShowNewNotebookInput(false);
      setNewNotebookName('');
    } catch (error) {
      console.error('Error creating notebook:', error);
      setError(error instanceof Error ? error.message : 'Failed to create notebook');
    }
  };

  const handleNewNotebookClick = () => {
    if (!selectedFolderId) {
      setError('Please select a folder first');
      return;
    }
    setError('');
    setShowNewNotebookInput(true);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        {showNewFolderInput ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name"
              className="px-2 py-1 border rounded-lg text-sm w-48"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                }
              }}
            />
            <button
              onClick={handleCreateFolder}
              className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowNewFolderInput(false);
                setNewFolderName('');
                setError('');
              }}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        ) : showNewNotebookInput ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newNotebookName}
              onChange={(e) => setNewNotebookName(e.target.value)}
              placeholder="New notebook name"
              className="px-2 py-1 border rounded-lg text-sm w-48"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateNotebook();
                }
              }}
            />
            <button
              onClick={handleCreateNotebook}
              className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowNewNotebookInput(false);
                setNewNotebookName('');
                setError('');
              }}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Folder size={16} className="text-gray-500" />
              <select
                value={selectedFolderId}
                onChange={(e) => {
                  setSelectedFolderId(e.target.value);
                  setError('');
                }}
                className="border rounded-lg px-2 py-1 pr-8 text-sm"
              >
                <option value="">Select Folder</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Book size={16} className="text-gray-500" />
              <select
                value={selectedNotebookId}
                onChange={(e) => onNotebookSelect(e.target.value)}
                className="border rounded-lg px-2 py-1 pr-8 text-sm"
              >
                <option value="">Select Notebook</option>
                {filteredNotebooks.map((notebook) => (
                  <option key={notebook.id} value={notebook.id}>
                    {notebook.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setShowNewFolderInput(true);
                setError('');
              }}
              className="p-1 hover:bg-gray-100 rounded-lg"
              title="Create new folder"
            >
              <Folder size={16} />
            </button>
            <button
              onClick={handleNewNotebookClick}
              className="p-1 hover:bg-gray-100 rounded-lg"
              title="Create new notebook"
            >
              <Book size={16} />
            </button>
          </>
        )}
      </div>
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
    </div>
  );
}