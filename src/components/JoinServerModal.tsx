import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useServers } from '../store/servers';

interface JoinServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string;
  currentUserId: string;
  onJoined?: (serverId: string) => void;
}

export default function JoinServerModal({
  isOpen,
  onClose,
  inviteCode: initialInviteCode,
  currentUserId,
  onJoined
}: JoinServerModalProps) {
  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [error, setError] = useState('');
  const { joinServer, getInvite } = useServers();

  if (!isOpen) return null;

  const handleJoin = () => {
    setError('');
    
    // Extract code from full URL if pasted
    let code = inviteCode.trim();
    try {
      if (code.includes('/')) {
        const url = new URL(code);
        const pathParts = url.pathname.split('/');
        code = pathParts[pathParts.length - 1];
      }
    } catch {
      // Not a URL, use as is
    }

    const inviteInfo = getInvite(code);
    if (!inviteInfo) {
      setError('Invalid invite link. Please check the link and try again.');
      return;
    }

    const success = joinServer(code, currentUserId);
    if (success) {
      if (onJoined) {
        onJoined(inviteInfo.server.id);
      }
      onClose();
    } else {
      setError('Unable to join server. The invite may be expired or invalid.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#313338] w-[440px] rounded-md overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Join a Server</h2>
            <button
              onClick={onClose}
              className="text-[#b5bac1] hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-[#b5bac1] mb-4">
            Enter an invite link or code to join an existing server
          </p>

          <div className="mb-4">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite link or code"
              className="w-full px-3 py-2 bg-[#1e1f22] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
            />
            {error && (
              <p className="mt-2 text-[#ed4245] text-sm">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white hover:underline"
            >
              Cancel
            </button>
            <button
              onClick={handleJoin}
              disabled={!inviteCode.trim()}
              className="px-4 py-2 bg-[#5865f2] text-white rounded hover:bg-[#4752c4] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Server
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}