import React from 'react';
import { Hash, Volume2, FolderPlus } from 'lucide-react';

interface ChannelContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCreateTextChannel: () => void;
  onCreateVoiceChannel: () => void;
  onCreateCategory: () => void;
  isCategory?: boolean;
}

export default function ChannelContextMenu({
  x,
  y,
  onClose,
  onCreateTextChannel,
  onCreateVoiceChannel,
  onCreateCategory,
  isCategory = false
}: ChannelContextMenuProps) {
  React.useEffect(() => {
    const handleClickOutside = () => onClose();
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
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
      {!isCategory && (
        <>
          <button
            onClick={onCreateTextChannel}
            className="w-full px-2 py-2 hover:bg-[#404249] flex items-center gap-2"
          >
            <Hash className="w-4 h-4" />
            Create Text Channel
          </button>
          <button
            onClick={onCreateVoiceChannel}
            className="w-full px-2 py-2 hover:bg-[#404249] flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            Create Voice Channel
          </button>
          <div className="h-[1px] bg-[#1e1f22] my-1" />
        </>
      )}
      <button
        onClick={onCreateCategory}
        className="w-full px-2 py-2 hover:bg-[#404249] flex items-center gap-2"
      >
        <FolderPlus className="w-4 h-4" />
        Create Category
      </button>
    </div>
  );
}