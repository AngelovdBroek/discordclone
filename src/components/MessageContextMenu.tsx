import React from 'react';
import { Pin, Copy, Reply, Edit2, Trash2 } from 'lucide-react';

interface MessageContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onPin: () => void;
  onCopy: () => void;
  onReply: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isPinned: boolean;
  isOwnMessage: boolean;
}

export default function MessageContextMenu({
  x,
  y,
  onClose,
  onPin,
  onCopy,
  onReply,
  onEdit,
  onDelete,
  isPinned,
  isOwnMessage
}: MessageContextMenuProps) {
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      onClose();
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  const style: React.CSSProperties = {
    position: 'fixed',
    left: x,
    top: y,
    zIndex: 1000
  };

  return (
    <div 
      className="bg-[#2b2d31] rounded-lg shadow-lg w-[220px] py-2 text-[#dbdee1]"
      style={style}
      onClick={e => e.stopPropagation()}
    >
      <button
        onClick={onReply}
        className="w-full px-2 py-2 hover:bg-[#404249] flex items-center gap-2"
      >
        <Reply className="w-4 h-4" />
        Reply
      </button>

      <button
        onClick={onPin}
        className="w-full px-2 py-2 hover:bg-[#404249] flex items-center gap-2"
      >
        <Pin className="w-4 h-4" />
        {isPinned ? 'Unpin Message' : 'Pin Message'}
      </button>

      <button
        onClick={onCopy}
        className="w-full px-2 py-2 hover:bg-[#404249] flex items-center gap-2"
      >
        <Copy className="w-4 h-4" />
        Copy Text
      </button>

      {isOwnMessage && (
        <>
          <div className="h-[1px] bg-[#1e1f22] my-1" />

          <button
            onClick={onEdit}
            className="w-full px-2 py-2 hover:bg-[#404249] flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Message
          </button>

          <button
            onClick={onDelete}
            className="w-full px-2 py-2 hover:bg-[#404249] flex items-center gap-2 text-[#ed4245]"
          >
            <Trash2 className="w-4 h-4" />
            Delete Message
          </button>
        </>
      )}
    </div>
  );
}