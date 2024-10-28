import React, { useState, useRef, useEffect } from 'react';
import { ProfilePreview } from './ProfilePreview';
import { User, useUsers } from '../store/users';
import { Reply, Trash2, Edit2, Pin } from 'lucide-react';
import ImageModal from './ImageModal';
import { useServers } from '../store/servers';

// Regex to match emoji-only messages (including ZWJ sequences and variation selectors)
const emojiRegex = /^(?:[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F900}-\u{1F9FF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2B50}\u{2600}-\u{26FF}]|\u200D|\uFE0F)+$/u;

interface MessageProps {
  message: {
    id?: string | number;
    content: string;
    author: string;
    timestamp: Date;
    avatar: string;
    userId?: string;
    effect?: string | null;
    decoration?: string | null;
    image?: string;
    replyTo?: {
      id: string | number;
      content: string;
      author: string;
    } | null;
    edited?: boolean;
    pinned?: boolean;
    serverInvite?: {
      code: string;
      serverId: string;
      serverName: string;
      serverIcon: string;
      inviterId: string;
    };
  };
  isGrouped?: boolean;
  user?: User;
  onOpenFullProfile?: (userId: string) => void;
  onReply?: (messageId: string | number) => void;
  isHighlighted?: boolean;
  onReplyClick?: (messageId: string | number) => void;
  currentUserId?: string;
  onDelete?: () => void;
  onEdit?: (content: string) => void;
  onPin?: () => void;
  isEditing?: boolean;
  serverId?: string;
}

export default function Message({ 
  message, 
  isGrouped = false, 
  user, 
  onOpenFullProfile,
  onReply,
  isHighlighted = false,
  onReplyClick,
  currentUserId,
  onDelete,
  onEdit,
  onPin,
  isEditing = false,
  serverId
}: MessageProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const [showImageModal, setShowImageModal] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const { getUser } = useUsers();
  const { joinServer, isAdmin } = useServers();

  const isOwnMessage = currentUserId === message.userId;
  const canModerate = serverId ? isAdmin(serverId, currentUserId || '') : isOwnMessage;
  const isEmojiOnly = message.content && emojiRegex.test(message.content);
  const messageUser = message.userId ? getUser(message.userId) : null;

  useEffect(() => {
    if (isHighlighted && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageRef.current.classList.add('bg-[#3f4147]');
      const timer = setTimeout(() => {
        if (messageRef.current) {
          messageRef.current.classList.remove('bg-[#3f4147]');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.setSelectionRange(editContent.length, editContent.length);
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
        setShowPreview(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!message.userId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const previewWidth = 340;
    
    let x = rect.right + 10;
    if (x + previewWidth > window.innerWidth - 10) {
      x = rect.left - previewWidth - 10;
    }
    
    setPreviewPosition({ x, y: rect.top });
    setShowPreview(true);
  };

  const handleReplyClick = () => {
    if (message.id && onReply) {
      onReply(message.id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (onEdit) {
        onEdit(editContent);
      }
    } else if (e.key === 'Escape') {
      setEditContent(message.content);
      if (onEdit) {
        onEdit(message.content);
      }
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const isToday = messageDate.toDateString() === now.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === messageDate.toDateString();
    
    const time = messageDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    if (isToday) {
      return `Today at ${time}`;
    } else if (isYesterday) {
      return `Yesterday at ${time}`;
    } else {
      return messageDate.toLocaleDateString([], {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const renderReply = () => {
    if (!message.replyTo) return null;

    return (
      <div 
        className="flex items-center gap-2 text-sm text-[#b5bac1] mb-1 cursor-pointer hover:text-[#dcddde]"
        onClick={() => message.replyTo?.id && onReplyClick?.(message.replyTo.id)}
      >
        <Reply className="w-4 h-4" />
        <span className="text-[#00a8fc]">{message.replyTo.author}</span>
        <span className="truncate">{message.replyTo.content}</span>
      </div>
    );
  };

  const renderServerInvite = () => {
    if (!message.serverInvite) return null;

    const { serverName, serverIcon, code } = message.serverInvite;
    const inviter = getUser(message.serverInvite.inviterId);

    return (
      <div className="mt-2 bg-[#2b2d31] rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={serverIcon}
            alt={serverName}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h3 className="text-white font-semibold">{serverName}</h3>
            <p className="text-[#b5bac1] text-sm">
              {inviter ? `Invited by ${inviter.displayName}` : 'Server Invite'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (currentUserId) {
              joinServer(code, currentUserId);
            }
          }}
          className="w-full bg-[#5865f2] text-white py-2 rounded hover:bg-[#4752c4] transition-colors"
        >
          Accept Invite
        </button>
      </div>
    );
  };

  const messageClasses = `group px-4 py-0.5 hover:bg-[#2e3035] flex gap-4 relative transition-colors ${
    isHighlighted ? 'bg-[#3f4147] transition-colors duration-500' : ''
  }`;

  return (
    <>
      <div 
        ref={messageRef}
        id={`message-${message.id}`}
        className={messageClasses}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {!isGrouped ? (
          <div className="relative flex-shrink-0 w-10 h-10">
            {message.effect && (
              <div className={`absolute inset-[-4px] rounded-full ${message.effect}`} />
            )}
            {message.decoration && (
              <div className={`absolute inset-[-2px] rounded-full ${message.decoration}`} />
            )}
            <button 
              onClick={handleProfileClick}
              className="absolute inset-0 cursor-pointer"
            >
              <img 
                src={message.avatar}
                className="w-full h-full rounded-full" 
                alt={message.author} 
              />
            </button>
          </div>
        ) : (
          <div className="w-10 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          {message.replyTo && renderReply()}
          {!isGrouped && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleProfileClick}
                className="font-medium text-white hover:underline cursor-pointer"
              >
                {message.author}
              </button>
              <span className="text-xs text-[#949ba4]">
                {formatTime(message.timestamp)}
              </span>
              {message.edited && !isEditing && (
                <span className="text-xs text-[#949ba4]">(edited)</span>
              )}
              {message.pinned && (
                <Pin className="w-4 h-4 text-[#949ba4]" />
              )}
            </div>
          )}
          <div className="text-[#dcddde] mt-1">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <input
                  ref={editInputRef}
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="bg-[#383a40] w-full px-3 py-1 rounded focus:outline-none"
                />
                <div className="text-xs text-[#949ba4]">
                  escape to <span className="text-[#ed4245]">cancel</span> • enter to <span className="text-[#3ba55c]">save</span>
                </div>
              </div>
            ) : (
              <>
                {message.content && (
                  <p className={isEmojiOnly ? "text-4xl" : ""}>
                    {message.content}
                  </p>
                )}
                {message.image && (
                  <div className="mt-2 max-w-[520px]">
                    <img 
                      src={message.image} 
                      alt="Shared image" 
                      className="rounded-lg max-h-[350px] object-contain cursor-pointer hover:brightness-90 transition-all"
                      onClick={() => setShowImageModal(true)}
                    />
                  </div>
                )}
                {message.serverInvite && renderServerInvite()}
              </>
            )}
          </div>
        </div>

        {showActions && message.id && !isEditing && (
          <div className="absolute right-4 top-0 bg-[#2b2d31] rounded-md shadow-lg flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleReplyClick}
              className="p-2 hover:bg-[#1e1f22] rounded-md text-[#b5bac1] hover:text-white transition-colors"
            >
              <Reply className="w-5 h-5" />
            </button>
            {canModerate && (
              <>
                <button
                  onClick={() => onEdit && onEdit("")}
                  className="p-2 hover:bg-[#1e1f22] rounded-md text-[#b5bac1] hover:text-white transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 hover:bg-[#1e1f22] rounded-md text-[#ed4245] hover:text-white transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={onPin}
              className={`p-2 hover:bg-[#1e1f22] rounded-md transition-colors ${
                message.pinned ? 'text-[#5865f2]' : 'text-[#b5bac1]'
              } hover:text-white`}
            >
              <Pin className="w-5 h-5" />
            </button>
          </div>
        )}

        {showPreview && messageUser && (
          <div 
            ref={previewRef}
            style={{
              position: 'fixed',
              left: `${previewPosition.x}px`,
              top: `${previewPosition.y}px`,
              zIndex: 100
            }}
          >
            <ProfilePreview 
              user={messageUser}
              isPreview={true}
              onShowFullProfile={() => {
                setShowPreview(false);
                if (onOpenFullProfile && message.userId) {
                  onOpenFullProfile(message.userId);
                }
              }}
              onClose={() => setShowPreview(false)}
              currentUserId={currentUserId}
            />
          </div>
        )}
      </div>

      {showImageModal && message.image && (
        <ImageModal
          src={message.image}
          alt={`Image shared by ${message.author}`}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </>
  );
}