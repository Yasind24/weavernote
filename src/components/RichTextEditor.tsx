import React, { useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
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
  ChevronDown,
  CheckSquare,
  Image as ImageIcon,
  Loader2,
  Code,
  X,
} from 'lucide-react';
import CodeSnippetDialog from './editor/CodeSnippetDialog';

// Initialize lowlight with common languages
const lowlight = createLowlight(common);

interface MenuBarProps {
  editor: any;
}

export const MenuBar = ({ editor }: MenuBarProps) => {
  const [textColor, setTextColor] = useState('#000000');
  const [showHighlightColors, setShowHighlightColors] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const [showCodeSnippetDialog, setShowCodeSnippetDialog] = useState(false);

  const HIGHLIGHT_COLORS = [
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Pink', value: '#fbcfe8' },
    { name: 'Orange', value: '#fed7aa' },
  ];

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
      .run();
  };

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
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
          onClick={() => setShowHighlightColors(!showHighlightColors)}
          className={`p-2 rounded hover:bg-gray-100 flex items-center gap-1 ${
            editor.isActive('highlight') ? 'bg-gray-100' : ''
          }`}
        >
          <Highlighter size={18} />
          <ChevronDown size={14} />
        </button>
        {showHighlightColors && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50 w-32">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleHighlightColor(color.value)}
                className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-gray-100"
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-sm">{color.name}</span>
              </button>
            ))}
            <button
              onClick={() => {
                editor.chain().focus().unsetHighlight().run();
                setShowHighlightColors(false);
              }}
              className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-gray-100 mt-1 border-t"
            >
              <div className="w-4 h-4 rounded border border-gray-300" />
              <span className="text-sm">Clear</span>
            </button>
          </div>
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
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('codeBlock') ? 'bg-gray-100' : ''
        }`}
      >
        <Code size={18} />
      </button>
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
      <button
        onClick={() => setShowCodeSnippetDialog(true)}
        className="p-2 rounded hover:bg-gray-100"
        title="Insert code snippet"
      >
        <Code size={18} />
      </button>
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
  const { user } = useAuthStore();
  const [isCodeSnippetDialogOpen, setIsCodeSnippetDialogOpen] = useState(false);

  const HIGHLIGHT_COLORS = [
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Pink', value: '#fbcfe8' },
    { name: 'Orange', value: '#fed7aa' },
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
      Image,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'prose-code-block bg-gray-900 text-gray-50 rounded-lg p-4 my-4',
        },
      }),
    ],
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
      editor.chain().focus().setCodeBlock({ language }).insertContent(code).run()
    }
  }, [editor])

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
              onClick={() => setShowHighlightColors(!showHighlightColors)}
              className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 flex items-center gap-1 ${
                editor.isActive('highlight') ? 'bg-gray-100' : ''
              }`}
            >
              <Highlighter size={16} className="sm:w-[18px] sm:h-[18px]" />
              <ChevronDown size={12} className="sm:w-[14px] sm:h-[14px]" />
            </button>
            {showHighlightColors && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50 w-32">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleHighlightColor(color.value)}
                    className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-gray-100"
                  >
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="text-sm">{color.name}</span>
                  </button>
                ))}
                <button
                  onClick={() => {
                    editor.chain().focus().unsetHighlight().run();
                    setShowHighlightColors(false);
                  }}
                  className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-gray-100 mt-1 border-t"
                >
                  <div className="w-4 h-4 rounded border border-gray-300" />
                  <span className="text-sm">Clear</span>
                </button>
              </div>
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

      <CodeSnippetDialog
        isOpen={isCodeSnippetDialogOpen}
        onClose={() => setIsCodeSnippetDialogOpen(false)}
        onInsert={insertCodeSnippet}
      />
    </div>
  );
}