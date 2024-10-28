import React from 'react';
import { formatShortDate } from '../utils/dateFormatter';
import { MessageSquare, UserPlus, UserMinus, UserX, Settings } from 'lucide-react';
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
  memberSince: Date;
}

interface ProfilePreviewProps {
  user: User;
  isPreview?: boolean;
  onShowFullProfile?: () => void;
  onMessageClick?: () => void;
  currentUserId?: string;
  onClose?: () => void;
  position?: { x: number, y: number };
  onOpenSettings?: () => void;
}

export const ProfilePreview: React.FC<ProfilePreviewProps> = ({ 
  user, 
  isPreview = false,
  onShowFullProfile,
  onMessageClick,
  currentUserId,
  onClose,
  position,
  onOpenSettings
}) => {
  const { 
    sendFriendRequest, 
    areFriends,
    hasPendingRequest,
    getBlockedUsers,
    getFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    blockUser,
    unblockUser
  } = useUsers();

  const memberSince = user.memberSince instanceof Date ? user.memberSince : new Date(user.memberSince);
  const isCurrentUser = currentUserId && user.id && currentUserId === user.id;

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShowFullProfile) {
      onShowFullProfile();
    }
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMessageClick) {
      onMessageClick();
    }
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenSettings) {
      onOpenSettings();
    }
  };

  const handleFriendRequest = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentUserId && user.id) {
      sendFriendRequest(currentUserId, user.id);
    }
  };

  const handleRemoveFriend = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentUserId && user.id) {
      removeFriend(currentUserId, user.id);
    }
  };

  const handleBlockUser = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentUserId && user.id) {
      blockUser(currentUserId, user.id);
    }
  };

  const handleUnblockUser = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentUserId && user.id) {
      unblockUser(currentUserId, user.id);
    }
  };

  const isFriend = currentUserId && user.id ? areFriends(currentUserId, user.id) : false;
  const hasPending = currentUserId && user.id ? hasPendingRequest(currentUserId, user.id) : false;
  const isBlocked = currentUserId && user.id ? getBlockedUsers(currentUserId).includes(user.id) : false;

  const pendingRequest = currentUserId && user.id && getFriendRequests(currentUserId).find(req => 
    (req.senderId === user.id && req.receiverId === currentUserId) ||
    (req.senderId === currentUserId && req.receiverId === user.id)
  );
  const isReceiver = pendingRequest?.receiverId === currentUserId;

  const getPreviewStyle = () => {
    if (!position) return {};

    const previewWidth = 340;
    const previewHeight = 400;
    const margin = 10;

    let { x, y } = position;

    if (x + previewWidth + margin > window.innerWidth) {
      x = window.innerWidth - previewWidth - margin;
    }

    if (x < margin) {
      x = margin;
    }

    if (y + previewHeight + margin > window.innerHeight) {
      y = window.innerHeight - previewHeight - margin;
    }

    if (y < margin) {
      y = margin;
    }

    return {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      zIndex: 100
    };
  };

  return (
    <div className="bg-[#232428] rounded-lg overflow-hidden shadow-lg w-[340px]" style={getPreviewStyle()}>
      <div className="relative">
        {user.effect && (
          <div className={`absolute inset-0 w-full h-full ${user.effect}`} />
        )}
        
        <div className="relative z-10">
          <div className="h-[120px] relative">
            {user.banner ? (
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${user.banner})` }}
              />
            ) : (
              <div className="absolute inset-0 bg-[#5865f2]" />
            )}
          </div>

          <div className="p-4">
            <div className="flex items-start">
              <button 
                className="relative -mt-16 mr-4 cursor-pointer group z-20"
                onClick={handleAvatarClick}
                aria-label="View full profile"
              >
                <div className="relative">
                  <img
                    src={user.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                    alt={user.displayName}
                    className="w-[80px] h-[80px] rounded-full border-[6px] border-[#232428] relative z-10"
                  />
                  {user.decoration && (
                    <div className={`absolute inset-[-2px] rounded-full ${user.decoration} z-20`} />
                  )}
                  {isPreview && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-opacity z-30">
                      <span className="text-white text-xs">View Profile</span>
                    </div>
                  )}
                </div>
              </button>
              <div className="flex-1 pt-2">
                <h3 className="text-white text-lg font-semibold">
                  {user.displayName}
                </h3>
                <p className="text-[#b5bac1] text-sm">
                  {user.username}#{user.discriminator}
                </p>
              </div>
            </div>

            {user.bio && (
              <div className="mt-4 text-[#dbdee1] text-sm">
                {user.bio}
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-[#b5bac1] text-xs font-semibold uppercase mb-1">Member Since</h4>
                <p className="text-[#dbdee1] text-sm">{formatShortDate(memberSince)}</p>
              </div>

              <div className="flex flex-col gap-2">
                {isCurrentUser ? (
                  <button
                    onClick={handleSettingsClick}
                    className="w-full bg-[#5865f2] text-white py-2 px-4 rounded hover:bg-[#4752c4] transition-colors flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleMessageClick}
                      className="w-full bg-[#5865f2] text-white py-2 px-4 rounded hover:bg-[#4752c4] transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                    
                    <div className="flex gap-2">
                      {!isFriend && !hasPending && !isBlocked && (
                        <button 
                          onClick={handleFriendRequest}
                          className="flex-1 bg-[#3ba55c] text-white py-2 px-4 rounded hover:bg-[#2d7d46] transition-colors flex items-center justify-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          Add Friend
                        </button>
                      )}
                      {hasPending && !isReceiver && (
                        <button 
                          className="flex-1 bg-[#747f8d] text-white py-2 px-4 rounded cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          Pending
                        </button>
                      )}
                      {hasPending && isReceiver && pendingRequest && (
                        <div className="flex gap-2 w-full">
                          <button 
                            onClick={() => acceptFriendRequest(pendingRequest.id)}
                            className="flex-1 bg-[#3ba55c] text-white py-2 px-4 rounded hover:bg-[#2d7d46] transition-colors"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => rejectFriendRequest(pendingRequest.id)}
                            className="flex-1 bg-[#ed4245] text-white py-2 px-4 rounded hover:bg-[#c93b3e] transition-colors"
                          >
                            Ignore
                          </button>
                        </div>
                      )}
                      {isFriend && (
                        <button 
                          onClick={handleRemoveFriend}
                          className="flex-1 bg-[#ed4245] text-white py-2 px-4 rounded hover:bg-[#c93b3e] transition-colors flex items-center justify-center gap-2"
                        >
                          <UserMinus className="w-4 h-4" />
                          Remove Friend
                        </button>
                      )}
                    </div>

                    {isBlocked ? (
                      <button 
                        onClick={handleUnblockUser}
                        className="w-full bg-[#ed4245] text-white py-2 px-4 rounded hover:bg-[#c93b3e] transition-colors flex items-center justify-center gap-2"
                      >
                        <UserX className="w-4 h-4" />
                        Unblock
                      </button>
                    ) : (
                      <button 
                        onClick={handleBlockUser}
                        className="w-full bg-[#ed4245] text-white py-2 px-4 rounded hover:bg-[#c93b3e] transition-colors flex items-center justify-center gap-2"
                      >
                        <UserX className="w-4 h-4" />
                        Block
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};