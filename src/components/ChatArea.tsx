import React, { useState, useRef, useEffect } from 'react';
import { Hash, Bell, Pin, Users, Search, HelpCircle, Plus, Gift, ImagePlus, Smile, X } from 'lucide-react';
import Message from './Message';
import { useUsers, User } from '../store/users';
import FullProfileView from './FullProfileView';
import ImageUploadPreview from './ImageUploadPreview';
import EmojiPicker from './EmojiPicker';
import { useMessages } from '../store/messages';
import SearchBar from './SearchBar';
import PinnedMessagesModal from './PinnedMessagesModal';
import { useServers } from '../store/servers';

interface ChatAreaProps {
  user: User;
  serverId?: string;
  channelId: string;
  channelName?: string;
}

export default function ChatArea({ user, serverId, channelId, channelName = 'general' }: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    content: string;
    author: string;
  } | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [imageUpload, setImageUpload] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  
  const { messages, addMessage, deleteMessage, updateMessage, pinMessage, unpinMessage } = useMessages();
  const { getUser } = useUsers();
  const { getServer } = useServers();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const serverMessages = messages.filter(m => 
    m.receiverId === channelId && m.serverId === serverId
  );

  // Group messages by date
  const groupedMessages = serverMessages.reduce((groups: { [key: string]: typeof serverMessages }, message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  // Get actual channel name from server if available
  const server = serverId ? getServer(serverId) : null;
  const currentChannel = server?.categories
    .flatMap(cat => cat.channels)
    .find(ch => ch.id === channelId);
  const displayChannelName = currentChannel?.name || channelName;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [serverMessages]);

  useEffect(() => {
    if (highlightedMessageId) {
      setTimeout(() => setHighlightedMessageId(null), 2000);
    }
  }, [highlightedMessageId]);

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !imageUpload) || (newMessage.length === 0 && !imageUpload)) return;

    const messageData = {
      content: newMessage.trim(),
      senderId: user.id,
      receiverId: channelId,
      serverId: serverId,
      image: imageUpload?.preview,
      replyTo: replyingTo,
      edited: false
    };

    addMessage(messageData);
    setNewMessage("");
    setImageUpload(null);
    setReplyingTo(null);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpdateMessage = (messageId: string, content: string) => {
    if (!content.trim()) return;
    updateMessage(messageId, {
      content: content.trim(),
      edited: true
    });
    setEditingMessageId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMessageId) {
        handleUpdateMessage(editingMessageId, editContent);
      } else {
        handleSendMessage();
      }
    } else if (e.key === 'Escape' && editingMessageId) {
      setEditingMessageId(null);
      setEditContent("");
    }
  };

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUpload({
        file,
        preview: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleEmojiSelect = (emoji: any) => {
    const cursorPosition = messageInputRef.current?.selectionStart || newMessage.length;
    const newText = newMessage.slice(0, cursorPosition) + emoji.native + newMessage.slice(cursorPosition);
    setNewMessage(newText);
    
    setTimeout(() => {
      if (messageInputRef.current) {
        messageInputRef.current.focus();
        const newPosition = cursorPosition + emoji.native.length;
        messageInputRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  return (
    <div 
      className="flex-1 flex flex-col bg-[#313338]"
      ref={dropZoneRef}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          handleImageSelect(file);
        }
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#1e1f22] shadow-sm">
        <div className="flex items-center text-white">
          <Hash className="w-6 h-6 text-[#949ba4] mr-2" />
          <span className="font-bold">{displayChannelName}</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-1 hover:bg-[#404249] rounded">
            <Bell className="w-5 h-5 text-[#b5bac1]" />
          </button>
          <button 
            onClick={() => setShowPinnedMessages(true)}
            className="p-1 hover:bg-[#404249] rounded"
          >
            <Pin className="w-5 h-5 text-[#b5bac1]" />
          </button>
          <button className="p-1 hover:bg-[#404249] rounded">
            <Users className="w-5 h-5 text-[#b5bac1]" />
          </button>
          <SearchBar 
            channelId={channelId}
            serverId={serverId}
            channelName={displayChannelName}
            onHighlightMessage={setHighlightedMessageId}
          />
          <button className="p-1 hover:bg-[#404249] rounded">
            <HelpCircle className="w-5 h-5 text-[#b5bac1]" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {Object.entries(groupedMessages).map(([date, dateMessages], dateIndex) => (
          <React.Fragment key={date}>
            {dateMessages.map((message, messageIndex) => {
              const sender = getUser(message.senderId);
              if (!sender) return null;

              const prevMessage = messageIndex > 0 ? dateMessages[messageIndex - 1] : null;
              const isGrouped = prevMessage && 
                prevMessage.senderId === message.senderId &&
                new Date(message.timestamp).getMinutes() === new Date(prevMessage.timestamp).getMinutes();

              const isFirstMessageOfDay = messageIndex === 0;

              return (
                <Message
                  key={message.id}
                  message={{
                    id: message.id,
                    content: message.content,
                    author: sender.displayName,
                    timestamp: new Date(message.timestamp),
                    avatar: sender.avatar || "https://cdn.discordapp.com/embed/avatars/0.png",
                    userId: sender.id,
                    effect: sender.effect,
                    decoration: sender.decoration,
                    image: message.image,
                    replyTo: message.replyTo,
                    edited: message.edited,
                    pinned: message.pinned
                  }}
                  isGrouped={isGrouped}
                  showDateSeparator={isFirstMessageOfDay}
                  onReply={() => setReplyingTo({
                    id: message.id,
                    content: message.content,
                    author: sender.displayName
                  })}
                  isHighlighted={message.id === highlightedMessageId}
                  onReplyClick={(messageId) => {
                    setHighlightedMessageId(messageId);
                    const element = document.getElementById(`message-${messageId}`);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onOpenFullProfile={() => setSelectedProfile(sender)}
                  currentUserId={user.id}
                  onDelete={() => deleteMessage(message.id)}
                  onEdit={() => {
                    setEditingMessageId(message.id);
                    setEditContent(message.content);
                  }}
                  onPin={() => message.pinned ? unpinMessage(message.id) : pinMessage(message.id)}
                  isEditing={editingMessageId === message.id}
                />
              );
            })}
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 pb-6">
        {replyingTo && (
          <div className="mb-2 bg-[#2b2d31] rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#b5bac1]">
              <span>Replying to</span>
              <span className="font-medium text-[#00a8fc]">{replyingTo.author}</span>
            </div>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="text-[#b5bac1] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {imageUpload && (
          <ImageUploadPreview 
            imagePreview={imageUpload.preview}
            onCancel={() => setImageUpload(null)}
          />
        )}

        <div className="bg-[#383a40] rounded-lg flex items-center p-2 space-x-2">
          <button type="button" className="p-2 hover:bg-[#404249] rounded-full">
            <Plus className="w-5 h-5 text-[#b5bac1]" />
          </button>
          <input
            ref={messageInputRef}
            type="text"
            value={editingMessageId ? editContent : newMessage}
            onChange={(e) => editingMessageId ? setEditContent(e.target.value) : setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message #${displayChannelName}`}
            className="bg-transparent flex-1 outline-none text-[#dcddde] placeholder-[#949ba4]"
          />
          <button type="button" className="p-2 hover:bg-[#404249] rounded-full">
            <Gift className="w-5 h-5 text-[#b5bac1]" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-[#404249] rounded-full"
          >
            <ImagePlus className="w-5 h-5 text-[#b5bac1]" />
          </button>
          <button 
            ref={emojiButtonRef}
            type="button" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-[#404249] rounded-full"
          >
            <Smile className="w-5 h-5 text-[#b5bac1]" />
          </button>
        </div>
      </div>

      {showEmojiPicker && (
        <EmojiPicker
          onSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
          buttonRef={emojiButtonRef}
        />
      )}

      {selectedProfile && (
        <FullProfileView 
          user={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}

      {showPinnedMessages && (
        <PinnedMessagesModal
          isOpen={showPinnedMessages}
          onClose={() => setShowPinnedMessages(false)}
          channelId={channelId}
          serverId={serverId}
          onMessageClick={setHighlightedMessageId}
        />
      )}
    </div>
  );
}