import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  useReactFlow,
  NodeDragHandler,
  ConnectionMode,
  Node,
  Edge,
  EdgeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GraphControls } from './graph/GraphControls';
import NoteNode from './NoteNode';
import useNoteStore from '../store/noteStore';
import { 
  createNodes, 
  createEdges,
  createEdgeId,
  LayoutType,
} from '../utils/graphUtils';
import { insertNoteReference, removeNoteReference } from '../utils/noteUtils';
import type { Note } from '../types/Note';

const nodeTypes = {
  noteNode: NoteNode,
};

interface NoteGraphProps {
  notes: Note[];
  onNoteSelect: (noteId: string) => void;
}

export function NoteGraph({ notes, onNoteSelect }: NoteGraphProps) {
  const { fitView } = useReactFlow();
  const { updateNote } = useNoteStore();
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [selectedEdge, setSelectedEdge] = React.useState<Edge | null>(null);
  const [currentLayout, setCurrentLayout] = React.useState<LayoutType>(() => {
    // Get layout from the first note that has a layout_type set
    const noteWithLayout = notes.find(n => n.layout_type);
    return (noteWithLayout?.layout_type as LayoutType) || 'circular';
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(createNodes(notes, currentLayout));
  const [edges, setEdges, onEdgesChange] = useEdgesState(createEdges(notes));

  useEffect(() => {
    setNodes(createNodes(notes, currentLayout));
    setEdges(createEdges(notes));
    requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 200 });
    });
  }, [notes, currentLayout, setNodes, setEdges, fitView]);

  const onConnect = useCallback(
    async (params: Connection) => {
      if (!params.source || !params.target) return;

      const sourceNote = notes.find(n => n.id === params.source);
      const targetNote = notes.find(n => n.id === params.target);
      
      if (!sourceNote || !targetNote) return;

      try {
        const updatedContent = insertNoteReference(sourceNote.content, targetNote.id, targetNote.title);
        await updateNote(sourceNote.id, { content: updatedContent });

        const edgeId = createEdgeId(params.source, params.target, params.sourceHandle || '', params.targetHandle || '');
        
        if (!edges.some(edge => edge.id === edgeId)) {
          const newEdge = {
            id: edgeId,
            source: params.source,
            target: params.target,
            sourceHandle: params.sourceHandle,
            targetHandle: params.targetHandle,
            style: { stroke: '#eab308', strokeWidth: 2 },
            className: 'hover:cursor-pointer',
          };

          setEdges(eds => addEdge(newEdge, eds));
        }
      } catch (error) {
        console.error('Error updating note connection:', error);
      }
    },
    [notes, updateNote, setEdges, edges]
  );

  const onNodeDragStop: NodeDragHandler = useCallback(
    async (event, node) => {
      try {
        await updateNote(node.id, {
          position_x: node.position.x,
          position_y: node.position.y,
          layout_type: currentLayout,
        });
      } catch (error) {
        console.error('Error saving node position:', error);
      }
    },
    [updateNote, currentLayout]
  );

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    onNoteSelect(node.id);
  };

  const handleEdgeClick: EdgeMouseHandler = (event, edge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
  };

  const handleRemoveEdge = async () => {
    if (!selectedEdge) return;

    try {
      const sourceNote = notes.find(n => n.id === selectedEdge.source);
      if (!sourceNote) return;

      const updatedContent = removeNoteReference(sourceNote.content, selectedEdge.target);
      await updateNote(sourceNote.id, { content: updatedContent });

      setEdges(edges => edges.filter(e => e.id !== selectedEdge.id));
      setSelectedEdge(null);
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  const applyLayout = async (layout: LayoutType) => {
    setCurrentLayout(layout);
    
    // Update all notes with the new layout type
    for (const note of notes) {
      await updateNote(note.id, {
        layout_type: layout,
        position_x: null,
        position_y: null,
      });
    }

    // Create new nodes with the new layout
    setNodes(createNodes(notes, layout));
    
    // Fit view after layout change
    requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 200 });
    });
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="w-full h-full bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        connectionMode={ConnectionMode.Loose}
        snapToGrid={true}
        snapGrid={[15, 15]}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          gap={12}
          size={1}
          color="#e5e7eb"
          style={{ backgroundColor: '#f9fafb' }}
        />
        <GraphControls
          selectedEdge={selectedEdge}
          currentLayout={currentLayout}
          isFullscreen={isFullscreen}
          onRemoveEdge={handleRemoveEdge}
          onLayoutChange={applyLayout}
          onToggleFullscreen={toggleFullscreen}
        />
        <Controls 
          position="bottom-right"
          style={{ 
            display: 'flex',
            flexDirection: 'row',
            gap: '0.5rem',
            padding: '0.5rem',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        />
      </ReactFlow>
    </div>
  );
}