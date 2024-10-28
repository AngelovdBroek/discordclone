import React from 'react';

interface DeleteMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: {
    content: string;
    author: string;
    timestamp: Date;
  };
}

export default function DeleteMessageModal({
  isOpen,
  onClose,
  onConfirm,
  message
}: DeleteMessageModalProps) {
  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      onConfirm();
    } else {
      onConfirm(); // Regular click should also delete
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="bg-[#313338] w-[440px] rounded-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4">
          <h2 className="text-white text-xl font-semibold mb-2">Delete Message</h2>
          <p className="text-[#b5bac1]">Are you sure you want to delete this message?</p>

          <div className="mt-4 bg-[#2b2d31] rounded-lg p-3">
            <div className="flex items-start gap-3">
              <img 
                src={message.author.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                alt={message.author}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{message.author}</span>
                  <span className="text-[#949ba4] text-sm">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <p className="text-[#dbdee1] mt-1">{message.content}</p>
              </div>
            </div>
          </div>

          <div className="text-[#949ba4] text-sm mt-4">
            <span className="text-[#00a8fc]">PROTIP:</span> You can hold down shift when clicking delete message to bypass this confirmation entirely.
          </div>
        </div>

        <div className="bg-[#2b2d31] p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-[#ed4245] text-white rounded hover:bg-[#c93b3e]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}