import React, { useState, useRef, useEffect } from 'react';
import { Plus, Gift, ImagePlus, Smile, X, Pin, Search } from 'lucide-react';
import { useMessages } from '../store/messages';
import { useUsers, User } from '../store/users';
import Message from './Message';
import SearchBar from './SearchBar';
import PinnedMessagesModal from './PinnedMessagesModal';
import FullProfileView from './FullProfileView';
import ImageUploadPreview from './ImageUploadPreview';
import EmojiPicker from './EmojiPicker';

interface DMChatProps {
  currentUser: User;
  otherUser: User;
  channelId: string;
}

const DMChat: React.FC<DMChatProps> = ({ currentUser, otherUser, channelId }) => {
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [imageUpload, setImageUpload] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    content: string;
    author: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  const { messages: allMessages, addMessage, deleteMessage, updateMessage, pinMessage, unpinMessage, getPinnedMessages } = useMessages();
  const { getUser } = useUsers();

  const channelMessages = allMessages.filter(msg => 
    (msg.senderId === currentUser.id && msg.receiverId === otherUser.id) ||
    (msg.senderId === otherUser.id && msg.receiverId === currentUser.id)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages]);

  const handleUpdateMessage = (messageId: string, content: string) => {
    if (!content.trim()) return;
    updateMessage(messageId, {
      content: content.trim(),
      edited: true
    });
    setEditingMessageId(null);
  };

  const handlePinMessage = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    pinMessage(messageId);
  };

  const handleUnpinMessage = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    unpinMessage(messageId);
  };

  const handleHighlightMessage = (messageId: string) => {
    setHighlightedMessageId(messageId);
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => setHighlightedMessageId(null), 2000);
  };

  const handlePinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPinnedMessages(true);
  };

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !imageUpload) || (newMessage.length === 0 && !imageUpload)) return;

    const messageData = {
      content: newMessage.trim(),
      senderId: currentUser.id,
      receiverId: otherUser.id,
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
    const newMessageWithEmoji = 
      newMessage.slice(0, cursorPosition) + 
      emoji.native + 
      newMessage.slice(cursorPosition);
    
    setNewMessage(newMessageWithEmoji);
    
    setTimeout(() => {
      if (messageInputRef.current) {
        messageInputRef.current.focus();
        const newPosition = cursorPosition + emoji.native.length;
        messageInputRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  // Group messages by date
  const groupedMessages = channelMessages.reduce((groups: Record<string, typeof channelMessages>, message) => {
    const date = new Date(message.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey;
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday';
    } else {
      dateKey = date.toLocaleDateString('en-US', { 
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
    return groups;
  }, {});

  return (
    <div 
      className="flex flex-col h-full bg-[#313338]" 
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
          <img
            src={otherUser.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
            alt={otherUser.displayName}
            className="w-8 h-8 rounded-full mr-2"
          />
          <span className="font-bold">{otherUser.displayName}</span>
        </div>
        <div className="flex items-center space-x-4">
          <SearchBar 
            channelId={channelId}
            channelName={otherUser.displayName}
            onHighlightMessage={handleHighlightMessage}
            isDM={true}
          />
          <button 
            onClick={handlePinClick}
            className="p-1 hover:bg-[#404249] rounded"
          >
            <Pin className="w-5 h-5 text-[#b5bac1]" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-[#3f4147]"></div>
              <span className="flex-shrink-0 mx-4 text-[#949ba4] text-xs font-semibold">
                {date}
              </span>
              <div className="flex-grow border-t border-[#3f4147]"></div>
            </div>
            {dateMessages.map((message, index) => {
              const sender = getUser(message.senderId);
              if (!sender) return null;

              const prevMessage = index > 0 ? dateMessages[index - 1] : null;
              const isGrouped = prevMessage && 
                prevMessage.senderId === message.senderId &&
                new Date(message.timestamp).getMinutes() === new Date(prevMessage.timestamp).getMinutes();

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
                  onReply={() => setReplyingTo({
                    id: message.id,
                    content: message.content,
                    author: sender.displayName
                  })}
                  isHighlighted={message.id === highlightedMessageId}
                  onReplyClick={(messageId) => {
                    setHighlightedMessageId(messageId);
                    const element = document.getElementById(messageId);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onOpenFullProfile={() => setSelectedProfile(sender)}
                  currentUserId={currentUser.id}
                  onDelete={() => deleteMessage(message.id)}
                  onEdit={() => {
                    setEditingMessageId(message.id);
                    setEditContent(message.content);
                  }}
                  onPin={(e) => message.pinned ? handleUnpinMessage(e, message.id) : handlePinMessage(e, message.id)}
                  isEditing={editingMessageId === message.id}
                />
              );
            })}
          </div>
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
            placeholder={editingMessageId ? "Edit your message" : `Message @${otherUser.displayName}`}
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
          onMessageClick={handleHighlightMessage}
          channelId={channelId}
          isDM={true}
        />
      )}
    </div>
  );
};

export default DMChat;