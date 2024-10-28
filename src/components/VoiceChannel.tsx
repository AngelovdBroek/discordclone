import React from 'react';
import { Volume2 } from 'lucide-react';
import { useVoice } from '../store/voice';
import { useUsers } from '../store/users';

interface VoiceChannelProps {
  id: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
  currentUserId: string;
}

export default function VoiceChannel({ 
  id, 
  name, 
  isSelected,
  onClick,
  currentUserId
}: VoiceChannelProps) {
  const { getChannelParticipants, getUserVoiceState } = useVoice();
  const { getUser } = useUsers();
  
  const participants = getChannelParticipants(id);

  return (
    <div className="space-y-0.5">
      <button
        onClick={onClick}
        className={`w-full px-2 py-1 flex items-center rounded cursor-pointer group ${
          isSelected 
            ? 'bg-[#404249] text-white' 
            : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
        }`}
      >
        <Volume2 className={`w-5 h-5 mr-1.5 flex-shrink-0 ${
          isSelected ? 'text-white' : 'text-[#949ba4]'
        }`} />
        <span className="truncate">{name}</span>
        {participants.length > 0 && (
          <span className="ml-auto text-xs text-[#949ba4]">
            {participants.length}
          </span>
        )}
      </button>

      {participants.length > 0 && (
        <div className="pl-9 space-y-0.5">
          {participants.map(userId => {
            const user = getUser(userId);
            const voiceState = getUserVoiceState(userId);
            if (!user || !voiceState) return null;

            return (
              <div 
                key={userId}
                className="flex items-center gap-2 px-2 py-1 rounded group text-[#949ba4] text-sm"
              >
                <div className="relative">
                  <img
                    src={user.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                    alt={user.displayName}
                    className={`w-6 h-6 rounded-full ${
                      voiceState.speaking ? 'ring-2 ring-[#3ba55c]' : ''
                    }`}
                  />
                  {user.decoration && (
                    <div className={`absolute inset-[-2px] rounded-full ${user.decoration} z-20`} />
                  )}
                  {user.effect && (
                    <div className={`absolute inset-[-4px] rounded-full ${user.effect} z-0`} />
                  )}
                  <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-[#2b2d31] ${
                    voiceState.speaking ? 'bg-[#3ba55c]' : 'bg-[#747f8d]'
                  }`} />
                </div>
                <span className="truncate">
                  {user.displayName}
                </span>
                {voiceState.muted && (
                  <div className="w-3 h-3 bg-[#ed4245] rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full" />
                  </div>
                )}
                {voiceState.deafened && (
                  <div className="w-3 h-3 bg-[#ed4245] rounded-full flex items-center justify-center">
                    <div className="w-2 h-0.5 bg-white rounded-full transform rotate-45" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}