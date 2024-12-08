import { supabase } from './supabase';
import type { Note, Notebook, Folder } from '../types/Note';
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
  try {
    console.log('Getting content for:', {
      notes: selectedNotes.length,
      notebooks: selectedNotebooks.length,
      folders: selectedFolders.length
    });

    let content = '';
    const processedNoteIds = new Set<string>();
    const MAX_CONTENT_LENGTH = 4000;
    let isContentTruncated = false;
    const emptyNotebooks: string[] = [];
    const emptyFolders: string[] = [];

    // Add directly selected notes first
    if (selectedNotes.length > 0) {
      console.log('Adding directly selected notes');
      for (const note of selectedNotes) {
        if (!processedNoteIds.has(note.id)) {
          const noteContent = `Note: ${note.title}\n${note.content}\n\n`;
          if (content.length + noteContent.length <= MAX_CONTENT_LENGTH) {
            content += noteContent;
            processedNoteIds.add(note.id);
          } else {
            isContentTruncated = true;
            break;
          }
        }
      }
      console.log('Added', processedNoteIds.size, 'direct notes');
    }

    // Process notebooks in smaller batches
    if (selectedNotebooks.length > 0 && content.length < MAX_CONTENT_LENGTH) {
      console.log('Fetching notes from notebooks:', selectedNotebooks.map(n => n.id));
      const BATCH_SIZE = 2;
      
      for (let i = 0; i < selectedNotebooks.length && !isContentTruncated; i += BATCH_SIZE) {
        const batch = selectedNotebooks.slice(i, i + BATCH_SIZE);
        console.log(`Processing notebook batch ${i / BATCH_SIZE + 1}`);
        
        try {
          const { data: notebookNotes, error: notebookError } = await Promise.race([
            supabase
              .from('notes')
              .select('id, title, content, notebook_id')
              .in('notebook_id', batch.map((n: Notebook) => n.id))
              .eq('is_trashed', false)
              .eq('is_archived', false)
              .order('created_at', { ascending: false })
              .limit(10),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Query timeout')), 5000)
            )
          ]) as any;

          if (notebookError) {
            console.error('Error fetching notebook notes:', notebookError);
            continue;
          }

          // Check which notebooks in this batch have no notes
          batch.forEach((notebook: Notebook) => {
            const hasNotes = notebookNotes?.some((note: any) => note.notebook_id === notebook.id);
            if (!hasNotes) {
              emptyNotebooks.push(notebook.name);
            }
          });

          if (notebookNotes && notebookNotes.length > 0) {
            console.log(`Found ${notebookNotes.length} notes in batch`);
            for (const note of notebookNotes) {
              if (!processedNoteIds.has(note.id)) {
                const noteContent = `Note: ${note.title}\n${note.content}\n\n`;
                if (content.length + noteContent.length <= MAX_CONTENT_LENGTH) {
                  content += noteContent;
                  processedNoteIds.add(note.id);
                } else {
                  isContentTruncated = true;
                  break;
                }
              }
            }
          }
        } catch (error: unknown) {
          console.error(`Error processing notebook batch:`, error);
          if (error instanceof Error && error.message === 'Query timeout') {
            console.log('Query timed out, moving to next batch');
          }
          continue;
        }

        if (isContentTruncated) break;
      }
    }

    // Process folders if we still have room
    if (selectedFolders.length > 0 && content.length < MAX_CONTENT_LENGTH) {
      for (const folder of selectedFolders) {
        if (isContentTruncated) break;
        
        console.log(`Processing folder: ${folder.id}`);
        try {
          const { data: folderNotebooks, error: folderError } = await Promise.race([
            supabase
              .from('notebooks')
              .select('id, name')
              .eq('folder_id', folder.id),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Query timeout')), 5000)
            )
          ]) as any;

          if (folderError) {
            console.error(`Error fetching notebooks for folder ${folder.id}:`, folderError);
            continue;
          }

          if (!folderNotebooks || folderNotebooks.length === 0) {
            console.log(`No notebooks found in folder ${folder.id}`);
            emptyFolders.push(folder.name);
            continue;
          }

          let folderHasNotes = false;
          console.log(`Found ${folderNotebooks.length} notebooks in folder ${folder.id}`);

          // Process folder's notebooks in smaller batches
          const BATCH_SIZE = 2;
          for (let i = 0; i < folderNotebooks.length && !isContentTruncated; i += BATCH_SIZE) {
            const batch = folderNotebooks.slice(i, i + BATCH_SIZE);
            try {
              const { data: folderNotes, error: notesError } = await Promise.race([
                supabase
                  .from('notes')
                  .select('id, title, content, notebook_id')
                  .in('notebook_id', batch.map((n: { id: string }) => n.id))
                  .eq('is_trashed', false)
                  .eq('is_archived', false)
                  .order('created_at', { ascending: false })
                  .limit(10),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Query timeout')), 5000)
                )
              ]) as any;

              if (notesError) {
                console.error(`Error fetching notes for folder batch:`, notesError);
                continue;
              }

              // Check which notebooks in this batch have no notes
              batch.forEach((notebook: { id: string, name: string }) => {
                const hasNotes = folderNotes?.some((note: any) => note.notebook_id === notebook.id);
                if (!hasNotes) {
                  emptyNotebooks.push(notebook.name);
                }
              });

              if (folderNotes && folderNotes.length > 0) {
                folderHasNotes = true;
                console.log(`Found ${folderNotes.length} notes in folder batch`);
                for (const note of folderNotes) {
                  if (!processedNoteIds.has(note.id)) {
                    const noteContent = `Note: ${note.title}\n${note.content}\n\n`;
                    if (content.length + noteContent.length <= MAX_CONTENT_LENGTH) {
                      content += noteContent;
                      processedNoteIds.add(note.id);
                    } else {
                      isContentTruncated = true;
                      break;
                    }
                  }
                }
              }
            } catch (error: unknown) {
              console.error(`Error processing folder batch:`, error);
              if (error instanceof Error && error.message === 'Query timeout') {
                console.log('Query timed out, moving to next batch');
              }
              continue;
            }
          }

          if (!folderHasNotes) {
            emptyFolders.push(folder.name);
          }
        } catch (error: unknown) {
          console.error(`Error processing folder ${folder.id}:`, error);
          continue;
        }
      }
    }

    if (!content.trim()) {
      let errorMessage = 'No content available from the selected items.';
      if (emptyNotebooks.length > 0) {
        errorMessage += `\nEmpty notebooks: ${emptyNotebooks.join(', ')}`;
      }
      if (emptyFolders.length > 0) {
        errorMessage += `\nEmpty folders: ${emptyFolders.join(', ')}`;
      }
      throw new Error(errorMessage);
    }

    console.log(`Total content length: ${content.length}, Total unique notes: ${processedNoteIds.size}`);
    if (isContentTruncated) {
      console.log('Content was truncated to fit within limits');
    }
    if (emptyNotebooks.length > 0) {
      console.log('Empty notebooks:', emptyNotebooks.join(', '));
    }
    if (emptyFolders.length > 0) {
      console.log('Empty folders:', emptyFolders.join(', '));
    }
    return content;
  } catch (error: unknown) {
    console.error('Error in getAllContent:', error);
    throw error;
  }
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
  try {
    console.log('Starting flashcard generation...');
    const content = await getAllContent(selectedNotes, selectedNotebooks, selectedFolders);
    console.log('Content gathered, length:', content.length);

    if (!content.trim()) {
      throw new Error('No content available to generate flashcards');
    }

    console.log('Sending request to OpenAI...');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a flashcard generator. Create flashcards from the provided content.
          Your response must be a valid JSON object with this exact structure:
          {
            "flashcards": [
              {
                "question": "What is X?",
                "answer": "X is Y"
              }
            ]
          }
          Focus on key concepts and their relationships. Create clear, concise questions and answers.`
        },
        {
          role: 'user',
          content: `Generate 8 flashcards from this content. Remember to return only valid JSON:\n\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const responseContent = response.choices[0]?.message?.content;
    console.log('OpenAI response received');
    
    if (!responseContent) {
      throw new Error('No content in OpenAI response');
    }

    const parsedResponse = JSON.parse(responseContent);
    console.log('Response parsed successfully');
    
    if (!parsedResponse.flashcards || !Array.isArray(parsedResponse.flashcards)) {
      throw new Error('Invalid flashcards format in response');
    }

    const flashcards = parsedResponse.flashcards.map((card: { question: any; answer: any; }) => ({
      question: String(card.question || ''),
      answer: String(card.answer || '')
    }));

    if (flashcards.length === 0) {
      throw new Error('No flashcards were generated');
    }

    console.log(`Successfully generated ${flashcards.length} flashcards`);
    return flashcards;

  } catch (error) {
    console.error('Failed to generate flashcards:', error);
    throw error;
  }
}

export async function generateCombinedQuiz(
  selectedNotes: Note[],
  selectedNotebooks: Notebook[],
  selectedFolders: Folder[]
): Promise<Array<{ question: string; options: string[]; correctAnswer: string }>> {
  try {
    console.log('Starting quiz generation...');
    const content = await getAllContent(selectedNotes, selectedNotebooks, selectedFolders);
    console.log('Content gathered, length:', content.length);

    if (!content.trim()) {
      throw new Error('No content available to generate quiz');
    }

    console.log('Sending request to OpenAI...');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a quiz generator. Create multiple-choice questions from the provided content.
          Your response must be a valid JSON object with this exact structure:
          {
            "questions": [
              {
                "question": "What is X?",
                "options": ["A", "B", "C", "D"],
                "correctAnswer": "A"
              }
            ]
          }
          Focus on key concepts and their relationships. Create clear questions with distinct options.
          Ensure the correctAnswer is exactly one of the options provided.`
        },
        {
          role: 'user',
          content: `Generate 5 multiple-choice questions from this content. Remember to return only valid JSON:\n\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const responseContent = response.choices[0]?.message?.content;
    console.log('OpenAI response received');
    
    if (!responseContent) {
      throw new Error('No content in OpenAI response');
    }

    const parsedResponse = JSON.parse(responseContent);
    console.log('Response parsed successfully');
    
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid quiz format in response');
    }

    const questions = parsedResponse.questions.map((q: { question: any; options: any[]; correctAnswer: any; }) => ({
      question: String(q.question || ''),
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      correctAnswer: String(q.correctAnswer || '')
    }));

    if (questions.length === 0) {
      throw new Error('No questions were generated');
    }

    // Validate that correctAnswer exists in options for each question
    questions.forEach((q: { options: string | any[]; correctAnswer: any; }, index: number) => {
      if (!q.options.includes(q.correctAnswer)) {
        throw new Error(`Question ${index + 1} has a correctAnswer that is not in the options`);
      }
    });

    console.log(`Successfully generated ${questions.length} quiz questions`);
    return questions;

  } catch (error) {
    console.error('Failed to generate quiz:', error);
    throw error;
  }
}