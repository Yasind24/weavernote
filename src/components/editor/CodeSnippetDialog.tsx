import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import Select, { SingleValue } from 'react-select'

interface LanguageOption {
  value: string
  label: string
}

const languageOptions: LanguageOption[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
  // Add more languages as needed
]

interface CodeSnippetDialogProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (code: string, language: string) => void
}

export default function CodeSnippetDialog({ isOpen, onClose, onInsert }: CodeSnippetDialogProps) {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState<LanguageOption>(languageOptions[0])

  const handleInsert = () => {
    onInsert(code, language.value)
    setCode('')
    setLanguage(languageOptions[0])
    onClose()
  }

  const handleLanguageChange = (newValue: SingleValue<LanguageOption>) => {
    if (newValue) {
      setLanguage(newValue)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        open={isOpen} 
        onClose={onClose} 
        className="relative z-[100]" 
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
              Insert Code Snippet
            </Dialog.Title>
            <div className="mt-4">
              <Select
                options={languageOptions}
                value={language}
                onChange={handleLanguageChange}
                className="mb-4"
              />
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-48 p-2 border rounded-md font-mono"
                placeholder="Enter your code here..."
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
        </div>
      </Dialog>
    </Transition>
  )
} 