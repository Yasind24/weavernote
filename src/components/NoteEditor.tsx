import { useState, useEffect, useCallback, useRef } from 'react';
import RichTextEditor from './RichTextEditor';
import { FolderNotebookSelect } from './FolderNotebookSelect';
import { NoteConnectionManager } from './NoteConnectionManager';
import { NoteEnhancer } from './NoteEnhancer';
import { NoteReadMode } from './NoteReadMode';
import { EditorHeader } from './editor/EditorHeader';
import { EditorDialogs } from './editor/EditorDialogs';
import useNoteStore from '../store/noteStore';
import useDraftStore from '../store/draftStore';
import useAuthStore from '../store/authStore';
import useSidebarStore from '../store/sidebarStore';
import type { Note } from '../types/Note';
import { toast } from 'react-hot-toast';
import { stripHtml } from 'string-strip-html';

interface NoteEditorProps {
  note: Note | null;
  initialNotebookId?: string;
  onClose: () => void;
}

export default function NoteEditor({ note, initialNotebookId, onClose }: NoteEditorProps) {
  const { addNote, updateNote } = useNoteStore();
  const { draft, setDraft } = useDraftStore();
  const { user } = useAuthStore();
  const { selectedCategory, selectedFolder } = useSidebarStore();
  const [isReadMode, setIsReadMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeoutId, setSaveTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  const [state, setState] = useState({
    title: note?.title || draft?.title || '',
    content: note?.content || draft?.content || '',
    selectedNotebookId: note?.notebook_id || 
                       (selectedCategory !== 'all' && selectedCategory !== 'archive' && selectedCategory !== 'trash' ? selectedCategory : '') || 
                       initialNotebookId || 
                       draft?.notebookId || '',
    color: note?.color || draft?.color || '#ffffff',
    labels: note?.labels || draft?.labels || [],
  });

  const [dialogs, setDialogs] = useState({
    colorPicker: false,
    labelManager: false
  });

  const updateField = useCallback((field: keyof typeof state, value: any) => {
    setState(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleDialog = (dialog: "colorPicker" | "labelManager") => {
    setDialogs(prev => ({
      ...prev,
      [dialog]: !prev[dialog]
    }));
  };

  const handleCloseDialog = (dialog: "colorPicker" | "labelManager") => {
    setDialogs(prev => ({
      ...prev,
      [dialog]: false
    }));
  };

  useEffect(() => {
    if (!note && draft) {
      setDraft(null);
    }
  }, [note, draft, setDraft]);

  useEffect(() => {
    return () => {
      if (saveTimeoutId) {
        clearTimeout(saveTimeoutId);
      }
    };
  }, [saveTimeoutId]);

  useEffect(() => {
    return () => {
      if (!note && (state.title || state.content)) {
        setDraft({
          title: state.title,
          content: state.content,
          notebookId: state.selectedNotebookId,
          color: state.color,
          labels: state.labels,
        });
      }
    };
  }, [note, state, setDraft]);

  const handleSave = async () => {
    if (!state.selectedNotebookId) {
      toast.error('Please select a notebook');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to save notes');
      return;
    }

    // If already saving, queue the save with increasing delay
    if (isSaving) {
      if (saveTimeoutId) {
        clearTimeout(saveTimeoutId);
      }
      const timeoutId = setTimeout(handleSave, 3000); // Increased delay between retries
      setSaveTimeoutId(timeoutId);
      return;
    }

    setIsSaving(true);
    let saveTimeout: NodeJS.Timeout | null = null;

    try {
      // Create a draft before saving
      const draftData = {
        title: state.title,
        content: state.content,
        notebookId: state.selectedNotebookId,
        color: state.color,
        labels: state.labels,
      };
      setDraft(draftData);

      // Set up save timeout
      saveTimeout = setTimeout(() => {
        setIsSaving(false);
        throw new Error('Save operation timed out');
      }, 15000); // Reduced timeout to 15 seconds

      const noteData = {
        title: state.title || 'Untitled',
        content: state.content,
        notebook_id: state.selectedNotebookId,
        user_id: user.id,
        is_pinned: note?.is_pinned || false,
        is_archived: note?.is_archived || false,
        is_trashed: note?.is_trashed || false,
        trashed_at: note?.trashed_at || null,
        color: state.color,
        labels: state.labels,
        position_x: note?.position_x || null,
        position_y: note?.position_y || null,
        layout_type: note?.layout_type || 'circular',
        tags: note?.tags || [],
      };

      if (note) {
        await updateNote(note.id, noteData);
        toast.success('Note updated successfully');
      } else {
        await addNote(noteData);
        toast.success('Note created successfully');
      }

      // Clear draft and timeout only if save was successful
      setDraft(null);
      if (saveTimeout) clearTimeout(saveTimeout);
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save note';
      toast.error(errorMessage);
      
      // Keep the draft in case of error
      if (!note) {
        setDraft({
          title: state.title,
          content: state.content,
          notebookId: state.selectedNotebookId,
          color: state.color,
          labels: state.labels,
        });
      }

      // Schedule a retry with exponential backoff
      if (saveTimeoutId) {
        clearTimeout(saveTimeoutId);
      }
      const retryDelay = 5000; // Start with 5 seconds delay
      const timeoutId = setTimeout(handleSave, retryDelay);
      setSaveTimeoutId(timeoutId);
    } finally {
      if (saveTimeout) clearTimeout(saveTimeout);
      setIsSaving(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const plainText = stripHtml(state.content, {
        skipHtmlDecoding: true,
        trimOnlySpaces: true,
        dumpLinkHrefsNearby: {
          enabled: false
        }
      }).result;

      const htmlContent = `${state.title}<br><br>${state.content}`;
      const textContent = `${state.title}\n\n${plainText}`;

      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([textContent], { type: 'text/plain' }),
        }),
      ]);

      toast.success('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const labelsButtonRef = useRef<HTMLButtonElement>(null);

  if (isReadMode && note) {
    return (
      <NoteReadMode
        note={{ ...note, title: state.title, content: state.content }}
        onEdit={() => setIsReadMode(false)}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl flex flex-col w-full h-full sm:h-[90vh] sm:max-h-[900px]">
        <EditorHeader
          title={state.title}
          onTitleChange={(title) => updateField('title', title)}
          isReadMode={isReadMode}
          isSaving={isSaving}
          hasNote={!!note}
          onToggleReadMode={() => setIsReadMode(!isReadMode)}
          onToggleColorPicker={() => toggleDialog('colorPicker')}
          onCopyToClipboard={handleCopyToClipboard}
          onToggleLabels={() => toggleDialog('labelManager')}
          onSave={handleSave}
          onClose={onClose}
          labelsCount={state.labels.length}
          colorButtonRef={colorButtonRef}
          labelsButtonRef={labelsButtonRef}
        />

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="p-4 border-b">
            <FolderNotebookSelect
              selectedNotebookId={state.selectedNotebookId}
              initialFolderId={selectedFolder || undefined}
              onNotebookSelect={(id) => updateField('selectedNotebookId', id)}
            />
          </div>
          <div className="flex-1 overflow-auto p-4" style={{ backgroundColor: state.color }}>
            <RichTextEditor 
              content={state.content} 
              onChange={(content) => updateField('content', content)}
              lineWrapping={{
                enabled: false
              }}
            />
          </div>
          <div className="border-t">
            <NoteConnectionManager
              currentNote={note}
              onUpdateContent={(content) => updateField('content', content)}
            />
            <NoteEnhancer 
              note={{
                id: note?.id || '',
                title: state.title,
                content: state.content,
                notebook_id: state.selectedNotebookId,
                user_id: user?.id || '',
                is_pinned: note?.is_pinned || false,
                is_archived: note?.is_archived || false,
                is_trashed: note?.is_trashed || false,
                trashed_at: note?.trashed_at || null,
                color: state.color,
                labels: state.labels,
                tags: note?.tags || [],
                created_at: note?.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
                position_x: note?.position_x || null,
                position_y: note?.position_y || null,
                layout_type: note?.layout_type || 'circular'
              }} 
            />
          </div>
        </div>

        <EditorDialogs
          dialogs={dialogs}
          noteId={note?.id}
          title={state.title}
          content={state.content}
          color={state.color}
          labels={state.labels}
          onColorChange={(color) => updateField('color', color)}
          onLabelsUpdate={(labels) => updateField('labels', labels)}
          onCloseDialog={handleCloseDialog}
          colorButtonRef={colorButtonRef}
          labelsButtonRef={labelsButtonRef}
        />
      </div>
    </div>
  );
}