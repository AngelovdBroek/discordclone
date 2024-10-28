import React, { useState } from 'react';
import { Hash, Settings, Plus, ChevronDown, ChevronRight, X, Volume2 } from 'lucide-react';
import { useServers, Server } from '../store/servers';
import { useVoice } from '../store/voice';
import CreateChannelModal from './CreateChannelModal';
import ServerInviteModal from './ServerInviteModal';
import ServerSettingsModal from './ServerSettingsModal';
import VoiceChannel from './VoiceChannel';
import VoiceControls from './VoiceControls';
import ChannelContextMenu from './ChannelContextMenu';

interface ChannelSidebarProps {
  user: {
    id: string;
    displayName: string;
    username: string;
    discriminator: string;
    email: string;
    avatar?: string;
    effect?: string | null;
    decoration?: string | null;
  };
  onOpenSettings: () => void;
  selectedChannel: string;
  onChannelSelect: (channelId: string) => void;
  serverId: string | null;
  server: Server | null;
}

export default function ChannelSidebar({ 
  user, 
  onOpenSettings, 
  selectedChannel,
  onChannelSelect,
  serverId,
  server
}: ChannelSidebarProps) {
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    categoryId?: string;
    isCategory?: boolean;
  } | null>(null);
  const [channelType, setChannelType] = useState<'text' | 'voice'>('text');

  const { addCategory, toggleCategoryCollapse } = useServers();
  const { currentChannelId, joinChannel, leaveChannel } = useVoice();

  const isServerOwner = server?.ownerId === user.id;

  const handleContextMenu = (e: React.MouseEvent, categoryId?: string, isCategory = false) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      categoryId,
      isCategory
    });
  };

  const handleCreateChannel = () => {
    setChannelType('text');
    setSelectedCategoryId(contextMenu?.categoryId);
    setShowCreateChannel(true);
    setContextMenu(null);
  };

  const handleCreateVoiceChannel = () => {
    setChannelType('voice');
    setSelectedCategoryId(contextMenu?.categoryId);
    setShowCreateChannel(true);
    setContextMenu(null);
  };

  const handleCreateCategory = () => {
    setShowCreateCategory(true);
    setContextMenu(null);
  };

  const handleVoiceChannelClick = async (channelId: string) => {
    try {
      if (currentChannelId === channelId) {
        await leaveChannel(user.id);
      } else {
        if (currentChannelId) {
          await leaveChannel(user.id);
        }
        await joinChannel(channelId, user.id);
      }
    } catch (error) {
      console.error('Failed to handle voice channel action:', error);
    }
  };

  if (!server) return null;

  return (
    <div className="w-60 bg-[#2b2d31] flex flex-col">
      <button
        onClick={() => setShowServerMenu(!showServerMenu)}
        className="h-12 px-4 flex items-center justify-between border-b border-[#1e1f22] hover:bg-[#35373c] transition-colors"
      >
        <span className="font-semibold text-white truncate">{server.name}</span>
        <ChevronDown className="w-4 h-4 text-[#b5bac1]" />
      </button>

      <div className="flex-1 overflow-y-auto">
        {server.categories.map(category => (
          <div key={category.id}>
            <div
              className="flex items-center px-2 h-8 hover:bg-[#35373c] cursor-pointer group"
              onClick={() => toggleCategoryCollapse(server.id, category.id, user.id)}
              onContextMenu={(e) => handleContextMenu(e, category.id, true)}
            >
              {category.collapsed?.[user.id] ? (
                <ChevronRight className="w-3 h-3 text-[#b5bac1]" />
              ) : (
                <ChevronDown className="w-3 h-3 text-[#b5bac1]" />
              )}
              <span className="text-xs font-semibold uppercase text-[#949ba4] ml-1">
                {category.name}
              </span>
              {isServerOwner && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e, category.id);
                  }}
                  className="ml-auto opacity-0 group-hover:opacity-100"
                >
                  <Plus className="w-4 h-4 text-[#949ba4] hover:text-white" />
                </button>
              )}
            </div>

            {!category.collapsed?.[user.id] && (
              <div className="ml-2">
                {category.channels.map(channel => (
                  <div key={channel.id} onContextMenu={(e) => handleContextMenu(e, category.id)}>
                    {channel.type === 'text' ? (
                      <button
                        onClick={() => onChannelSelect(channel.id)}
                        className={`w-full px-2 py-1 flex items-center rounded text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1] ${
                          selectedChannel === channel.id ? 'bg-[#404249] text-white' : ''
                        }`}
                      >
                        <Hash className="w-5 h-5 mr-1.5 flex-shrink-0" />
                        <span className="truncate">{channel.name}</span>
                      </button>
                    ) : (
                      <VoiceChannel
                        id={channel.id}
                        name={channel.name}
                        isSelected={currentChannelId === channel.id}
                        onClick={() => handleVoiceChannelClick(channel.id)}
                        currentUserId={user.id}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {currentChannelId ? (
        <VoiceControls 
          userId={user.id}
          onLeave={() => leaveChannel(user.id)}
          onOpenSettings={onOpenSettings}
        />
      ) : (
        <div className="mt-auto h-[52px] bg-[#232428] px-2 flex items-center">
          <div className="relative">
            <img 
              src={user.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} 
              className="w-8 h-8 rounded-full relative z-10" 
              alt={user.displayName} 
            />
            {user.decoration && (
              <div className={`absolute inset-[-2px] rounded-full ${user.decoration} z-20`} />
            )}
            {user.effect && (
              <div className={`absolute inset-[-4px] rounded-full ${user.effect} z-0`} />
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#232428] z-30"></div>
          </div>
          <div className="ml-2 flex-1">
            <div className="text-sm font-medium text-white">{user.displayName}</div>
            <div className="text-xs text-[#949ba4]">{user.username}#{user.discriminator}</div>
          </div>
          <button 
            onClick={onOpenSettings}
            className="p-1 hover:bg-[#404249] rounded"
          >
            <Settings className="w-5 h-5 text-[#b5bac1]" />
          </button>
        </div>
      )}

      {showCreateChannel && (
        <CreateChannelModal
          isOpen={showCreateChannel}
          onClose={() => setShowCreateChannel(false)}
          serverId={server.id}
          categoryId={selectedCategoryId}
          initialType={channelType}
        />
      )}

      {showCreateCategory && (
        <CreateCategoryModal
          isOpen={showCreateCategory}
          onClose={() => setShowCreateCategory(false)}
          serverId={server.id}
        />
      )}

      {showInviteModal && (
        <ServerInviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          serverId={server.id}
          currentUserId={user.id}
        />
      )}

      {showServerSettings && (
        <ServerSettingsModal
          isOpen={showServerSettings}
          onClose={() => setShowServerSettings(false)}
          server={server}
          onUpdateServer={(serverId, updates) => {
            // Handle server updates
          }}
        />
      )}

      {contextMenu && (
        <ChannelContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onCreateTextChannel={handleCreateChannel}
          onCreateVoiceChannel={handleCreateVoiceChannel}
          onCreateCategory={handleCreateCategory}
          isCategory={contextMenu.isCategory}
        />
      )}
    </div>
  );
}