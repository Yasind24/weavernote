import React, { useState, useRef } from 'react';
import { MoreVertical, Edit2, Trash2, FolderInput } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';
import type { Notebook, Folder } from '../types/Note';
import useFolderStore from '../store/folderStore';

interface NotebookMenuProps {
  notebook: Notebook;
  onEdit: (notebook: Notebook) => void;
  onDelete: (notebook: Notebook) => void;
  onMove: (notebook: Notebook, newFolderId: string) => void;
}

export function NotebookMenu({ notebook, onEdit, onDelete, onMove }: NotebookMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { folders } = useFolderStore();

  useClickOutside(menuRef, () => {
    setShowMenu(false);
    setShowMoveDialog(false);
  });

  const handleMove = (folderId: string) => {
    onMove(notebook, folderId);
    setShowMoveDialog(false);
    setShowMenu(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        <MoreVertical size={16} />
      </div>

      {showMenu && !showMoveDialog && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMoveDialog(true);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
          >
            <FolderInput size={16} />
            <span>Move to Folder</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(notebook);
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
          >
            <Edit2 size={16} />
            <span>Rename</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notebook);
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-red-600"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      )}

      {showMoveDialog && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {folders
            .filter(folder => folder.id !== notebook.folder_id)
            .map(folder => (
              <button
                key={folder.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMove(folder.id);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                {folder.name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}