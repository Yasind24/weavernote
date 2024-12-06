import { Dialog } from '@headlessui/react';
import { LinkIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  note: {
    id?: string;
    title: string;
    content: string;
  };
}

export function ShareDialog({ isOpen, onClose, note }: ShareDialogProps) {
  const shareUrl = note.id ? `${window.location.origin}/notes/${note.id}` : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
      onClose();
    } catch (err) {
      console.error('Failed to copy link:', err);
      alert('Failed to copy link');
    }
  };

  const handleCopyContent = async () => {
    try {
      const textContent = `${note.title}\n\n${note.content}`;
      await navigator.clipboard.writeText(textContent);
      alert('Note copied to clipboard!');
      onClose();
    } catch (err) {
      console.error('Failed to copy note:', err);
      alert('Failed to copy note');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-sm">
          <Dialog.Title className="text-lg font-medium mb-4">Share Note</Dialog.Title>
          
          <div className="space-y-4">
            {note.id && (
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <LinkIcon className="h-5 w-5" />
                Copy Share Link
              </button>
            )}
            
            <button
              onClick={handleCopyContent}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <DocumentDuplicateIcon className="h-5 w-5" />
              Copy Note to Clipboard
            </button>
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 