import React from 'react';
import type { Note, Notebook, Folder } from '../../../types';

interface AnalyzeButtonProps {
  loading: boolean;
  analysisType: 'summary' | 'flashcards' | 'quiz' | null;
  selectedNotes: Note[];
  selectedNotebooks: Notebook[];
  selectedFolders: Folder[];
  onAnalyze: () => void;
}

export function AnalyzeButton({
  loading,
  analysisType,
  selectedNotes,
  selectedNotebooks,
  selectedFolders,
  onAnalyze
}: AnalyzeButtonProps) {
  return (
    <div className="flex justify-center pt-4">
      <button
        onClick={onAnalyze}
        disabled={loading || !analysisType || (
          !selectedNotes.length && 
          !selectedNotebooks.length && 
          !selectedFolders.length
        )}
        className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Analyzing...' : 'Start Analysis'}
      </button>
    </div>
  );
}