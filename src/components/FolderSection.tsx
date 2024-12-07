import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder as FolderIcon, Plus, Book } from 'lucide-react';
import { FolderMenu } from './FolderMenu';
import { NotebookMenu } from './NotebookMenu';
import { ConfirmDialog } from './ConfirmDialog';
import useSidebarStore from '../store/sidebarStore';
import type { Folder, Notebook } from '../types/Note';

interface FolderSectionProps {
  folder: Folder;
  notebooks: Notebook[];
  selectedCategory: string;
  selectedFolder: string | null;
  isCollapsed: boolean;
  onSelectCategory: (id: string) => void;
  onSelectFolder: (id: string) => void;
  onAddNotebook: (folderId: string) => void;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
  onEditNotebook: (notebook: Notebook) => void;
  onDeleteNotebook: (notebook: Notebook) => void;
  onMoveNotebook: (notebook: Notebook, newFolderId: string) => void;
}

export function FolderSection({
  folder,
  notebooks,
  selectedCategory,
  selectedFolder,
  isCollapsed,
  onSelectCategory,
  onSelectFolder,
  onAddNotebook,
  onEditFolder,
  onDeleteFolder,
  onEditNotebook,
  onDeleteNotebook,
  onMoveNotebook,
}: FolderSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteFolderDialog, setShowDeleteFolderDialog] = useState(false);
  const [showDeleteNotebookDialog, setShowDeleteNotebookDialog] = useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState<Notebook | null>(null);
  const { setSelectedCategory, setSelectedFolder } = useSidebarStore();
  const folderNotebooks = notebooks.filter(n => n.folder_id === folder.id);
  const isSelected = selectedFolder === folder.id;

  const handleDeleteFolder = () => {
    setShowDeleteFolderDialog(true);
  };

  const handleDeleteNotebook = (notebook: Notebook) => {
    setNotebookToDelete(notebook);
    setShowDeleteNotebookDialog(true);
  };

  const handleConfirmFolderDelete = async () => {
    // Reset navigation before deleting
    if (selectedFolder === folder.id || folderNotebooks.some(n => n.id === selectedCategory)) {
      setSelectedCategory('all');
      setSelectedFolder(null);
    }
    
    // Delete the folder
    await onDeleteFolder(folder);
    setShowDeleteFolderDialog(false);
  };

  const handleConfirmNotebookDelete = async () => {
    if (notebookToDelete) {
      // Reset navigation if the deleted notebook was selected
      if (selectedCategory === notebookToDelete.id) {
        setSelectedCategory('all');
        setSelectedFolder(null);
      }
      
      await onDeleteNotebook(notebookToDelete);
      setShowDeleteNotebookDialog(false);
      setNotebookToDelete(null);
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <div
        className={`group flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-between'
        } px-3 py-2 rounded-lg transition-colors ${
          isSelected ? 'bg-yellow-100 text-yellow-800' : 'text-gray-700 hover:bg-gray-100'
        } cursor-pointer`}
      >
        <button
          onClick={() => {
            if (!isCollapsed) {
              setIsExpanded(!isExpanded);
            }
            onSelectFolder(folder.id);
          }}
          className={`flex items-center ${isCollapsed ? 'justify-center' : ''} flex-1 min-w-0 space-x-2`}
        >
          {!isCollapsed && (
            <span className="text-gray-400 flex-shrink-0">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
          <FolderIcon size={20} className="flex-shrink-0" />
          {!isCollapsed && (
            <div className="flex items-center min-w-0 overflow-hidden">
              <span className="truncate">{folder.name}</span>
              {folder.is_pinned && (
                <div className="ml-2 text-yellow-600 flex-shrink-0" title="Pinned">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="17" x2="12" y2="22"/>
                    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
                  </svg>
                </div>
              )}
            </div>
          )}
        </button>
        {!isCollapsed && (
          <div className="flex items-center flex-shrink-0 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddNotebook(folder.id);
              }}
              className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus size={16} />
            </button>
            <FolderMenu
              folder={folder}
              onEdit={onEditFolder}
              onDelete={handleDeleteFolder}
            />
          </div>
        )}
      </div>
      {isExpanded && !isCollapsed && (
        <div className="mt-1 ml-6 overflow-hidden">
          {folderNotebooks.map((notebook) => (
            <div key={notebook.id} className="group">
              <div
                onClick={() => {
                  onSelectCategory(notebook.id);
                  setSelectedFolder(null);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === notebook.id
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'text-gray-700 hover:bg-gray-100'
                } cursor-pointer`}
              >
                <div className="flex items-center min-w-0 space-x-2">
                  <Book size={20} className="flex-shrink-0" />
                  <span className="truncate">{notebook.name}</span>
                </div>
                <NotebookMenu
                  notebook={notebook}
                  onEdit={onEditNotebook}
                  onDelete={() => handleDeleteNotebook(notebook)}
                  onMove={onMoveNotebook}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteFolderDialog && (
        <ConfirmDialog
          title="Delete Folder"
          message={`Are you sure you want to delete "${folder.name}"? This action cannot be undone. All notebooks and notes within this folder will be permanently deleted.`}
          confirmLabel="Delete Forever"
          isDestructive={true}
          onConfirm={handleConfirmFolderDelete}
          onCancel={() => setShowDeleteFolderDialog(false)}
        />
      )}

      {showDeleteNotebookDialog && notebookToDelete && (
        <ConfirmDialog
          title="Delete Notebook"
          message={`Are you sure you want to delete "${notebookToDelete.name}"? This action cannot be undone. All notes within this notebook will be permanently deleted.`}
          confirmLabel="Delete Forever"
          isDestructive={true}
          onConfirm={handleConfirmNotebookDelete}
          onCancel={() => {
            setShowDeleteNotebookDialog(false);
            setNotebookToDelete(null);
          }}
        />
      )}
    </div>
  );
}