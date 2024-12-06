import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ContentSelector } from './ContentSelector';
import { AIAnalysisResults } from './AIAnalysisResults';
import { AnalysisTypeSelector } from './components/AnalysisTypeSelector';
import { AnalyzeButton } from './components/AnalyzeButton';
import { generateHolisticSummary, generateCombinedFlashcards, generateCombinedQuiz } from '../../lib/aiUtils';
import type { Note, Notebook, Folder } from '../../types';

interface AIWeaverstudioProps {
  onClose: () => void;
}

export function AIWeaverstudio({ onClose }: AIWeaverstudioProps) {
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [selectedNotebooks, setSelectedNotebooks] = useState<Notebook[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<Folder[]>([]);
  const [analysisType, setAnalysisType] = useState<'summary' | 'flashcards' | 'quiz' | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!analysisType) return;
    
    setLoading(true);
    try {
      let result;
      switch (analysisType) {
        case 'summary':
          result = await generateHolisticSummary(selectedNotes, selectedNotebooks, selectedFolders);
          break;
        case 'flashcards':
          result = await generateCombinedFlashcards(selectedNotes, selectedNotebooks, selectedFolders);
          break;
        case 'quiz':
          result = await generateCombinedQuiz(selectedNotes, selectedNotebooks, selectedFolders);
          break;
      }
      setResults({ type: analysisType, data: result });
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between bg-gray-50">
        <h1 className="text-2xl font-semibold">AI Weaverstudio</h1>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-lg"
          title="Close"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <ContentSelector
            selectedNotes={selectedNotes}
            selectedNotebooks={selectedNotebooks}
            selectedFolders={selectedFolders}
            onNotesChange={setSelectedNotes}
            onNotebooksChange={setSelectedNotebooks}
            onFoldersChange={setSelectedFolders}
          />

          <AnalysisTypeSelector
            analysisType={analysisType}
            onTypeSelect={setAnalysisType}
          />

          <AnalyzeButton
            loading={loading}
            analysisType={analysisType}
            selectedNotes={selectedNotes}
            selectedNotebooks={selectedNotebooks}
            selectedFolders={selectedFolders}
            onAnalyze={handleAnalyze}
          />

          {results && (
            <AIAnalysisResults
              type={results.type}
              data={results.data}
              onClose={() => setResults(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}