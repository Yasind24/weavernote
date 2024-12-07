import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { common, createLowlight } from 'lowlight';
import { uploadImage } from '../lib/supabase';
import useAuthStore from '../store/authStore';
import { parseNoteReference, removeNoteReference } from '../utils/noteUtils';
import { NoteReference } from './NoteReference';
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Type,
  Highlighter,
  CheckSquare,
  Image as ImageIcon,
  Loader2,
  Code,
  Table as TableIcon,
  Rows,
  Columns,
  Plus,
  Minus,
  Trash,
} from 'lucide-react';
import CodeSnippetDialog from './editor/CodeSnippetDialog';
import TableDialog from './editor/TableDialog';
import { createPortal } from 'react-dom';
import { Portal } from '@headlessui/react';
import { toast } from 'react-hot-toast';

// Initialize lowlight with common languages
const lowlight = createLowlight(common);

interface NoteReference {
  id: string;
  title: string;
}
interface MenuBarProps {
  editor: Editor;
  references?: NoteReference[];
  onReferencesChange?: (refs: NoteReference[]) => void;
}

export const MenuBar = ({ editor, references = [], onReferencesChange }: MenuBarProps) => {
  const [textColor, setTextColor] = useState('#000000');
  const [showHighlightColors, setShowHighlightColors] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const [isCodeSnippetDialogOpen, setIsCodeSnippetDialogOpen] = useState(false);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const highlightButtonRef = useRef<HTMLButtonElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const HIGHLIGHT_COLORS = [
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Pink', value: '#fbcfe8' },
    { name: 'Orange', value: '#fed7aa' },
    { name: 'Purple', value: '#e9d5ff' },
    { name: 'Gray', value: '#e5e7eb' },
    { name: 'Coral', value: '#fecaca' }
  ];

  // Add click outside handler for highlight color picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showHighlightColors &&
          highlightButtonRef.current &&
          colorPickerRef.current &&
          !highlightButtonRef.current.contains(event.target as Node) &&
          !colorPickerRef.current.contains(event.target as Node)) {
        setShowHighlightColors(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHighlightColors]);

  if (!editor) {
    return null;
  }

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    setTextColor(newColor);
    editor.chain().focus().setColor(newColor).run();
  };

  const handleHighlightColor = (color: string) => {
    editor.chain().focus().toggleHighlight({ color }).run();
    setShowHighlightColors(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      const imageUrl = await uploadImage(file, user.id);
      if (imageUrl) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInsertCode = (code: string, language: string) => {
    editor
      .chain()
      .focus()
      .setCodeBlock({ language })
      .insertContent(code)
      .enter()
      .setCodeBlock({ language: language })
      .enter()
      .run();
  };

  const insertTable = (rows: number, cols: number) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
  };

  const handleRemoveReference = (index: number) => {
    if (onReferencesChange) {
      const newReferences = [...references];
      newReferences.splice(index, 1);
      onReferencesChange(newReferences);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 sticky top-0 bg-white z-50">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('bold') ? 'bg-gray-100' : ''
          }`}
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('italic') ? 'bg-gray-100' : ''
          }`}
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('underline') ? 'bg-gray-100' : ''
          }`}
        >
          <UnderlineIcon size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('strike') ? 'bg-gray-100' : ''
          }`}
        >
          <Strikethrough size={18} />
        </button>
        <div className="relative">
          <button
            ref={highlightButtonRef}
            onClick={() => setShowHighlightColors(!showHighlightColors)}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 ${
              editor.isActive('highlight') ? 'bg-gray-100' : ''
            }`}
          >
            <Highlighter size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          
          {showHighlightColors && highlightButtonRef.current && (
            <Portal>
              <div 
                ref={colorPickerRef}
                className="fixed bg-white border rounded-lg shadow-lg p-2 z-[200] flex flex-wrap gap-1 w-[120px]"
                style={{
                  top: `${highlightButtonRef.current.getBoundingClientRect().top - 45}px`,
                  left: `${highlightButtonRef.current.getBoundingClientRect().left}px`
                }}
              >
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    className="w-5 h-5 rounded hover:ring-2 ring-offset-1 ring-gray-400"
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleHighlightColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </Portal>
          )}
        </div>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-100' : ''
          }`}
        >
          <Type size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('bulletList') ? 'bg-gray-100' : ''
          }`}
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('orderedList') ? 'bg-gray-100' : ''
          }`}
        >
          <ListOrdered size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('taskList') ? 'bg-gray-100' : ''
          }`}
        >
          <CheckSquare size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('blockquote') ? 'bg-gray-100' : ''
          }`}
        >
          <Quote size={18} />
        </button>
        <button
          onClick={() => setIsCodeSnippetDialogOpen(true)}
          className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 ${
            editor.isActive('codeBlock') ? 'bg-gray-100' : ''
          }`}
        >
          <Code size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
        {editor.isActive('table') && (
          <div className="flex gap-1 items-center border-l pl-1">
            <button
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="p-1.5 sm:p-2 rounded hover:bg-gray-100"
              title="Delete column"
            >
              <Columns size={16} className="rotate-90" />
              <Minus size={14} className="absolute -right-1 -top-1" />
            </button>
            <button
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="p-1.5 sm:p-2 rounded hover:bg-gray-100"
              title="Add column before"
            >
              <Columns size={16} className="rotate-90" />
              <Plus size={14} className="absolute -left-1 -top-1" />
            </button>
            <button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="p-1.5 sm:p-2 rounded hover:bg-gray-100"
              title="Add column after"
            >
              <Columns size={16} className="rotate-90" />
              <Plus size={14} className="absolute -right-1 -top-1" />
            </button>
            <div className="border-l pl-1">
              <button
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="p-1.5 sm:p-2 rounded hover:bg-gray-100"
                title="Delete row"
              >
                <Rows size={16} />
                <Minus size={14} className="absolute -right-1 -top-1" />
              </button>
              <button
                onClick={() => editor.chain().focus().addRowBefore().run()}
                className="p-1.5 sm:p-2 rounded hover:bg-gray-100"
                title="Add row before"
              >
                <Rows size={16} />
                <Plus size={14} className="absolute -left-1 -top-1" />
              </button>
              <button
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="p-1.5 sm:p-2 rounded hover:bg-gray-100"
                title="Add row after"
              >
                <Rows size={16} />
                <Plus size={14} className="absolute -right-1 -top-1" />
              </button>
            </div>
            <div className="border-l pl-1">
              <button
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="p-1.5 sm:p-2 rounded hover:bg-gray-100 text-red-600"
                title="Delete table"
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        )}
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 rounded hover:bg-gray-100 relative"
          >
            {uploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ImageIcon size={18} />
            )}
          </button>
        </div>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-100"
        >
          <Undo size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-100"
        >
          <Redo size={18} />
        </button>
        <input
          type="color"
          onChange={handleColorChange}
          value={textColor}
          className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
          data-testid="color-picker"
        />
      </div>

      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} className="prose max-w-none p-2 sm:p-4" />
      </div>

      {references.length > 0 && (
        <div className="border-t border-gray-200 p-2">
          <div className="text-sm text-gray-500 mb-2">Referenced Notes:</div>
          <div className="flex flex-wrap gap-2">
            {references.map((ref, index) => (
              <div
                key={ref.id}
                className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-sm"
              >
                <span>{ref.title}</span>
                <button
                  onClick={() => handleRemoveReference(index)}
                  className="hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <CodeSnippetDialog
        isOpen={isCodeSnippetDialogOpen}
        onClose={() => setIsCodeSnippetDialogOpen(false)}
        onInsert={handleInsertCode}
      />

      <TableDialog
        isOpen={isTableDialogOpen}
        onClose={() => setIsTableDialogOpen(false)}
        onInsert={insertTable}
      />
    </div>
  );
};

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  lineWrapping?: {
    enabled?: boolean;
    putOnNewLine?: boolean;
    wrapHeads?: string;
    wrapTails?: string;
  };
}

export default function RichTextEditor({ content, onChange, lineWrapping }: RichTextEditorProps) {
  const [textColor, setTextColor] = useState('#000000');
  const [showHighlightColors, setShowHighlightColors] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const highlightButtonRef = useRef<HTMLButtonElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const [isCodeSnippetDialogOpen, setIsCodeSnippetDialogOpen] = useState(false);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);

  // Add click outside handler for highlight color picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showHighlightColors &&
          highlightButtonRef.current &&
          colorPickerRef.current &&
          !highlightButtonRef.current.contains(event.target as Node) &&
          !colorPickerRef.current.contains(event.target as Node)) {
        setShowHighlightColors(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHighlightColors]);

  const HIGHLIGHT_COLORS = [
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Pink', value: '#fbcfe8' },
    { name: 'Orange', value: '#fed7aa' },
    { name: 'Purple', value: '#e9d5ff' },
    { name: 'Gray', value: '#e5e7eb' },
    { name: 'Coral', value: '#fecaca' }
  ];

  // Extract note references from content
  const references = content.match(/\[\[note:[a-f0-9-]+\|([^\]]+)\]\]/g) || [];
  const parsedReferences = references.map(ref => parseNoteReference(ref)).filter(Boolean);

  // Create display content by removing reference syntax
  const displayContent = content.replace(/\[\[note:[a-f0-9-]+\|([^\]]+)\]\]/g, '');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      TextStyle,
      Color,
      Highlight.configure({ 
        multicolor: true,
        HTMLAttributes: {
          class: 'highlight',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto my-4',
          draggable: 'false'
        },
      }),
      Table.configure({
        resizable: true,
        handleWidth: 5,
        cellMinWidth: 100,
        lastColumnResizable: true,
        allowTableNodeSelection: false,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
        exitOnArrowDown: true,
        HTMLAttributes: {
          class: 'rounded-md bg-gray-50 p-4',
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[300px]',
      },
      handlePaste: (view, event, slice) => {
        // Handle code block paste
        if (view.state.selection.$head.parent.type.name === 'codeBlock') {
          setTimeout(() => {
            editor?.chain()
              .focus()
              .command(({ tr, dispatch }) => {
                if (dispatch) {
                  tr.lift(tr.selection.$from.blockRange()!, 0);
                }
                return true;
              })
              .enter()
              .run();
          }, 0);
          return false;
        }

        // Handle image paste
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find(item => item.type.startsWith('image/'));
        
        if (imageItem && user) {
          event.preventDefault();
          const file = imageItem.getAsFile();
          if (!file) return true;

          // Upload and insert image asynchronously
          (async () => {
            try {
              setUploading(true);
              const imageUrl = await uploadImage(file, user.id);
              if (imageUrl) {
                editor?.chain()
                  .focus()
                  .setImage({ src: imageUrl })
                  .createParagraphNear()
                  .run();
              }
            } catch (error) {
              console.error('Error uploading pasted image:', error);
              toast.error('Failed to upload pasted image');
            } finally {
              setUploading(false);
            }
          })();
          return true;
        }

        return false;
      },
    },
    content: displayContent,
    onUpdate: ({ editor }) => {
      // Preserve references when updating content
      const newContent = editor.getHTML();
      const updatedContent = references.reduce((acc, ref) => `${acc}\n${ref}`, newContent);
      onChange(updatedContent);
    },
  });

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    setTextColor(newColor);
    editor?.chain().focus().setColor(newColor).run();
  };

  const handleHighlightColor = (color: string) => {
    editor?.chain().focus().toggleHighlight({ color }).run();
    setShowHighlightColors(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      const imageUrl = await uploadImage(file, user.id);
      if (imageUrl) {
        editor?.chain().focus().setImage({ src: imageUrl }).run();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveReference = (referenceId: string) => {
    const updatedContent = removeNoteReference(content, referenceId);
    onChange(updatedContent);
  };

  const insertCodeSnippet = useCallback((code: string, language: string) => {
    if (editor) {
      editor
        .chain()
        .focus()
        .setCodeBlock({ language })
        .insertContent(code)
        .enter()
        .run();
    }
  }, [editor]);

  const insertTable = useCallback((rows: number, cols: number) => {
    if (editor) {
      editor.chain().focus().insertTable({ rows, cols }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white flex flex-col h-full">
      <div className="border-b border-gray-200 p-1.5 sm:p-2 flex flex-wrap gap-1 overflow-x-auto">
        <div className="flex gap-1 items-center min-w-0 flex-grow sm:flex-grow-0">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 ${
              editor.isActive('bold') ? 'bg-gray-100' : ''
            }`}
          >
            <Bold size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 ${
              editor.isActive('italic') ? 'bg-gray-100' : ''
            }`}
          >
            <Italic size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 ${
              editor.isActive('underline') ? 'bg-gray-100' : ''
            }`}
          >
            <UnderlineIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 ${
              editor.isActive('strike') ? 'bg-gray-100' : ''
            }`}
          >
            <Strikethrough size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>

        <div className="flex gap-1 items-center min-w-0">
          <div className="relative">
            <button
              ref={highlightButtonRef}
              onClick={() => setShowHighlightColors(!showHighlightColors)}
              className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 ${
                editor.isActive('highlight') ? 'bg-gray-100' : ''
              }`}
            >
              <Highlighter size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            
            {showHighlightColors && highlightButtonRef.current && (
              <Portal>
                <div 
                  ref={colorPickerRef}
                  className="fixed bg-white border rounded-lg shadow-lg p-2 z-[200] flex flex-wrap gap-1 w-[120px]"
                  style={{
                    top: `${highlightButtonRef.current.getBoundingClientRect().top - 45}px`,
                    left: `${highlightButtonRef.current.getBoundingClientRect().left}px`
                  }}
                >
                  {HIGHLIGHT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      className="w-5 h-5 rounded hover:ring-2 ring-offset-1 ring-gray-400"
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleHighlightColor(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </Portal>
            )}
          </div>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-100' : ''
            }`}
          >
            <Type size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>

        <div className="flex gap-1 items-center min-w-0">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 ${
              editor.isActive('bulletList') ? 'bg-gray-100' : ''
            }`}
          >
            <List size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 ${
              editor.isActive('orderedList') ? 'bg-gray-100' : ''
            }`}
          >
            <ListOrdered size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 ${
              editor.isActive('taskList') ? 'bg-gray-100' : ''
            }`}
          >
            <CheckSquare size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 ${
              editor.isActive('blockquote') ? 'bg-gray-100' : ''
            }`}
          >
            <Quote size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            onClick={() => setIsTableDialogOpen(true)}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 ${
              editor.isActive('table') ? 'bg-gray-100' : ''
            }`}
          >
            <TableIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            onClick={() => setIsCodeSnippetDialogOpen(true)}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 ${
              editor.isActive('codeBlock') ? 'bg-gray-100' : ''
            }`}
          >
            <Code size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>

        <div className="flex gap-1 items-center min-w-0">
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-1.5 sm:p-2 rounded hover:bg-gray-100 relative"
            >
              {uploading ? (
                <Loader2 size={16} className="sm:w-[18px] sm:h-[18px] animate-spin" />
              ) : (
                <ImageIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
              )}
            </button>
          </div>

          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-1.5 sm:p-2 rounded hover:bg-gray-100"
          >
            <Undo size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-1.5 sm:p-2 rounded hover:bg-gray-100"
          >
            <Redo size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <input
            type="color"
            onChange={handleColorChange}
            value={textColor}
            className="w-7 h-7 sm:w-8 sm:h-8 p-0 border-0 rounded cursor-pointer"
            data-testid="color-picker"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} className="prose max-w-none p-2 sm:p-4" />
      </div>

      {parsedReferences.length > 0 && (
        <div className="border-t p-2 space-y-1 bg-gray-50">
          {parsedReferences.map((ref, index) => (
            ref && (
              <NoteReference
                key={ref.id}
                id={ref.id}
                title={ref.title}
                isFirst={index === 0}
                onRemove={handleRemoveReference}
              />
            )
          ))}
        </div>
      )}

      {editor.isActive('table') && <TableMenu editor={editor} />}

      <CodeSnippetDialog
        isOpen={isCodeSnippetDialogOpen}
        onClose={() => setIsCodeSnippetDialogOpen(false)}
        onInsert={insertCodeSnippet}
      />

      <TableDialog
        isOpen={isTableDialogOpen}
        onClose={() => setIsTableDialogOpen(false)}
        onInsert={insertTable}
      />
    </div>
  );
}

const TableMenu = ({ editor }: { editor: Editor }) => {
  if (!editor.isActive('table')) return null;

  return (
    <div className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-1.5 flex items-center gap-1.5">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-700 relative w-8 h-8 flex items-center justify-center"
          title="Add column before"
        >
          <div className="flex items-center">
            <div className="w-3 h-4 border-r border-current"/>
            <Plus size={14} className="mx-0.5" />
            <div className="w-3 h-4"/>
          </div>
        </button>
        <button
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-700 relative w-8 h-8 flex items-center justify-center"
          title="Add column after"
        >
          <div className="flex items-center">
            <div className="w-3 h-4"/>
            <Plus size={14} className="mx-0.5" />
            <div className="w-3 h-4 border-l border-current"/>
          </div>
        </button>
        <button
          onClick={() => editor.chain().focus().deleteColumn().run()}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-700 relative w-8 h-8 flex items-center justify-center"
          title="Delete column"
        >
          <div className="flex items-center">
            <div className="w-3 h-4"/>
            <div className="w-3 h-4 border-x border-current relative">
              <Minus size={14} className="absolute -top-1 left-1/2 -translate-x-1/2" />
            </div>
            <div className="w-3 h-4"/>
          </div>
        </button>
      </div>

      <div className="h-5 w-px bg-gray-200 mx-0.5" />

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => editor.chain().focus().addRowBefore().run()}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-700 relative w-8 h-8 flex items-center justify-center"
          title="Add row before"
        >
          <div className="flex flex-col items-center">
            <div className="h-3 w-4 border-b border-current"/>
            <Plus size={14} className="my-0.5" />
            <div className="h-3 w-4"/>
          </div>
        </button>
        <button
          onClick={() => editor.chain().focus().addRowAfter().run()}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-700 relative w-8 h-8 flex items-center justify-center"
          title="Add row after"
        >
          <div className="flex flex-col items-center">
            <div className="h-3 w-4"/>
            <Plus size={14} className="my-0.5" />
            <div className="h-3 w-4 border-t border-current"/>
          </div>
        </button>
        <button
          onClick={() => editor.chain().focus().deleteRow().run()}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-700 relative w-8 h-8 flex items-center justify-center"
          title="Delete row"
        >
          <div className="flex flex-col items-center">
            <div className="h-3 w-4"/>
            <div className="h-3 w-4 border-y border-current relative">
              <Minus size={14} className="absolute -top-1 left-1/2 -translate-x-1/2" />
            </div>
            <div className="h-3 w-4"/>
          </div>
        </button>
      </div>

      <div className="h-5 w-px bg-gray-200 mx-0.5" />

      <button
        onClick={() => editor.chain().focus().deleteTable().run()}
        className="p-1.5 rounded hover:bg-gray-100 text-red-600 w-8 h-8 flex items-center justify-center"
        title="Delete table"
      >
        <Trash size={14} />
      </button>
    </div>
  );
};

