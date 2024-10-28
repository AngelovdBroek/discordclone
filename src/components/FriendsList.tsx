import React, { useState, useRef, useEffect } from 'react';
import { useUsers, User, FriendRequest } from '../store/users';
import { Search, UserPlus, MessageSquare, MoreVertical } from 'lucide-react';
import { ProfilePreview } from './ProfilePreview';

interface FriendsListProps {
  currentUser: User;
  onStartDM: (user: User) => void;
}

export default function FriendsList({ currentUser, onStartDM }: FriendsListProps) {
  const [activeTab, setActiveTab] = useState<'online' | 'all' | 'pending' | 'blocked' | 'add'>('online');
  const [searchQuery, setSearchQuery] = useState('');
  const [addFriendInput, setAddFriendInput] = useState('');
  const [addFriendError, setAddFriendError] = useState<string | null>(null);
  const [previewUser, setPreviewUser] = useState<{user: User, position: {x: number, y: number}} | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  const { 
    getAllUsers, 
    getFriends, 
    getFriendRequests,
    getBlockedUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unblockUser,
    getUser
  } = useUsers();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
        setPreviewUser(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddFriend = () => {
    setAddFriendError(null);
    
    if (!addFriendInput.includes('#')) {
      setAddFriendError('Please enter a username with discriminator (e.g. username#1234)');
      return;
    }

    const [username, discriminator] = addFriendInput.split('#');
    
    if (!username || !discriminator) {
      setAddFriendError('Invalid format. Please use username#0000');
      return;
    }

    const targetUser = getAllUsers().find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.discriminator === discriminator
    );

    if (!targetUser) {
      setAddFriendError('User not found');
      return;
    }

    if (targetUser.id === currentUser.id) {
      setAddFriendError('You cannot add yourself as a friend');
      return;
    }

    if (getFriends(currentUser.id).includes(targetUser.id)) {
      setAddFriendError('You are already friends with this user');
      return;
    }

    const existingRequest = getFriendRequests(currentUser.id).find(req =>
      (req.senderId === currentUser.id && req.receiverId === targetUser.id) ||
      (req.senderId === targetUser.id && req.receiverId === currentUser.id)
    );

    if (existingRequest) {
      setAddFriendError('Friend request already pending');
      return;
    }

    sendFriendRequest(currentUser.id, targetUser.id);
    setAddFriendInput('');
    setActiveTab('pending');
  };

  const handleShowPreview = (user: User, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const previewWidth = 340;
    const previewHeight = 400;
    const margin = 10;
    
    let x = rect.right + margin;
    let y = rect.top;

    if (x + previewWidth + margin > window.innerWidth) {
      x = rect.left - previewWidth - margin;
    }

    if (y + previewHeight + margin > window.innerHeight) {
      y = window.innerHeight - previewHeight - margin;
    }

    if (y < margin) {
      y = margin;
    }
    
    setPreviewUser({
      user,
      position: { x, y }
    });
  };

  const handleMessageClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    onStartDM(user);
  };

  const friends = getFriends(currentUser.id).map(id => getUser(id)!);
  const onlineFriends = friends.filter(friend => friend.status === 'online');
  const pendingRequests = getFriendRequests(currentUser.id);
  const blockedUsers = getBlockedUsers(currentUser.id).map(id => getUser(id)!);

  const incomingRequests = pendingRequests.filter(req => req.receiverId === currentUser.id);
  const outgoingRequests = pendingRequests.filter(req => req.senderId === currentUser.id);

  const renderFriendsList = () => {
    let users: User[] = [];
    let emptyMessage = '';

    switch (activeTab) {
      case 'online':
        users = onlineFriends;
        emptyMessage = 'No friends online';
        break;
      case 'all':
        users = friends;
        emptyMessage = 'No friends yet';
        break;
      case 'blocked':
        users = blockedUsers;
        emptyMessage = 'No blocked users';
        break;
    }

    if (searchQuery) {
      users = users.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (users.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-[#949ba4]">
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return users.map(user => (
      <div 
        key={user.id} 
        className="flex items-center justify-between p-4 hover:bg-[#35373c] cursor-pointer"
        onClick={(e) => handleShowPreview(user, e)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={user.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
              alt={user.displayName}
              className="w-8 h-8 rounded-full relative z-10"
            />
            {user.decoration && (
              <div className={`absolute inset-[-2px] rounded-full ${user.decoration} z-20`} />
            )}
            {user.effect && (
              <div className={`absolute inset-[-4px] rounded-full ${user.effect} z-0`} />
            )}
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#2b2d31] z-30
              ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}
            />
          </div>
          <div>
            <p className="text-white font-medium">{user.displayName}</p>
            <p className="text-[#949ba4] text-sm">
              {user.status === 'online' ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => handleMessageClick(e, user)}
            className="p-2 hover:bg-[#404249] rounded-full"
          >
            <MessageSquare className="w-5 h-5 text-[#b5bac1]" />
          </button>
          <button className="p-2 hover:bg-[#404249] rounded-full">
            <MoreVertical className="w-5 h-5 text-[#b5bac1]" />
          </button>
        </div>
      </div>
    ));
  };

  const renderPendingRequests = () => {
    if (pendingRequests.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-[#949ba4]">
          <p>No pending friend requests</p>
        </div>
      );
    }

    return (
      <>
        {incomingRequests.length > 0 && (
          <div className="mb-4">
            <h3 className="px-4 py-2 text-[#b5bac1] text-xs font-semibold uppercase">
              Incoming Friend Requests
            </h3>
            {incomingRequests.map(request => {
              const sender = getUser(request.senderId)!;
              return (
                <div 
                  key={request.id} 
                  className="flex items-center justify-between p-4 hover:bg-[#35373c] cursor-pointer"
                  onClick={(e) => handleShowPreview(sender, e)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={sender.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                        alt={sender.displayName}
                        className="w-8 h-8 rounded-full relative z-10"
                      />
                      {sender.decoration && (
                        <div className={`absolute inset-[-2px] rounded-full ${sender.decoration} z-20`} />
                      )}
                      {sender.effect && (
                        <div className={`absolute inset-[-4px] rounded-full ${sender.effect} z-0`} />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{sender.displayName}</p>
                      <p className="text-[#949ba4] text-sm">Incoming Friend Request</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptFriendRequest(request.id);
                      }}
                      className="px-4 py-1 bg-[#5865f2] text-white rounded-md hover:bg-[#4752c4]"
                    >
                      Accept
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        rejectFriendRequest(request.id);
                      }}
                      className="px-4 py-1 bg-[#ed4245] text-white rounded-md hover:bg-[#c93b3e]"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {outgoingRequests.length > 0 && (
          <div>
            <h3 className="px-4 py-2 text-[#b5bac1] text-xs font-semibold uppercase">
              Outgoing Friend Requests
            </h3>
            {outgoingRequests.map(request => {
              const receiver = getUser(request.receiverId)!;
              return (
                <div 
                  key={request.id} 
                  className="flex items-center justify-between p-4 hover:bg-[#35373c] cursor-pointer"
                  onClick={(e) => handleShowPreview(receiver, e)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={receiver.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                        alt={receiver.displayName}
                        className="w-8 h-8 rounded-full relative z-10"
                      />
                      {receiver.decoration && (
                        <div className={`absolute inset-[-2px] rounded-full ${receiver.decoration} z-20`} />
                      )}
                      {receiver.effect && (
                        <div className={`absolute inset-[-4px] rounded-full ${receiver.effect} z-0`} />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{receiver.displayName}</p>
                      <p className="text-[#949ba4] text-sm">Outgoing Friend Request</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex-1 bg-[#313338]">
      <div className="p-4 border-b border-[#1e1f22]">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setActiveTab('online')}
            className={`px-3 py-1 rounded ${
              activeTab === 'online' 
                ? 'bg-[#404249] text-white' 
                : 'text-[#949ba4] hover:text-white'
            }`}
          >
            Online
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded ${
              activeTab === 'all'
                ? 'bg-[#404249] text-white'
                : 'text-[#949ba4] hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`relative px-3 py-1 rounded ${
              activeTab === 'pending'
                ? 'bg-[#404249] text-white'
                : 'text-[#949ba4] hover:text-white'
            }`}
          >
            Pending
            {incomingRequests.length > 0 && activeTab !== 'pending' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#ed4245] rounded-full flex items-center justify-center">
                <span className="text-white text-xs">{incomingRequests.length}</span>
              </div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`px-3 py-1 rounded ${
              activeTab === 'blocked'
                ? 'bg-[#404249] text-white'
                : 'text-[#949ba4] hover:text-white'
            }`}
          >
            Blocked
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-3 py-1 rounded ${
              activeTab === 'add'
                ? 'bg-[#404249] text-white'
                : 'text-[#949ba4] hover:text-white'
            }`}
          >
            Add Friend
          </button>
        </div>

        {activeTab === 'add' ? (
          <div>
            <h2 className="text-white text-lg font-semibold mb-2">Add Friend</h2>
            <p className="text-[#949ba4] text-sm mb-4">
              You can add friends with their Discord username and discriminator.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={addFriendInput}
                onChange={(e) => setAddFriendInput(e.target.value)}
                placeholder="Enter a username#0000"
                className="flex-1 bg-[#1e1f22] text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
              />
              <button
                onClick={handleAddFriend}
                className="px-4 py-2 bg-[#5865f2] text-white rounded hover:bg-[#4752c4]"
              >
                Send Friend Request
              </button>
            </div>
            {addFriendError && (
              <p className="text-[#ed4245] text-sm mt-2">{addFriendError}</p>
            )}
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#949ba4]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-[#1e1f22] text-white rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
            />
          </div>
        )}
      </div>

      <div className="overflow-y-auto">
        {activeTab === 'pending' ? renderPendingRequests() : renderFriendsList()}
      </div>

      {previewUser && (
        <div ref={previewRef}>
          <ProfilePreview 
            user={previewUser.user}
            onClose={() => setPreviewUser(null)}
            onMessageClick={() => {
              onStartDM(previewUser.user);
              setPreviewUser(null);
            }}
            currentUserId={currentUser.id}
            position={previewUser.position}
          />
        </div>
      )}
    </div>
  );
}