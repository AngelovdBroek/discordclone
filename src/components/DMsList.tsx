import React from 'react';
import { useMessages } from '../store/messages';
import { formatShortDate } from '../utils/dateFormatter';
import { Settings, Users } from 'lucide-react';
import { User, useUsers } from '../store/users';

interface DMsListProps {
  currentUser: User;
  allUsers: User[];
  onSelectDM: (channelId: string, otherUser: User) => void;
  onOpenSettings: () => void;
  onShowFriends: () => void;
  showFriends?: boolean;
}

export default function DMsList({ 
  currentUser, 
  allUsers, 
  onSelectDM, 
  onOpenSettings,
  onShowFriends,
  showFriends = false
}: DMsListProps) {
  const { dmChannels } = useMessages();
  const { getFriendRequests } = useUsers();

  const userDMs = dmChannels.filter(channel => 
    channel.participants.includes(currentUser.id)
  );

  const pendingRequests = getFriendRequests(currentUser.id);
  const hasPendingRequests = pendingRequests.some(req => 
    req.receiverId === currentUser.id && req.status === 'pending'
  );

  const handleDMClick = (channelId: string, otherUser: User) => {
    onSelectDM(channelId, otherUser);
  };

  return (
    <div className="w-60 bg-[#2b2d31] flex flex-col">
      <button
        onClick={onShowFriends}
        className={`w-full px-2 py-2 ${
          showFriends ? 'bg-[#35373c] text-white' : 'text-[#dcddde] hover:bg-[#35373c]'
        } flex items-center gap-2`}
      >
        <Users className="w-5 h-5" />
        <span>Friends</span>
        {hasPendingRequests && (
          <div className="ml-auto bg-[#ed4245] text-white text-xs px-1.5 rounded-full">
            {pendingRequests.filter(req => req.receiverId === currentUser.id && req.status === 'pending').length}
          </div>
        )}
      </button>

      <div className="p-4 flex-1">
        <h2 className="text-[#b5bac1] text-xs font-semibold mb-4 uppercase">
          Direct Messages
        </h2>
        <div className="space-y-1">
          {userDMs.map((channel) => {
            const otherUserId = channel.participants.find(id => id !== currentUser.id)!;
            const otherUser = allUsers.find(u => u.id === otherUserId);
            const lastMessage = channel.lastMessage;

            if (!otherUser) return null;

            return (
              <button
                key={channel.id}
                onClick={() => handleDMClick(channel.id, otherUser)}
                className="w-full flex items-center gap-3 p-2 rounded hover:bg-[#35373c] group text-left"
              >
                <div className="relative">
                  <img
                    src={otherUser.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                    alt={otherUser.displayName}
                    className="w-8 h-8 rounded-full relative z-10"
                  />
                  {otherUser.decoration && (
                    <div className={`absolute inset-[-2px] rounded-full ${otherUser.decoration} z-20`} />
                  )}
                  {otherUser.effect && (
                    <div className={`absolute inset-[-4px] rounded-full ${otherUser.effect} z-0`} />
                  )}
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#2b2d31] z-30
                    ${otherUser.status === 'online' ? 'bg-green-500' : 
                      otherUser.status === 'idle' ? 'bg-yellow-500' :
                      otherUser.status === 'dnd' ? 'bg-red-500' : 'bg-gray-500'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#f3f4f5] text-sm font-medium group-hover:text-white truncate">
                    {otherUser.displayName}
                  </p>
                  {lastMessage && (
                    <p className="text-[#b5bac1] text-xs truncate">
                      {lastMessage.senderId === currentUser.id ? 'You: ' : ''}{lastMessage.content}
                    </p>
                  )}
                </div>
                {lastMessage && (
                  <span className="text-[#b5bac1] text-xs whitespace-nowrap">
                    {formatShortDate(new Date(lastMessage.timestamp))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-[52px] bg-[#232428] px-2 flex items-center">
        <div className="relative">
          <img 
            src={currentUser.avatar} 
            className="w-8 h-8 rounded-full relative z-10" 
            alt={currentUser.displayName} 
          />
          {currentUser.decoration && (
            <div className={`absolute inset-[-2px] rounded-full ${currentUser.decoration} z-20`} />
          )}
          {currentUser.effect && (
            <div className={`absolute inset-[-4px] rounded-full ${currentUser.effect} z-0`} />
          )}
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#232428] z-30"></div>
        </div>
        <div className="ml-2 flex-1">
          <div className="text-sm font-medium text-white">{currentUser.displayName}</div>
          <div className="text-xs text-[#949ba4]">{currentUser.username}#{currentUser.discriminator}</div>
        </div>
        <button 
          onClick={onOpenSettings}
          className="p-1 hover:bg-[#404249] rounded"
        >
          <Settings className="w-5 h-5 text-[#b5bac1]" />
        </button>
      </div>
    </div>
  );
}