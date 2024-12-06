import React, { useState, useRef } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';
import type { Notebook } from '../types';

interface NotebookMenuProps {
  notebook: Notebook;
  onEdit: (notebook: Notebook) => void;
  onDelete: (notebook: Notebook) => void;
}

export function NotebookMenu({ notebook, onEdit, onDelete }: NotebookMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setShowMenu(false));

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(notebook);
    setShowMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notebook);
    setShowMenu(false);
  };

  return (
    <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setShowMenu(!showMenu)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setShowMenu(!showMenu);
          }
        }}
        className="p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        <MoreVertical size={16} />
      </div>
      {showMenu && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div
            role="button"
            tabIndex={0}
            onClick={handleEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleEdit(e as unknown as React.MouseEvent);
              }
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 cursor-pointer"
          >
            <Edit size={16} />
            <span>Rename</span>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={handleDelete}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleDelete(e as unknown as React.MouseEvent);
              }
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-red-600 cursor-pointer"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </div>
        </div>
      )}
    </div>
  );
}