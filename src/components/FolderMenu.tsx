import React, { useState, useRef } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';
import useFolderStore from '../store/folderStore';
import type { Folder } from '../types/Note';

interface FolderMenuProps {
  folder: Folder;
  onEdit: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
}

export function FolderMenu({ folder, onEdit, onDelete }: FolderMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { togglePin } = useFolderStore();

  useClickOutside(menuRef, () => setShowMenu(false));

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(folder);
    setShowMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(folder);
    setShowMenu(false);
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    try {
      await togglePin(folder.id);
    } catch (error) {
      console.error('Error toggling pin:', error);
      setShowMenu(true);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreVertical size={16} />
      </button>
      {showMenu && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={handleTogglePin}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="17" x2="12" y2="22"/>
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
            </svg>
            <span>{folder.is_pinned ? 'Unpin' : 'Pin'}</span>
          </button>
          <button
            onClick={handleEdit}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
          >
            <Edit size={16} />
            <span>Rename</span>
          </button>
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-red-600"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}