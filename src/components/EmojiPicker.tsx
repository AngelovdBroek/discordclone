import React, { useEffect, useRef } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiPickerProps {
  onSelect: (emoji: any) => void;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

export default function EmojiPicker({ onSelect, onClose, buttonRef }: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current !== event.target &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, buttonRef]);

  // Calculate position based on button position
  const getPickerStyle = () => {
    if (!buttonRef.current) return {};

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const pickerHeight = 435; // Approximate height of the picker

    // Position horizontally
    const left = Math.max(10, Math.min(
      buttonRect.left - 320 + buttonRect.width,
      window.innerWidth - 320 - 10
    ));

    // Position vertically
    let top;
    if (spaceBelow >= pickerHeight || spaceBelow > spaceAbove) {
      top = buttonRect.bottom + 10;
    } else {
      top = buttonRect.top - pickerHeight - 10;
    }

    return {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      zIndex: 1000
    };
  };

  return (
    <div ref={pickerRef} style={getPickerStyle()}>
      <Picker
        data={data}
        onEmojiSelect={(emoji: any) => {
          onSelect(emoji);
          onClose();
        }}
        theme="dark"
        previewPosition="none"
        skinTonePosition="none"
        searchPosition="top"
        navPosition="top"
        perLine={9}
      />
    </div>
  );
}