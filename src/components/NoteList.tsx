import React, { useState } from 'react';
import { Plus, Search, Tag, Calendar, Network, Sparkles } from 'lucide-react';
import useNoteStore from '../store/noteStore';
import useSidebarStore from '../store/sidebarStore';
import useNotebookStore from '../store/notebookStore';
import useFolderStore from '../store/folderStore';
import useDraftStore from '../store/draftStore';
import NoteCard from './NoteCard';
import NoteEditor from './NoteEditor';
import { DateRangeFilter } from './DateRangeFilter';
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
        <div className="space-y-4">
          <div className="relative w-full max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder={searchByLabel ? "Search by label..." : "Search notes..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-20 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={() => setSearchByLabel(!searchByLabel)}
                  className={`px-2 py-1 rounded-md text-xs sm:text-sm flex items-center gap-1 ${
                    searchByLabel ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <Tag size={14} />
                  <span className="hidden sm:inline">Labels</span>
                </button>
                <button
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className={`px-2 py-1 rounded-md text-xs sm:text-sm flex items-center gap-1 ${
                    showDateFilter ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <Calendar size={14} />
                  <span className="hidden sm:inline">Date</span>
                </button>
              </div>
            </div>
          </div>
          {showDateFilter && (
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              dateType={dateFilterType}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onDateTypeChange={setDateFilterType}
              onClear={() => {
                setStartDate('');
                setEndDate('');
              }}
            />
          )}
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-auto">
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
              setShowVisualizer(false);
            }}
            onClose={() => setShowVisualizer(false)}
          />
        )}

        {isEditorOpen ? (
          <NoteEditor
            note={selectedNote}
            initialNotebookId={selectedCategory !== 'all' && selectedCategory !== 'archive' && selectedCategory !== 'trash' ? selectedCategory : undefined}
            onClose={handleEditorClose}
          />
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredNotes.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-8">
                No notes found. {selectedCategory !== 'trash' && selectedCategory !== 'archive' && 'Create your first note!'}
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div key={note.id} className="break-inside-avoid mb-4">
                  <NoteCard note={note} onEdit={handleEditNote} />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}