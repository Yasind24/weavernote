import { supabase } from './supabase';
import type { Note, Notebook, Folder } from '../types';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

async function getAllContent(
  selectedNotes: Note[],
  selectedNotebooks: Notebook[],
  selectedFolders: Folder[]
): Promise<string> {
  let content = '';

  // Add directly selected notes
  content += selectedNotes.map(note => 
    `Note: ${note.title}\n${note.content}\n\n`
  ).join('');

  // Get notes from selected notebooks
  const notebookNotes = await supabase
    .from('notes')
    .select('*')
    .in('notebook_id', selectedNotebooks.map(n => n.id))
    .not('is_trashed', 'eq', true)
    .not('is_archived', 'eq', true);

  if (notebookNotes.data) {
    content += notebookNotes.data.map(note =>
      `Note: ${note.title}\n${note.content}\n\n`
    ).join('');
  }

  // Get notes from selected folders
  const folderNotebooks = await supabase
    .from('notebooks')
    .select('id')
    .in('folder_id', selectedFolders.map(f => f.id));

  if (folderNotebooks.data) {
    const folderNotes = await supabase
      .from('notes')
      .select('*')
      .in('notebook_id', folderNotebooks.data.map(n => n.id))
      .not('is_trashed', 'eq', true)
      .not('is_archived', 'eq', true);

    if (folderNotes.data) {
      content += folderNotes.data.map(note =>
        `Note: ${note.title}\n${note.content}\n\n`
      ).join('');
    }
  }

  return content;
}

export async function generateHolisticSummary(
  selectedNotes: Note[],
  selectedNotebooks: Notebook[],
  selectedFolders: Folder[]
): Promise<string> {
  const content = await getAllContent(selectedNotes, selectedNotebooks, selectedFolders);

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'Create a comprehensive summary that connects ideas and identifies key themes across multiple notes.'
      },
      {
        role: 'user',
        content: `Please analyze and summarize the following notes:\n\n${content}`
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });

  return response.choices[0]?.message?.content || 'Unable to generate summary';
}

export async function generateCombinedFlashcards(
  selectedNotes: Note[],
  selectedNotebooks: Notebook[],
  selectedFolders: Folder[]
): Promise<Array<{ question: string; answer: string }>> {
  const content = await getAllContent(selectedNotes, selectedNotebooks, selectedFolders);

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'Create flashcards that test understanding across multiple notes. Focus on connections between concepts.'
      },
      {
        role: 'user',
        content: `Create 10 flashcards from this content:\n\n${content}\n\nFormat as JSON array of objects with "question" and "answer" fields.`
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  const flashcardsText = response.choices[0]?.message?.content || '[]';
  return JSON.parse(flashcardsText);
}

export async function generateCombinedQuiz(
  selectedNotes: Note[],
  selectedNotebooks: Notebook[],
  selectedFolders: Folder[]
): Promise<Array<{
  question: string;
  options: string[];
  correctAnswer: string;
}>> {
  const content = await getAllContent(selectedNotes, selectedNotebooks, selectedFolders);

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'Create multiple choice questions that test understanding across multiple notes. Focus on relationships between concepts.'
      },
      {
        role: 'user',
        content: `Create 8 multiple choice questions from this content:\n\n${content}\n\nFormat as JSON array of objects with "question", "options" (array), and "correctAnswer" fields.`
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  const quizText = response.choices[0]?.message?.content || '[]';
  return JSON.parse(quizText);
}