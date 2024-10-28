import React from 'react';
import { Check, X } from 'lucide-react';

interface FriendRequestNotificationProps {
  senderName: string;
  onAccept: () => void;
  onReject: () => void;
}

export default function FriendRequestNotification({ 
  senderName, 
  onAccept, 
  onReject 
}: FriendRequestNotificationProps) {
  return (
    <div className="fixed top-4 right-4 bg-[#2b2d31] rounded-lg shadow-lg p-4 w-80 z-50">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <p className="text-white font-medium">Friend Request</p>
          <p className="text-[#b5bac1] text-sm">{senderName} wants to add you as a friend</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAccept}
            className="p-1.5 bg-[#3ba55c] hover:bg-[#2d7d46] rounded-full text-white"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={onReject}
            className="p-1.5 bg-[#ed4245] hover:bg-[#c93b3e] rounded-full text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}