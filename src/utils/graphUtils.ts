import { Node, Edge } from 'reactflow';
import type { Note } from '../types';

export type LayoutType = 'circular' | 'horizontal' | 'vertical' | 'grid';

export const createEdgeId = (
  sourceId: string, 
  targetId: string, 
  sourceHandle: string, 
  targetHandle: string
) => {
  return `edge-${sourceId}-${targetId}-${sourceHandle}-${targetHandle}`;
};

export const getNodePosition = (
  index: number,
  total: number,
  layout: LayoutType,
  note: Note,
  windowWidth: number,
  windowHeight: number
) => {
  // Only use saved positions if they exist and match the current layout
  if (note.position_x !== null && 
      note.position_y !== null && 
      note.layout_type === layout) {
    return { x: note.position_x, y: note.position_y };
  }

  const spacing = {
    x: windowWidth / 4,
    y: windowHeight / 4,
  };

  switch (layout) {
    case 'grid': {
      const cols = Math.ceil(Math.sqrt(total));
      const col = index % cols;
      const row = Math.floor(index / cols);
      return {
        x: col * spacing.x,
        y: row * spacing.y
      };
    }
    case 'horizontal':
      return {
        x: index * spacing.x,
        y: spacing.y + Math.sin(index) * (spacing.y / 2)
      };
    case 'vertical':
      return {
        x: spacing.x + Math.sin(index) * (spacing.x / 2),
        y: index * spacing.y
      };
    case 'circular':
    default: {
      const radius = Math.min(Math.min(windowWidth, windowHeight) / 3, 400);
      const angle = (index * 2 * Math.PI) / total;
      return {
        x: Math.cos(angle) * radius + radius + spacing.x,
        y: Math.sin(angle) * radius + radius + spacing.y
      };
    }
  }
};

export const createNodes = (notes: Note[], layout: LayoutType): Node[] => {
  return notes.map((note, index) => {
    const position = getNodePosition(
      index,
      notes.length,
      layout,
      note,
      window.innerWidth,
      window.innerHeight
    );
    return {
      id: note.id,
      data: { 
        label: note.title,
        note: note 
      },
      position,
      type: 'noteNode',
    };
  });
};

export const createEdges = (notes: Note[]): Edge[] => {
  const edges: Edge[] = [];
  const processedConnections = new Set<string>();

  notes.forEach(note => {
    const references = extractNoteReferences(note.content);
    references.forEach(refId => {
      if (notes.some(n => n.id === refId)) {
        // Use consistent handles for source and target
        const edgeId = createEdgeId(note.id, refId, 'source-bottom', 'target-top');
        
        if (!processedConnections.has(edgeId)) {
          processedConnections.add(edgeId);
          edges.push({
            id: edgeId,
            source: note.id,
            target: refId,
            sourceHandle: 'source-bottom',
            targetHandle: 'target-top',
            style: { 
              stroke: '#eab308', 
              strokeWidth: 2,
            },
            className: 'hover:cursor-pointer',
          });
        }
      }
    });
  });
  return edges;
};

export const extractNoteReferences = (content: string): string[] => {
  const references: string[] = [];
  const regex = /\[\[note:([a-f0-9-]+)\|([^\]]+)\]\]/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    references.push(match[1]);
  }

  return references;
};