import React, { useState } from 'react';
import { Brain, BookOpen, HelpCircle, Loader2 } from 'lucide-react';
import { summarizeNote, createFlashcards, createQuiz } from '../lib/openai';
import type { Note } from '../types/Note';

interface NoteEnhancerProps {
  note: Note;
}

export function NoteEnhancer({ note }: NoteEnhancerProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Array<{ question: string; answer: string }> | null>(null);
  const [quiz, setQuiz] = useState<Array<{
    question: string;
    options: string[];
    correctAnswer: string;
  }> | null>(null);
  const [loading, setLoading] = useState<'summary' | 'flashcards' | 'quiz' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    setLoading('summary');
    setError(null);
    try {
      const result = await summarizeNote(note.content);
      setSummary(result);
    } catch (err) {
      setError('Failed to generate summary');
    } finally {
      setLoading(null);
    }
  };

  const handleCreateFlashcards = async () => {
    setLoading('flashcards');
    setError(null);
    try {
      const result = await createFlashcards(note.content);
      setFlashcards(result);
    } catch (err) {
      setError('Failed to generate flashcards');
    } finally {
      setLoading(null);
    }
  };

  const handleCreateQuiz = async () => {
    setLoading('quiz');
    setError(null);
    try {
      const result = await createQuiz(note.content);
      setQuiz(result);
    } catch (err) {
      setError('Failed to generate quiz');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="border-t">
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={handleSummarize}
            disabled={loading === 'summary'}
            className="flex items-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
          >
            {loading === 'summary' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Brain size={16} />
            )}
            <span>Summarize</span>
          </button>
          <button
            onClick={handleCreateFlashcards}
            disabled={loading === 'flashcards'}
            className="flex items-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
          >
            {loading === 'flashcards' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <BookOpen size={16} />
            )}
            <span>Flashcards</span>
          </button>
          <button
            onClick={handleCreateQuiz}
            disabled={loading === 'quiz'}
            className="flex items-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
          >
            {loading === 'quiz' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <HelpCircle size={16} />
            )}
            <span>Quiz</span>
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {summary && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Summary</h3>
            <p className="text-sm text-gray-700">{summary}</p>
          </div>
        )}

        {flashcards && (
          <div className="space-y-4">
            <h3 className="font-medium">Flashcards</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {flashcards.map((card, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow border">
                  <div className="font-medium mb-2">{card.question}</div>
                  <div className="text-sm text-gray-700">{card.answer}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {quiz && (
          <div className="space-y-4">
            <h3 className="font-medium">Quiz</h3>
            <div className="space-y-6">
              {quiz.map((question, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow border">
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
          </div>
        )}
      </div>
    </div>
  );
}