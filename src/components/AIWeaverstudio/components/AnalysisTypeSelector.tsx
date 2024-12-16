import React from 'react';
import { Brain, BookOpen, HelpCircle } from 'lucide-react';

interface AnalysisTypeSelectorProps {
  analysisType: 'summary' | 'flashcards' | 'quiz' | null;
  onTypeSelect: (type: 'summary' | 'flashcards' | 'quiz') => void;
}

export function AnalysisTypeSelector({ analysisType, onTypeSelect }: AnalysisTypeSelectorProps) {
  return (
    <div className="border-t pt-8">
      <h2 className="text-lg font-semibold mb-4">What do you want to weave?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onTypeSelect('summary')}
          className={`p-4 rounded-lg border flex items-center gap-3 hover:bg-gray-50 ${
            analysisType === 'summary' ? 'border-yellow-500 bg-yellow-50' : ''
          }`}
        >
          <Brain className="text-yellow-600" />
          <div className="text-left">
            <div className="font-medium">Holistic Summary</div>
            <div className="text-sm text-gray-600">Weave a summary</div>
          </div>
        </button>

        <button
          onClick={() => onTypeSelect('flashcards')}
          className={`p-4 rounded-lg border flex items-center gap-3 hover:bg-gray-50 ${
            analysisType === 'flashcards' ? 'border-yellow-500 bg-yellow-50' : ''
          }`}
        >
          <BookOpen className="text-yellow-600" />
          <div className="text-left">
            <div className="font-medium">Combined Flashcards</div>
            <div className="text-sm text-gray-600">Weave flashcards</div>
          </div>
        </button>

        <button
          onClick={() => onTypeSelect('quiz')}
          className={`p-4 rounded-lg border flex items-center gap-3 hover:bg-gray-50 ${
            analysisType === 'quiz' ? 'border-yellow-500 bg-yellow-50' : ''
          }`}
        >
          <HelpCircle className="text-yellow-600" />
          <div className="text-left">
            <div className="font-medium">Knowledge Quiz</div>
            <div className="text-sm text-gray-600">Weave practice questions</div>
          </div>
        </button>
      </div>
    </div>
  );
}