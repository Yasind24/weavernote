import React, { useRef, useEffect } from 'react';
import { ColorPicker } from './ColorPicker';
import { LabelManager } from './LabelManager';

interface EditorDialogsProps {
  dialogs: {
    colorPicker: boolean;
    labelManager: boolean;
  };
  noteId?: string;
  title: string;
  content: string;
  color: string;
  labels: string[];
  onColorChange: (color: string) => void;
  onLabelsUpdate: (labels: string[]) => void;
  onCloseDialog: (dialog: "colorPicker" | "labelManager") => void;
  colorButtonRef: React.RefObject<HTMLButtonElement>;
  labelsButtonRef: React.RefObject<HTMLButtonElement>;
}

export function EditorDialogs({
  dialogs,
  noteId,
  title,
  content,
  color,
  labels,
  onColorChange,
  onLabelsUpdate,
  onCloseDialog,
  colorButtonRef,
  labelsButtonRef,
}: EditorDialogsProps) {
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const labelManagerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dialogs.colorPicker && 
          colorPickerRef.current && 
          !colorPickerRef.current.contains(event.target as Node)) {
        onCloseDialog('colorPicker');
      }
      
      if (dialogs.labelManager && 
          labelManagerRef.current && 
          !labelManagerRef.current.contains(event.target as Node)) {
        onCloseDialog('labelManager');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dialogs, onCloseDialog]);

  const getPosition = (buttonRef: React.RefObject<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      return {
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
      };
    }
    return null;
  };

  return (
    <>
      {dialogs.colorPicker && (
        <div 
          ref={colorPickerRef}
          style={{
            position: 'fixed',
            ...(getPosition(colorButtonRef) || {
              top: '64px',
              left: '80px'
            })
          }}
          className="z-50"
        >
          <ColorPicker
            color={color}
            onChange={onColorChange}
            onClose={() => onCloseDialog('colorPicker')}
          />
        </div>
      )}

      {dialogs.labelManager && (
        <div 
          ref={labelManagerRef}
          style={{
            position: 'fixed',
            ...(getPosition(labelsButtonRef) || {
              top: '64px',
              left: '200px'
            })
          }}
          className="z-50"
        >
          <LabelManager
            noteId={noteId}
            title={title}
            content={content}
            labels={labels}
            onLabelsUpdate={onLabelsUpdate}
            onClose={() => onCloseDialog('labelManager')}
          />
        </div>
      )}
    </>
  );
}