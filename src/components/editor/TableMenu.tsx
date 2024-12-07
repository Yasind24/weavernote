import { Editor } from '@tiptap/react'
import { Rows, Columns, Plus, Minus, Trash } from 'lucide-react'
import React from 'react'

interface TableMenuProps {
  editor: Editor
}

export default function TableMenu({ editor }: TableMenuProps) {
  if (!editor?.isActive('table')) return null

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 p-1 flex gap-1">
      <div className="border-r border-gray-200 pr-1 flex gap-1">
        <button
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          className="relative p-1.5 rounded hover:bg-gray-100 text-gray-700"
          title="Add column before"
        >
          <Columns size={14} className="rotate-90" />
          <Plus size={14} className="absolute -right-1 -top-1" />
        </button>
        <button
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          className="relative p-1.5 rounded hover:bg-gray-100 text-gray-700"
          title="Add column after"
        >
          <Columns size={14} className="rotate-90" />
          <Plus size={14} className="absolute -right-1 -bottom-1" />
        </button>
        <button
          onClick={() => editor.chain().focus().deleteColumn().run()}
          className="relative p-1.5 rounded hover:bg-gray-100 text-gray-700"
          title="Delete column"
        >
          <Columns size={14} className="rotate-90" />
          <Minus size={14} className="absolute -right-1 -top-1" />
        </button>
      </div>

      <div className="border-r border-gray-200 pr-1 flex gap-1">
        <button
          onClick={() => editor.chain().focus().addRowBefore().run()}
          className="relative p-1.5 rounded hover:bg-gray-100 text-gray-700"
          title="Add row before"
        >
          <Rows size={14} />
          <Plus size={14} className="absolute -right-1 -top-1" />
        </button>
        <button
          onClick={() => editor.chain().focus().addRowAfter().run()}
          className="relative p-1.5 rounded hover:bg-gray-100 text-gray-700"
          title="Add row after"
        >
          <Rows size={14} />
          <Plus size={14} className="absolute -right-1 -bottom-1" />
        </button>
        <button
          onClick={() => editor.chain().focus().deleteRow().run()}
          className="relative p-1.5 rounded hover:bg-gray-100 text-gray-700"
          title="Delete row"
        >
          <Rows size={14} />
          <Minus size={14} className="absolute -right-1 -top-1" />
        </button>
      </div>

      <button
        onClick={() => editor.chain().focus().deleteTable().run()}
        className="p-1.5 rounded hover:bg-gray-100 text-red-600"
        title="Delete table"
      >
        <Trash size={14} />
      </button>
    </div>
  )
} 