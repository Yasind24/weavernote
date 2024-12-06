import React, { useState, useRef } from 'react';
import { MoreVertical, Archive, Trash2, Edit } from 'lucide-react';
import useNoteStore from '../store/noteStore';
import { useClickOutside } from '../hooks/useClickOutside';
import { formatDate } from '../utils/dateUtils';
import { formatNoteContent } from '../utils/noteUtils';
import type { Note } from '../types/Note';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
}

export default function NoteCard({ note, onEdit }: NoteCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { updateNote, deleteNote } = useNoteStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setShowMenu(false));

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateNote(note.id, { is_archived: !note.is_archived });
    setShowMenu(false);
  };

  const handleTrash = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateNote(note.id, { 
      is_trashed: true,
      trashed_at: new Date().toISOString()
    });
    setShowMenu(false);
  };

  const handleRestore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateNote(note.id, { 
      is_trashed: false,
      is_archived: false,
      trashed_at: null
    });
    setShowMenu(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this note?')) {
      await deleteNote(note.id);
    }
    setShowMenu(false);
  };

  const getDeletionDate = () => {
    if (!note.trashed_at) return null;
    const deletionDate = new Date(note.trashed_at);
    deletionDate.setDate(deletionDate.getDate() + 2);
    return deletionDate.toLocaleDateString();
  };

  const formattedContent = formatNoteContent(note.content);

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group h-full"
      onClick={() => onEdit(note)}
      style={{ backgroundColor: note.color }}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 line-clamp-1 flex-1 mr-2">{note.title}</h3>
          <div className="relative" ref={menuRef}>
            <button 
              className="p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity sm:block"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreVertical size={16} />
            </button>
            {showMenu && (
              <div className="fixed sm:absolute transform -translate-x-48 sm:-translate-x-48 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {!note.is_trashed && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(note);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleArchive}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Archive size={16} />
                      <span>{note.is_archived ? 'Unarchive' : 'Archive'}</span>
                    </button>
                    <button
                      onClick={handleTrash}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-red-600"
                    >
                      <Trash2 size={16} />
                      <span>Move to Trash</span>
                    </button>
                  </>
                )}
                {note.is_trashed && (
                  <>
                    <button
                      onClick={handleRestore}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Archive size={16} />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-red-600"
                    >
                      <Trash2 size={16} />
                      <span>Delete Permanently</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {note.labels && note.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {note.labels.map((label) => (
              <span
                key={label}
                className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        <div 
          className="text-gray-600 text-sm prose prose-sm flex-grow min-h-[60px] max-h-[200px] overflow-hidden"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />

        <div className="mt-4 pt-2 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex justify-between items-center">
            <span>Created {formatDate(note.created_at)}</span>
            {note.updated_at && note.updated_at !== note.created_at && (
              <span>Edited {formatDate(note.updated_at)}</span>
            )}
          </div>
          {note.is_trashed && note.trashed_at && (
            <div className="mt-1 text-red-600">
              Will be deleted {getDeletionDate()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}