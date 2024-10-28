import React, { useState } from 'react';
import { MessageSquare, Plus, Users } from 'lucide-react';
import { useMessages } from '../store/messages';
import { useServers, Server } from '../store/servers';
import CreateServerModal from './CreateServerModal';
import JoinServerModal from './JoinServerModal';

interface ServerSidebarProps {
  onToggleView: () => void;
  currentUserId: string;
  currentView: 'server' | 'dm' | 'friends';
  onShowFriends: () => void;
  onServerSelect?: (serverId: string) => void;
  selectedServerId?: string;
}

export default function ServerSidebar({ 
  onToggleView, 
  currentUserId, 
  currentView,
  onShowFriends,
  onServerSelect,
  selectedServerId
}: ServerSidebarProps) {
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  
  const { dmChannels, messages } = useMessages();
  const { servers, hasUnreadMessages } = useServers();

  const hasUnreadDMs = dmChannels.some(channel => {
    const lastMessage = messages
      .filter(msg => 
        channel.participants.includes(msg.senderId) && 
        channel.participants.includes(msg.receiverId)
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    return lastMessage && lastMessage.receiverId === currentUserId;
  });

  const userServers = servers.filter(server => server.members.includes(currentUserId));

  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/invite/')) {
      const code = path.split('/')[2];
      setInviteCode(code);
      setShowJoinServer(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleServerClick = (server: Server) => {
    if (currentView !== 'server' || selectedServerId !== server.id) {
      onServerSelect?.(server.id);
    }
  };

  return (
    <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 space-y-2">
      <button 
        onClick={onToggleView}
        className={`relative w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center
          ${currentView === 'dm' ? 'bg-[#5865f2]' : 'bg-[#313338] hover:bg-[#5865f2]'}`}
      >
        <MessageSquare className="w-7 h-7 text-white" />
        {hasUnreadDMs && currentView !== 'dm' && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#ed4245] rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </button>

      <div className="w-8 h-[2px] bg-[#35363c] rounded-lg my-1"></div>

      {userServers.map(server => (
        <button 
          key={server.id}
          onClick={() => handleServerClick(server)}
          className={`relative w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center
            ${selectedServerId === server.id ? 'bg-[#5865f2]' : 'bg-[#313338] hover:bg-[#5865f2]'}`}
        >
          <img 
            src={server.icon} 
            className="w-7 h-7 rounded-full" 
            alt={server.name} 
          />
          {hasUnreadMessages(server.id, currentUserId) && (
            <div className="absolute -left-1 w-2 h-2 bg-white rounded-full"></div>
          )}
        </button>
      ))}

      <div className="relative">
        <button 
          onClick={() => setShowCreateServer(true)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="w-12 h-12 bg-[#313338] rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center text-[#3ba55c] hover:bg-[#3ba55c] hover:text-white"
        >
          <Plus className="w-6 h-6" />
        </button>
        {showTooltip && (
          <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-sm px-2 py-1 rounded whitespace-nowrap z-50">
            Add a Server
          </div>
        )}
      </div>

      {showCreateServer && (
        <CreateServerModal
          isOpen={showCreateServer}
          onClose={() => setShowCreateServer(false)}
          currentUserId={currentUserId}
          onServerCreated={(serverId) => {
            onServerSelect?.(serverId);
            setShowCreateServer(false);
          }}
        />
      )}

      {showJoinServer && (
        <JoinServerModal
          isOpen={showJoinServer}
          onClose={() => setShowJoinServer(false)}
          inviteCode={inviteCode}
          currentUserId={currentUserId}
          onJoined={(serverId) => {
            onServerSelect?.(serverId);
            setShowJoinServer(false);
          }}
        />
      )}
    </div>
  );
}