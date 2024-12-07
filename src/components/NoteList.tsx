import React, { useState } from 'react';
import { Plus, Search, Tag, Calendar, Network, Sparkles } from 'lucide-react';
import useNoteStore from '../store/noteStore';
import useSidebarStore from '../store/sidebarStore';
import useNotebookStore from '../store/notebookStore';
import useFolderStore from '../store/folderStore';
import useDraftStore from '../store/draftStore';
import NoteCard from './NoteCard';
import NoteEditor from './NoteEditor';
import { NoteVisualizer } from './NoteVisualizer';
import { AIWeaverstudio } from './AIWeaverstudio/AIWeaverstudio';
import type { Note } from '../types/Note';

export function NoteList() {
  const { notes, fetchNotes } = useNoteStore();
  const { notebooks } = useNotebookStore();
  const { folders } = useFolderStore();
  const { setDraft } = useDraftStore();
  const { selectedCategory, selectedFolder } = useSidebarStore();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchByLabel, setSearchByLabel] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilterType, setDateFilterType] = useState<'created' | 'updated'>('updated');
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [showAIStudio, setShowAIStudio] = useState(false);

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedNote(null);
    setDraft(null); // Clear draft when closing editor
    fetchNotes();
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setDraft(null); // Clear any existing draft
    setIsEditorOpen(true);
  };

  // Rest of the component remains the same...
  const getFilteredNotes = () => {
    let filtered = notes;

    // First, apply folder/notebook filters
    if (selectedFolder) {
      // Get all notebook IDs in the selected folder
      const folderNotebookIds = notebooks
        .filter(notebook => notebook.folder_id === selectedFolder)
        .map(notebook => notebook.id);
      
      filtered = notes.filter(note => 
        folderNotebookIds.includes(note.notebook_id) &&
        !note.is_archived &&
        !note.is_trashed
      );
    } else if (selectedCategory !== 'all' && selectedCategory !== 'archive' && selectedCategory !== 'trash') {
      // If a notebook is selected
      filtered = notes.filter(note => 
        note.notebook_id === selectedCategory && 
        !note.is_archived && 
        !note.is_trashed
      );
    } else {
      // Apply category filters
      switch (selectedCategory) {
        case 'all':
          filtered = notes.filter(note => !note.is_archived && !note.is_trashed);
          break;
        case 'archive':
          filtered = notes.filter(note => note.is_archived && !note.is_trashed);
          break;
        case 'trash':
          filtered = notes.filter(note => note.is_trashed);
          break;
      }
    }

    // Then apply search filters
    if (searchQuery) {
      filtered = filtered.filter(note => {
        if (searchByLabel) {
          return note.labels?.some(label => 
            label.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else {
          return (
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.labels?.some(label => 
              label.toLowerCase().includes(searchQuery.toLowerCase())
            )
          );
        }
      });
    }

    // Finally apply date filters
    if (startDate || endDate) {
      filtered = filtered.filter(note => {
        const noteDate = new Date(dateFilterType === 'updated' ? note.updated_at : note.created_at);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && end) {
          return noteDate >= start && noteDate <= end;
        } else if (start) {
          return noteDate >= start;
        } else if (end) {
          return noteDate <= end;
        }
        return true;
      });
    }

    return filtered;
  };

  const getCategoryTitle = () => {
    if (selectedFolder) {
      const folder = folders.find(f => f.id === selectedFolder);
      return folder ? `${folder.name} Notes` : 'Notes';
    }
    if (selectedCategory === 'all') return 'All Notes';
    if (selectedCategory === 'archive') return 'Archived Notes';
    if (selectedCategory === 'trash') return 'Trash';
    const notebook = notebooks.find(n => n.id === selectedCategory);
    return notebook ? notebook.name : 'Notes';
  };

  const filteredNotes = getFilteredNotes();
  
  // Separate pinned and unpinned notes
  const pinnedNotes = filteredNotes.filter(note => note.is_pinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.is_pinned);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 sm:p-6 border-b">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{getCategoryTitle()}</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            {selectedCategory !== 'trash' && selectedCategory !== 'archive' && (
              <>
                <button
                  onClick={() => setShowAIStudio(true)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                >
                  <Sparkles size={20} />
                  <span>AI Studio</span>
                </button>
                <button
                  onClick={() => setShowVisualizer(true)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                >
                  <Network size={20} />
                  <span>Visualize</span>
                </button>
                <button
                  onClick={handleNewNote}
                  className="w-full sm:w-auto px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center justify-center space-x-2"
                >
                  <Plus size={20} />
                  <span>New Note</span>
                </button>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
            />
          </div>
          <button
            onClick={() => setSearchByLabel(!searchByLabel)}
            className={`p-1.5 rounded-lg flex items-center gap-1.5 text-sm ${
              searchByLabel ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Tag size={18} />
            <span>Labels</span>
          </button>
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className={`p-1.5 rounded-lg flex items-center gap-1.5 text-sm ${
              showDateFilter ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar size={18} />
            <span>Date</span>
          </button>
        </div>
        {showDateFilter && (
          <div className="flex gap-2 mb-4">
            <select
              value={dateFilterType}
              onChange={(e) => setDateFilterType(e.target.value as 'created' | 'updated')}
              className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Created Date</option>
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
              placeholder="End Date"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear
              </button>
            )}
          </div>
        )}
        {searchQuery && (
          <div className="text-sm text-gray-500">
            Found {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {pinnedNotes.length > 0 && (
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <line x1="12" y1="17" x2="12" y2="22"/>
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
              </svg>
              <span>Pinned Notes</span>
            </div>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {pinnedNotes.map((note) => (
                <div key={note.id} className="break-inside-avoid mb-4">
                  <NoteCard key={note.id} note={note} onEdit={handleEditNote} />
                </div>
              ))}
            </div>
          </div>
        )}

        {unpinnedNotes.length > 0 && (
          <div>
            {pinnedNotes.length > 0 && (
              <div className="text-sm text-gray-500 mb-3">Other Notes</div>
            )}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {unpinnedNotes.map((note) => (
                <div key={note.id} className="break-inside-avoid mb-4">
                  <NoteCard key={note.id} note={note} onEdit={handleEditNote} />
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredNotes.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-lg mb-2">No notes found</div>
            <div className="text-sm">
              {searchQuery
                ? 'Try adjusting your search query'
                : selectedCategory === 'trash'
                ? 'Trash is empty'
                : selectedCategory === 'archive'
                ? 'No archived notes'
                : 'Create a new note to get started'}
            </div>
          </div>
        )}
      </div>

      {showAIStudio && (
        <AIWeaverstudio onClose={() => setShowAIStudio(false)} />
      )}

      {showVisualizer && (
        <NoteVisualizer
          onNoteSelect={(noteId) => {
            const note = notes.find(n => n.id === noteId);
            if (note) {
              handleEditNote(note);
            }
          }}
          onClose={() => setShowVisualizer(false)}
        />
      )}

      {isEditorOpen && (
        <NoteEditor
          note={selectedNote}
          initialNotebookId={selectedCategory !== 'all' && selectedCategory !== 'archive' && selectedCategory !== 'trash' ? selectedCategory : undefined}
          onClose={handleEditorClose}
        />
      )}
    </div>
  );
}