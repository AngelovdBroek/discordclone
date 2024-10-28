import React, { useState } from 'react';
import { X, Hash, Volume2 } from 'lucide-react';
import { useServers } from '../store/servers';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  categoryId?: string;
  initialType?: 'text' | 'voice';
}

export default function CreateChannelModal({
  isOpen,
  onClose,
  serverId,
  categoryId = 'default',
  initialType = 'text'
}: CreateChannelModalProps) {
  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState<'text' | 'voice'>(initialType);
  const { addChannel } = useServers();

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!channelName.trim()) return;

    addChannel(serverId, categoryId, channelName.trim(), channelType);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && channelName.trim()) {
      handleCreate();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#313338] w-[440px] rounded-md overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Create Channel</h2>
            <button
              onClick={onClose}
              className="text-[#b5bac1] hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-[#b5bac1] uppercase mb-2">
              CHANNEL TYPE
            </label>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setChannelType('text')}
                className={`flex-1 px-4 py-2 rounded flex items-center justify-center gap-2 ${
                  channelType === 'text'
                    ? 'bg-[#404249] text-white'
                    : 'bg-[#2b2d31] text-[#b5bac1] hover:bg-[#35373c] hover:text-white'
                }`}
              >
                <Hash className="w-4 h-4" />
                Text Channel
              </button>
              <button
                onClick={() => setChannelType('voice')}
                className={`flex-1 px-4 py-2 rounded flex items-center justify-center gap-2 ${
                  channelType === 'voice'
                    ? 'bg-[#404249] text-white'
                    : 'bg-[#2b2d31] text-[#b5bac1] hover:bg-[#35373c] hover:text-white'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                Voice Channel
              </button>
            </div>

            <label className="block text-xs font-semibold text-[#b5bac1] uppercase mb-2">
              CHANNEL NAME
            </label>
            <div className="relative">
              {channelType === 'text' ? (
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b5bac1]" />
              ) : (
                <Volume2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b5bac1]" />
              )}
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-3 py-2 bg-[#1e1f22] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                placeholder={channelType === 'text' ? 'new-text-channel' : 'new-voice-channel'}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white hover:underline"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!channelName.trim()}
              className="px-4 py-2 bg-[#5865f2] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4752c4]"
            >
              Create Channel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}