import React, { useRef, useEffect } from 'react';
import { X, Pin } from 'lucide-react';
import { useMessages } from '../store/messages';
import { useUsers } from '../store/users';

interface PinnedMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
  serverId?: string;
  onMessageClick: (messageId: string) => void;
  isDM?: boolean;
}

const PinnedMessagesModal: React.FC<PinnedMessagesModalProps> = ({
  isOpen,
  onClose,
  channelId,
  serverId,
  onMessageClick,
  isDM = false
}) => {
  const { getPinnedMessages } = useMessages();
  const { getUser } = useUsers();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pinnedMessages = getPinnedMessages(channelId, serverId, isDM);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString([], {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMessageClick = (messageId: string) => {
    onMessageClick(messageId);
    onClose();
  };

  return (
    <div 
      ref={modalRef}
      className="fixed top-0 right-0 w-[340px] bg-[#2b2d31] h-screen z-50"
    >
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#1e1f22]">
        <div className="flex items-center gap-2">
          <Pin className="w-5 h-5 text-[#b5bac1]" />
          <div>
            <h2 className="text-white font-semibold">Pinned Messages</h2>
            <p className="text-[#b5bac1] text-sm">
              {pinnedMessages.length} {pinnedMessages.length === 1 ? 'message' : 'messages'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#404249] rounded text-[#b5bac1] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-48px)]">
        <div className="p-2">
          {pinnedMessages.length === 0 ? (
            <div className="text-center py-8 text-[#949ba4]">
              No pinned messages
            </div>
          ) : (
            pinnedMessages.map(message => {
              const sender = getUser(message.senderId);
              if (!sender) return null;

              return (
                <div 
                  key={message.id} 
                  className="hover:bg-[#35373c] rounded cursor-pointer"
                  onClick={() => handleMessageClick(message.id)}
                >
                  <div className="px-2 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={sender.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                        alt={sender.displayName}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-white text-sm font-medium">
                        {sender.displayName}
                      </span>
                      <span className="text-[#949ba4] text-xs">
                        {formatTime(new Date(message.timestamp))}
                      </span>
                    </div>
                    <p className="text-[#dbdee1] text-sm pl-8">
                      {message.content}
                    </p>
                    {message.image && (
                      <div className="pl-8 mt-1">
                        <img
                          src={message.image}
                          alt="Message attachment"
                          className="max-h-[200px] rounded object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PinnedMessagesModal;