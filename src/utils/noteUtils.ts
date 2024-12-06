export function extractNoteReferences(content: string): string[] {
  const references: string[] = [];
  const regex = /\[\[note:([a-f0-9-]+)\|([^\]]+)\]\]/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    references.push(match[1]);
  }

  return references;
}

export function insertNoteReference(content: string, noteId: string, title: string): string {
  const reference = formatNoteReference(noteId, title);
  return content ? `${content}\n${reference}` : reference;
}

export function formatNoteReference(noteId: string, title: string): string {
  return `[[note:${noteId}|${title}]]`;
}

export function parseNoteReference(reference: string): { id: string; title: string } | null {
  const match = reference.match(/\[\[note:([a-f0-9-]+)\|([^\]]+)\]\]/);
  if (!match) return null;
  return {
    id: match[1],
    title: match[2]
  };
}

export function formatNoteContent(content: string): string {
  // Replace first occurrence with header
  let formattedContent = content.replace(/\[\[note:[a-f0-9-]+\|([^\]]+)\]\]/, 'Connected Notes | $1');
  
  // Replace any subsequent references
  formattedContent = formattedContent.replace(/\[\[note:[a-f0-9-]+\|([^\]]+)\]\]/g, '• $1');
  
  return formattedContent;
}

export function removeNoteReference(content: string, referenceId: string): string {
  const regex = new RegExp(`\\[\\[note:${referenceId}\\|[^\\]]+\\]\\]\\n?`, 'g');
  return content.replace(regex, '').trim();
}