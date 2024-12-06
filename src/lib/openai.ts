import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function summarizeNote(content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes notes concisely while retaining key information.'
        },
        {
          role: 'user',
          content: `Please summarize the following note:\n\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0]?.message?.content || 'Unable to generate summary';
  } catch (error) {
    console.error('Error summarizing note:', error);
    throw new Error('Failed to generate summary');
  }
}

export async function createFlashcards(content: string): Promise<Array<{ question: string; answer: string }>> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Create flashcards from the given content. Return them in a format that can be parsed as JSON array of question-answer pairs.'
        },
        {
          role: 'user',
          content: `Create 5 flashcards from this content:\n\n${content}\n\nFormat as JSON array of objects with "question" and "answer" fields.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const flashcardsText = response.choices[0]?.message?.content || '[]';
    return JSON.parse(flashcardsText);
  } catch (error) {
    console.error('Error creating flashcards:', error);
    throw new Error('Failed to generate flashcards');
  }
}

export async function createQuiz(content: string): Promise<Array<{
  question: string;
  options: string[];
  correctAnswer: string;
}>> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Create multiple choice quiz questions from the given content. Return them in a format that can be parsed as JSON array.'
        },
        {
          role: 'user',
          content: `Create 5 multiple choice questions from this content:\n\n${content}\n\nFormat as JSON array of objects with "question", "options" (array), and "correctAnswer" fields.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const quizText = response.choices[0]?.message?.content || '[]';
    return JSON.parse(quizText);
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw new Error('Failed to generate quiz');
  }
}