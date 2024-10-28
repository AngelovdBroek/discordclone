import React from 'react';
import { formatDate } from '../utils/dateFormatter';
import { X, MessageSquare, UserPlus, UserMinus, UserX } from 'lucide-react';
import { useUsers } from '../store/users';

interface User {
  id?: string;
  displayName: string;
  username: string;
  discriminator: string;
  avatar?: string;
  bio?: string;
  banner?: string;
  effect?: string | null;
  decoration?: string | null;
  memberSince: Date | string | number;
}

interface FullProfileViewProps {
  user: User;
  onClose: () => void;
  onMessageClick?: () => void;
  currentUserId?: string;
}

const FullProfileView: React.FC<FullProfileViewProps> = ({ 
  user, 
  onClose, 
  onMessageClick,
  currentUserId
}) => {
  const { 
    sendFriendRequest, 
    getFriendRequests, 
    getFriends,
    areFriends,
    hasPendingRequest,
    getBlockedUsers
  } = useUsers();

  const handleMessageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMessageClick) {
      onMessageClick();
      onClose();
    }
  };

  const handleFriendRequest = () => {
    if (currentUserId && user.id) {
      sendFriendRequest(currentUserId, user.id);
    }
  };

  const isFriend = currentUserId && user.id ? areFriends(currentUserId, user.id) : false;
  const hasPending = currentUserId && user.id ? hasPendingRequest(currentUserId, user.id) : false;
  const isBlocked = currentUserId && user.id ? getBlockedUsers(currentUserId).includes(user.id) : false;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200]" onClick={onClose}>
      <div className="bg-[#313338] rounded-lg w-full max-w-[600px] h-[80vh] overflow-hidden relative" onClick={e => e.stopPropagation()}>
        {/* Profile Effect */}
        {user.effect && (
          <div className={`absolute inset-0 w-full h-full ${user.effect}`} style={{ zIndex: 1 }} />
        )}

        {/* Content Container */}
        <div className="relative h-full z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner */}
          <div className="h-60">
            {user.banner ? (
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${user.banner})` }}
              />
            ) : (
              <div className="w-full h-full bg-[#5865f2]" />
            )}
          </div>

          {/* Profile Content */}
          <div className="px-4 pb-4">
            {/* Avatar Section */}
            <div className="relative -mt-[76px] mb-3">
              <div className="relative inline-block">
                <img
                  src={user.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                  alt={user.displayName}
                  className="w-[120px] h-[120px] rounded-full border-8 border-[#313338] relative z-10"
                />
                {user.decoration && (
                  <div className={`absolute inset-[-4px] rounded-full ${user.decoration} z-20`} />
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="bg-[#2b2d31]/90 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-white text-xl font-bold">
                    {user.displayName}
                  </h2>
                  <p className="text-[#b5bac1]">
                    {user.username}#{user.discriminator}
                  </p>
                </div>
                {currentUserId && currentUserId !== user.id && (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleMessageClick}
                      className="bg-[#5865f2] text-white px-4 py-2 rounded hover:bg-[#4752c4] transition-colors flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                    {!isFriend && !hasPending && !isBlocked && (
                      <button 
                        onClick={handleFriendRequest}
                        className="bg-[#3ba55c] text-white px-4 py-2 rounded hover:bg-[#2d7d46] transition-colors flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Friend
                      </button>
                    )}
                    {hasPending && (
                      <button 
                        className="bg-[#747f8d] text-white px-4 py-2 rounded cursor-not-allowed flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Pending
                      </button>
                    )}
                    {isFriend && (
                      <button 
                        className="bg-[#ed4245] text-white px-4 py-2 rounded hover:bg-[#c93b3e] transition-colors flex items-center gap-2"
                      >
                        <UserMinus className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                    {isBlocked && (
                      <button 
                        className="bg-[#ed4245] text-white px-4 py-2 rounded hover:bg-[#c93b3e] transition-colors flex items-center gap-2"
                      >
                        <UserX className="w-4 h-4" />
                        Blocked
                      </button>
                    )}
                  </div>
                )}
              </div>

              {user.bio && (
                <div className="mt-4 pt-4 border-t border-[#1e1f22]/50">
                  <h3 className="text-[#b5bac1] text-xs font-semibold uppercase mb-2">About Me</h3>
                  <p className="text-white whitespace-pre-wrap">{user.bio}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-[#1e1f22]/50">
                <h3 className="text-[#b5bac1] text-xs font-semibold uppercase mb-2">Member Since</h3>
                <p className="text-white">
                  {formatDate(user.memberSince)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullProfileView;