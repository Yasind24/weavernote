import React from 'react';
import { X } from 'lucide-react';

interface AIAnalysisResultsProps {
  type: 'summary' | 'flashcards' | 'quiz';
  data: any;
  onClose: () => void;
}

export function AIAnalysisResults({ type, data, onClose }: AIAnalysisResultsProps) {
  if (!data) return null;

  return (
    <div className="mt-8 border rounded-lg p-6 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">
          {type === 'summary' ? 'Holistic Summary' :
           type === 'flashcards' ? 'Study Flashcards' :
           'Knowledge Quiz'}
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <X size={20} />
        </button>
      </div>

      {type === 'summary' && (
        <div className="prose max-w-none">
          {data}
        </div>
      )}

      {type === 'flashcards' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((card: { question: string; answer: string }, index: number) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="font-medium mb-2">{card.question}</div>
              <div className="text-gray-600">{card.answer}</div>
            </div>
          ))}
        </div>
      )}

      {type === 'quiz' && (
        <div className="space-y-6">
          {data.map((question: {
            question: string;
            options: string[];
            correctAnswer: string;
          }, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="font-medium mb-3">{question.question}</div>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`p-2 rounded ${
                      option === question.correctAnswer
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-50'
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}