import React from 'react';
import { X } from 'lucide-react';
import { Message } from '../store/messages';
import { useUsers } from '../store/users';

interface SearchResultsProps {
  results: Message[];
  onClose: () => void;
  onMessageClick: (messageId: string) => void;
  channelId: string;
  channelName?: string;
}

export default function SearchResults({ 
  results, 
  onClose, 
  onMessageClick,
  channelId,
  channelName = 'general'
}: SearchResultsProps) {
  const { getUser } = useUsers();

  const handleMessageClick = (messageId: string) => {
    onMessageClick(messageId);
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-[440px] bg-[#2b2d31] rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between p-4 border-b border-[#1e1f22]">
        <div>
          <h3 className="text-white font-semibold">
            {results.length} Results
          </h3>
          <p className="text-[#949ba4] text-sm">
            in {channelName}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-[#949ba4] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {results.length === 0 ? (
          <div className="p-4 text-center text-[#949ba4]">
            No results found
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {results.map((message) => {
              const sender = getUser(message.senderId);
              if (!sender) return null;

              return (
                <div
                  key={message.id}
                  className="p-2 hover:bg-[#35373c] rounded cursor-pointer"
                  onClick={() => handleMessageClick(message.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={sender.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                      alt={sender.displayName}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-white font-medium">
                      {sender.displayName}
                    </span>
                    <span className="text-[#949ba4] text-xs">
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[#dcddde] pl-8">
                    {message.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}