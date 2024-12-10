import { useState, useEffect, useRef } from 'react';
import RichTextEditor from './RichTextEditor';
import { FolderNotebookSelect } from './FolderNotebookSelect';
import { NoteConnectionManager } from './NoteConnectionManager';
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
import { supabase } from '../lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

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
  const mounted = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

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

  const updateField = (field: keyof typeof state, value: any) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

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

  // Setup real-time subscription for note updates
  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const setupSubscription = async () => {
      if (!note?.id || !mounted.current) return;

      // Don't setup new subscription if we're saving
      if (isSaving) {
        console.log('Skipping subscription setup during save operation');
        return;
      }

      console.log('Setting up real-time subscription for note:', note.id);
      
      try {
        // Only cleanup existing subscription if it's for a different note
        if (channelRef.current) {
          const currentChannel = channelRef.current;
          if (currentChannel.topic === `note-${note.id}`) {
            console.log('Reusing existing subscription');
            return;
          }
          console.log('Cleaning up note subscription');
          await channelRef.current.unsubscribe();
          channelRef.current = null;
        }

        // Create a new channel
        channel = supabase.channel(`note-${note.id}`)
          .on('postgres_changes', 
            { 
              event: 'UPDATE', 
              schema: 'public', 
              table: 'notes',
              filter: `id=eq.${note.id}`
            }, 
            (payload: RealtimePostgresChangesPayload<Note>) => {
              console.log('Received real-time update for note:', payload);
              if (mounted.current && !isSaving) {
                console.log('Updating note from real-time event');
                onClose();
              }
            }
          );

        await channel.subscribe();
        console.log('Successfully subscribed to note updates');
        channelRef.current = channel;
      } catch (err) {
        console.error('Error subscribing to channel:', err);
      }
    };

    setupSubscription();

    return () => {
      const cleanup = async () => {
        // Only cleanup if we're not in the middle of a save
        if (!isSaving && channel) {
          console.log('Cleaning up note subscription');
          await channel.unsubscribe();
          channel = null;
        }
      };
      cleanup();
    };
  }, [note?.id, isSaving, onClose]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isSaving) {
        console.log('Tab became visible, checking subscription');
        // Only reconnect if we're not currently saving
        if (channelRef.current) {
          channelRef.current.subscribe();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSaving]);

  // Cleanup on unmount
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      lastSaveRef.current = null;
    };
  }, []);

  // Save draft when unmounting if there are unsaved changes
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

    if (isSaving) {
      console.log('Already saving, skipping save attempt');
      return;
    }

    console.log('Starting save operation');
    setIsSaving(true);

    try {
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
        labels: state.labels || [],
        position_x: note?.position_x || null,
        position_y: note?.position_y || null,
        layout_type: note?.layout_type || 'circular',
        tags: note?.tags || [],
        updated_at: new Date().toISOString()
      };

      console.log('Attempting to save note:', { id: note?.id, ...noteData });

      if (note) {
        // Use Supabase client directly
        const { data: savedNote, error } = await supabase
          .from('notes')
          .update(noteData)
          .eq('id', note.id)
          .select()
          .single();

        if (error) throw error;
        if (!savedNote) throw new Error('Failed to save note - no data returned');

        console.log('Server response:', savedNote);

        // Update local state
        await updateNote(note.id, savedNote);
      } else {
        await addNote(noteData);
      }

      if (mounted.current) {
        setIsSaving(false);
        toast.success('Note saved successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error saving note:', error);
      if (mounted.current) {
        setIsSaving(false);
        toast.error(error instanceof Error ? error.message : 'Failed to save note');
      }
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