import React, { useState, useEffect } from 'react';
import { X, Brain, BookOpen, HelpCircle, Loader2 } from 'lucide-react';
import { ContentSelector } from './ContentSelector';
import { generateHolisticSummary, generateCombinedFlashcards, generateCombinedQuiz } from '../../lib/aiUtils';
import type { Note, Notebook, Folder } from '../../types/Note';

interface AIWeaverstudioProps {
  onClose: () => void;
}

interface ResultsDialogProps {
  type: 'summary' | 'flashcards' | 'quiz';
  data: any;
  onClose: () => void;
}

function ResultsDialog({ type, data, onClose }: ResultsDialogProps) {
  const [revealedAnswers, setRevealedAnswers] = useState<{ [key: number]: boolean }>({});
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [revealAll, setRevealAll] = useState(false);

  const toggleAnswer = (index: number, selectedOption?: string) => {
    if (type === 'quiz' && selectedOption && !revealedAnswers[index]) {
      setSelectedAnswers(prev => ({
        ...prev,
        [index]: selectedOption
      }));
    }
    setRevealedAnswers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleRevealAll = () => {
    setRevealAll(true);
    const allIndices = type === 'flashcards' 
      ? data.map((_: any, index: number) => index)
      : data.map((_: any, index: number) => index);
    
    setRevealedAnswers(
      allIndices.reduce((acc: any, index: number) => {
        acc[index] = true;
        return acc;
      }, {})
    );
  };

  const handleHideAll = () => {
    setRevealAll(false);
    setRevealedAnswers({});
    setSelectedAnswers({});
  };

  const getQuizOptionClass = (index: number, option: string, correctAnswer: string) => {
    if (!revealedAnswers[index]) {
      return 'bg-gray-50 hover:bg-gray-100';
    }
    
    if (option === correctAnswer) {
      return 'bg-green-100 text-green-800';
    }
    
    if (selectedAnswers[index] === option) {
      return 'bg-red-100 text-red-800';
    }
    
    return 'bg-gray-50';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 h-[90vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-white rounded-t-lg z-[101]">
          <h2 className="text-lg sm:text-xl font-semibold">
            {type === 'summary' ? 'Holistic Summary' :
             type === 'flashcards' ? 'Study Flashcards' :
             'Knowledge Quiz'}
          </h2>
          <div className="flex items-center gap-2">
            {(type === 'flashcards' || type === 'quiz') && (
              <button
                onClick={revealAll ? handleHideAll : handleRevealAll}
                className="px-2 sm:px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                {revealAll ? 'Hide All' : 'Reveal All'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {type === 'summary' && (
            <div className="prose max-w-none">
              {data}
            </div>
          )}

          {type === 'flashcards' && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {data.map((card: { question: string; answer: string }, index: number) => (
                <div 
                  key={index} 
                  className="border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => toggleAnswer(index)}
                >
                  <div className="p-3 sm:p-4 border-b bg-gray-50">
                    <div className="font-medium text-sm sm:text-base">{card.question}</div>
                  </div>
                  <div 
                    className={`p-3 sm:p-4 ${revealedAnswers[index] ? 'opacity-100' : 'opacity-0'} transition-opacity text-sm sm:text-base`}
                  >
                    {card.answer}
                  </div>
                  {!revealedAnswers[index] && (
                    <div className="p-3 sm:p-4 text-center text-xs sm:text-sm text-gray-500">
                      Click to reveal answer
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {type === 'quiz' && (
            <div className="space-y-4 sm:space-y-6">
              {data.map((question: {
                question: string;
                options: string[];
                correctAnswer: string;
              }, index: number) => (
                <div key={index} className="border rounded-lg">
                  <div className="p-3 sm:p-4 border-b bg-gray-50">
                    <div className="font-medium text-sm sm:text-base">{question.question}</div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-2 rounded cursor-pointer transition-colors text-sm sm:text-base ${
                            getQuizOptionClass(index, option, question.correctAnswer)
                          }`}
                          onClick={() => !revealedAnswers[index] && toggleAnswer(index, option)}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                    {revealedAnswers[index] && (
                      <div className="mt-3 text-center text-xs sm:text-sm">
                        {selectedAnswers[index] === question.correctAnswer ? (
                          <span className="text-green-600">Correct!</span>
                        ) : (
                          <span className="text-red-600">
                            Incorrect. The correct answer is shown in green.
                          </span>
                        )}
                      </div>
                    )}
                    {!revealedAnswers[index] && (
                      <div className="mt-3 text-center text-xs sm:text-sm text-gray-500">
                        Click any option to answer
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AIWeaverstudio({ onClose }: AIWeaverstudioProps) {
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [selectedNotebooks, setSelectedNotebooks] = useState<Notebook[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState<'summary' | 'flashcards' | 'quiz' | null>(null);
  const [results, setResults] = useState<{ type: 'summary' | 'flashcards' | 'quiz', data: any } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (type: 'summary' | 'flashcards' | 'quiz') => {
    if (selectedNotes.length === 0 && selectedNotebooks.length === 0 && selectedFolders.length === 0) {
      setError('Please select at least one note, notebook, or folder');
      return;
    }

    setLoading(type);
    setError(null);
    
    try {
      let result;
      switch (type) {
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
      setResults({ type, data: result });
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate ' + type);
    } finally {
      setLoading(null);
    }
  };

  // Clear error when selection changes
  useEffect(() => {
    setError(null);
  }, [selectedNotes, selectedNotebooks, selectedFolders]);

  return (
    <div className="fixed inset-0 bg-white z-[90] flex flex-col">
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleAnalyze('summary')}
              disabled={loading !== null}
              className="p-4 rounded-lg border flex items-center gap-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'summary' ? (
                <Loader2 className="animate-spin text-yellow-600" />
              ) : (
                <Brain className="text-yellow-600" />
              )}
              <div className="text-left">
                <div className="font-medium">Holistic Summary</div>
                <div className="text-sm text-gray-600">Generate a comprehensive summary</div>
              </div>
            </button>

            <button
              onClick={() => handleAnalyze('flashcards')}
              disabled={loading !== null}
              className="p-4 rounded-lg border flex items-center gap-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'flashcards' ? (
                <Loader2 className="animate-spin text-yellow-600" />
              ) : (
                <BookOpen className="text-yellow-600" />
              )}
              <div className="text-left">
                <div className="font-medium">Combined Flashcards</div>
                <div className="text-sm text-gray-600">Create study flashcards</div>
              </div>
            </button>

            <button
              onClick={() => handleAnalyze('quiz')}
              disabled={loading !== null}
              className="p-4 rounded-lg border flex items-center gap-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'quiz' ? (
                <Loader2 className="animate-spin text-yellow-600" />
              ) : (
                <HelpCircle className="text-yellow-600" />
              )}
              <div className="text-left">
                <div className="font-medium">Knowledge Quiz</div>
                <div className="text-sm text-gray-600">Generate practice questions</div>
              </div>
            </button>
          </div>

          {results && (
            <ResultsDialog
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