import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { Plus, Minus } from 'lucide-react'

interface TableDialogProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (rows: number, cols: number) => void
}

export default function TableDialog({ isOpen, onClose, onInsert }: TableDialogProps) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)

  const handleInsert = () => {
    onInsert(rows, cols)
    setRows(3)
    setCols(3)
    onClose()
  }

  const adjustValue = (setter: (value: number) => void, current: number, increment: boolean) => {
    const newValue = increment ? current + 1 : current - 1
    setter(Math.min(10, Math.max(1, newValue)))
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Insert Table
                </Dialog.Title>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rows</label>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() => adjustValue(setRows, rows, false)}
                        className="p-1 rounded hover:bg-gray-100"
                        disabled={rows <= 1}
                      >
                        <Minus size={16} className={rows <= 1 ? 'text-gray-300' : 'text-gray-600'} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={rows}
                        onChange={(e) => setRows(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="block w-20 text-center rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                      />
                      <button
                        onClick={() => adjustValue(setRows, rows, true)}
                        className="p-1 rounded hover:bg-gray-100"
                        disabled={rows >= 10}
                      >
                        <Plus size={16} className={rows >= 10 ? 'text-gray-300' : 'text-gray-600'} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Columns</label>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() => adjustValue(setCols, cols, false)}
                        className="p-1 rounded hover:bg-gray-100"
                        disabled={cols <= 1}
                      >
                        <Minus size={16} className={cols <= 1 ? 'text-gray-300' : 'text-gray-600'} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={cols}
                        onChange={(e) => setCols(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="block w-20 text-center rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                      />
                      <button
                        onClick={() => adjustValue(setCols, cols, true)}
                        className="p-1 rounded hover:bg-gray-100"
                        disabled={cols >= 10}
                      >
                        <Plus size={16} className={cols >= 10 ? 'text-gray-300' : 'text-gray-600'} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-900 hover:bg-yellow-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
                    onClick={handleInsert}
                  >
                    Insert
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 