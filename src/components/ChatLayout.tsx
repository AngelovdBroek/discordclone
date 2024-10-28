import React, { useState, useEffect } from 'react';
import ServerSidebar from './ServerSidebar';
import ChannelSidebar from './ChannelSidebar';
import ChatArea from './ChatArea';
import DMsList from './DMsList';
import DMChat from './DMChat';
import MembersList from './MembersList';
import SettingsModal from './SettingsModal';
import FullProfileView from './FullProfileView';
import FriendsList from './FriendsList';
import { useMessages } from '../store/messages';
import { User } from '../store/users';
import { useServers } from '../store/servers';

interface ChatLayoutProps {
  user: User;
  onUpdateUser: (updates: Partial<User>) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  allUsers: User[];
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ 
  user, 
  onUpdateUser, 
  onLogout,
  onDeleteAccount,
  allUsers 
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'server' | 'dm' | 'friends'>('dm');
  const [selectedDM, setSelectedDM] = useState<User | null>(null);
  const [lastSelectedDM, setLastSelectedDM] = useState<User | null>(null);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const { messages, dmChannels, getOrCreateDMChannel } = useMessages();
  const { getServer } = useServers();

  // Initialize view state based on last DM
  useEffect(() => {
    const userDMs = dmChannels.filter(channel => 
      channel.participants.includes(user.id)
    );

    if (userDMs.length > 0 && !selectedDM && !lastSelectedDM) {
      // Find the most recent DM based on last message timestamp
      const sortedDMs = userDMs.sort((a, b) => {
        const aLastMessage = messages.filter(m => 
          m.senderId === a.participants[0] && m.receiverId === a.participants[1] ||
          m.senderId === a.participants[1] && m.receiverId === a.participants[0]
        ).sort((m1, m2) => new Date(m2.timestamp).getTime() - new Date(m1.timestamp).getTime())[0];

        const bLastMessage = messages.filter(m => 
          m.senderId === b.participants[0] && m.receiverId === b.participants[1] ||
          m.senderId === b.participants[1] && m.receiverId === b.participants[0]
        ).sort((m1, m2) => new Date(m2.timestamp).getTime() - new Date(m1.timestamp).getTime())[0];

        if (!aLastMessage && !bLastMessage) return 0;
        if (!aLastMessage) return 1;
        if (!bLastMessage) return -1;

        return new Date(bLastMessage.timestamp).getTime() - new Date(aLastMessage.timestamp).getTime();
      });

      const mostRecentDM = sortedDMs[0];
      const otherUserId = mostRecentDM.participants.find(id => id !== user.id);
      const otherUser = allUsers.find(u => u.id === otherUserId);

      if (otherUser) {
        setSelectedDM(otherUser);
        setLastSelectedDM(otherUser);
      }
    }
  }, [user.id, dmChannels, messages, allUsers, selectedDM, lastSelectedDM]);

  // Select first available channel when server is selected
  useEffect(() => {
    if (selectedServerId) {
      const server = getServer(selectedServerId);
      if (server && server.categories.length > 0) {
        const firstCategory = server.categories.find(cat => cat.channels.length > 0);
        if (firstCategory) {
          setSelectedChannelId(firstCategory.channels[0].id);
        }
      }
    }
  }, [selectedServerId]);

  const handleToggleView = () => {
    if (currentView === 'server') {
      setCurrentView('dm');
      setSelectedServerId(null);
      setSelectedChannelId(null);
      // Restore last selected DM when switching back to DM view
      setSelectedDM(lastSelectedDM);
    } else {
      setCurrentView('server');
      // Store current DM before switching to server view
      setLastSelectedDM(selectedDM);
      setSelectedDM(null);
    }
  };

  const handleShowFriends = () => {
    setCurrentView('friends');
    setLastSelectedDM(selectedDM);
    setSelectedDM(null);
    setSelectedServerId(null);
  };

  const handleStartDM = (otherUser: User) => {
    const channelId = getOrCreateDMChannel(user.id, otherUser.id);
    setSelectedDM(otherUser);
    setLastSelectedDM(otherUser);
    setCurrentView('dm');
    setSelectedServerId(null);
    setSelectedProfile(null);
  };

  const handleSelectDM = (channelId: string, otherUser: User) => {
    setSelectedDM(otherUser);
    setLastSelectedDM(otherUser);
    setCurrentView('dm');
    setSelectedServerId(null);
  };

  const handleServerSelect = (serverId: string) => {
    setSelectedServerId(serverId);
    setCurrentView('server');
    setLastSelectedDM(selectedDM);
    setSelectedDM(null);
    
    // Select first available channel
    const server = getServer(serverId);
    if (server && server.categories.length > 0) {
      const firstCategory = server.categories.find(cat => cat.channels.length > 0);
      if (firstCategory) {
        setSelectedChannelId(firstCategory.channels[0].id);
      }
    }
  };

  const selectedServer = selectedServerId ? getServer(selectedServerId) : null;

  return (
    <div className="flex h-screen bg-[#313338]">
      <ServerSidebar 
        onToggleView={handleToggleView}
        currentUserId={user.id}
        currentView={currentView}
        onShowFriends={handleShowFriends}
        onServerSelect={handleServerSelect}
        selectedServerId={selectedServerId}
      />

      {currentView === 'server' ? (
        <>
          <ChannelSidebar 
            user={user}
            onOpenSettings={() => setIsSettingsOpen(true)}
            selectedChannel={selectedChannelId || ''}
            onChannelSelect={setSelectedChannelId}
            serverId={selectedServerId}
            server={selectedServer}
          />
          <div className="flex-1 flex">
            {selectedChannelId && (
              <ChatArea 
                user={user}
                serverId={selectedServerId}
                channelId={selectedChannelId}
                channelName={selectedServer?.categories
                  .flatMap(cat => cat.channels)
                  .find(ch => ch.id === selectedChannelId)?.name}
              />
            )}
            <MembersList 
              serverId={selectedServerId}
              members={allUsers}
              onMemberClick={setSelectedProfile}
              onStartDM={handleStartDM}
              currentUserId={user.id}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
        </>
      ) : (
        <>
          <DMsList 
            currentUser={user}
            allUsers={allUsers}
            onSelectDM={handleSelectDM}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onShowFriends={handleShowFriends}
            showFriends={currentView === 'friends'}
          />
          <div className="flex-1">
            {currentView === 'dm' && selectedDM ? (
              <DMChat
                currentUser={user}
                otherUser={selectedDM}
                channelId={`dm-${[user.id, selectedDM.id].sort().join('-')}`}
              />
            ) : currentView === 'friends' ? (
              <FriendsList 
                currentUser={user}
                onStartDM={handleStartDM}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Discord!</h2>
                <p className="text-[#949ba4] mb-4">
                  Start a conversation by selecting a friend from your DMs list or add new friends to chat with.
                </p>
                <button
                  onClick={handleShowFriends}
                  className="px-4 py-2 bg-[#5865f2] text-white rounded hover:bg-[#4752c4] transition-colors"
                >
                  Find or Add Friends
                </button>
              </div>
            )}
          </div>
        </>
      )}
      
      {isSettingsOpen && (
        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          user={user}
          onUpdateUser={onUpdateUser}
          onLogout={onLogout}
          onDeleteAccount={onDeleteAccount}
        />
      )}

      {selectedProfile && (
        <FullProfileView 
          user={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onMessageClick={() => handleStartDM(selectedProfile)}
          currentUserId={user.id}
        />
      )}
    </div>
  );
};

export default ChatLayout;