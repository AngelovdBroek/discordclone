import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UnreadState {
  servers: Record<string, {
    lastRead: Date;
    channels: Record<string, Date>;
  }>;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  serverId?: string;
  timestamp: Date;
  image?: string;
  pinned?: boolean;
  replyTo?: {
    id: string;
    content: string;
    author: string;
  } | null;
  edited?: boolean;
  serverInvite?: {
    code: string;
    serverId: string;
    serverName: string;
    serverIcon: string;
    inviterId: string;
  };
}

export interface DMChannel {
  id: string;
  participants: string[];
  lastMessage?: Message;
}

interface MessagesState {
  messages: Message[];
  dmChannels: DMChannel[];
  unreadState: UnreadState;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  pinMessage: (messageId: string) => void;
  unpinMessage: (messageId: string) => void;
  getOrCreateDMChannel: (userId1: string, userId2: string) => string;
  searchMessages: (query: string, channelId: string, serverId?: string, isDM?: boolean) => Message[];
  getPinnedMessages: (channelId: string, serverId?: string, isDM?: boolean) => Message[];
  deleteUserMessages: (userId: string) => void;
  markServerRead: (serverId: string, userId: string) => void;
  markChannelRead: (serverId: string, channelId: string, userId: string) => void;
  hasUnreadMessages: (serverId: string, userId: string) => boolean;
  hasUnreadChannel: (serverId: string, channelId: string, userId: string) => boolean;
  getLastMessageInChannel: (serverId: string, channelId: string) => Message | undefined;
}

// Migration function to handle state updates
const migrateState = (persistedState: any, version: number): any => {
  if (version === 0) {
    return {
      ...persistedState,
      messages: (persistedState.messages || []).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })),
      unreadState: persistedState.unreadState || { servers: {} },
      dmChannels: persistedState.dmChannels || []
    };
  }
  return persistedState;
};

export const useMessages = create<MessagesState>()(
  persist(
    (set, get) => ({
      messages: [],
      dmChannels: [],
      unreadState: { servers: {} },

      addMessage: (messageData) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          timestamp: new Date(),
          ...messageData
        };

        set((state) => {
          // Update unread state for server messages
          if (messageData.serverId) {
            const serverState = state.unreadState.servers[messageData.serverId] || {
              lastRead: new Date(0),
              channels: {}
            };

            return {
              messages: [...state.messages, newMessage],
              unreadState: {
                ...state.unreadState,
                servers: {
                  ...state.unreadState.servers,
                  [messageData.serverId]: {
                    ...serverState,
                    channels: {
                      ...serverState.channels,
                      [messageData.receiverId]: new Date()
                    }
                  }
                }
              }
            };
          }

          // Handle DM messages
          if (!messageData.serverId) {
            const channelId = `dm-${[messageData.senderId, messageData.receiverId].sort().join('-')}`;
            const existingChannel = state.dmChannels.find(ch => ch.id === channelId);

            if (existingChannel) {
              return {
                ...state,
                messages: [...state.messages, newMessage],
                dmChannels: state.dmChannels.map(ch =>
                  ch.id === channelId ? { ...ch, lastMessage: newMessage } : ch
                )
              };
            } else {
              return {
                ...state,
                messages: [...state.messages, newMessage],
                dmChannels: [...state.dmChannels, {
                  id: channelId,
                  participants: [messageData.senderId, messageData.receiverId],
                  lastMessage: newMessage
                }]
              };
            }
          }

          return { ...state, messages: [...state.messages, newMessage] };
        });
      },

      updateMessage: (messageId, updates) => {
        set((state) => ({
          messages: state.messages.map(msg =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          )
        }));
      },

      deleteMessage: (messageId) => {
        set((state) => ({
          messages: state.messages.filter(msg => msg.id !== messageId)
        }));
      },

      pinMessage: (messageId) => {
        set((state) => ({
          messages: state.messages.map(msg =>
            msg.id === messageId ? { ...msg, pinned: true } : msg
          )
        }));
      },

      unpinMessage: (messageId) => {
        set((state) => ({
          messages: state.messages.map(msg =>
            msg.id === messageId ? { ...msg, pinned: false } : msg
          )
        }));
      },

      getOrCreateDMChannel: (userId1, userId2) => {
        const channelId = `dm-${[userId1, userId2].sort().join('-')}`;
        const state = get();
        const existingChannel = state.dmChannels.find(ch => ch.id === channelId);

        if (!existingChannel) {
          set((state) => ({
            dmChannels: [...state.dmChannels, {
              id: channelId,
              participants: [userId1, userId2]
            }]
          }));
        }

        return channelId;
      },

      searchMessages: (query, channelId, serverId, isDM = false) => {
        const state = get();
        return state.messages.filter(msg => {
          if (isDM) {
            const dmChannelId = `dm-${[msg.senderId, msg.receiverId].sort().join('-')}`;
            return dmChannelId === channelId && 
                   msg.content.toLowerCase().includes(query.toLowerCase());
          }
          return msg.receiverId === channelId && 
                 msg.serverId === serverId && 
                 msg.content.toLowerCase().includes(query.toLowerCase());
        });
      },

      getPinnedMessages: (channelId, serverId, isDM = false) => {
        const state = get();
        return state.messages.filter(msg => {
          if (isDM) {
            const dmChannelId = `dm-${[msg.senderId, msg.receiverId].sort().join('-')}`;
            return dmChannelId === channelId && msg.pinned;
          }
          return msg.receiverId === channelId && 
                 msg.serverId === serverId && 
                 msg.pinned;
        });
      },

      deleteUserMessages: (userId) => {
        set((state) => ({
          messages: state.messages.filter(msg => msg.senderId !== userId)
        }));
      },

      markServerRead: (serverId, userId) => {
        set((state) => ({
          unreadState: {
            ...state.unreadState,
            servers: {
              ...state.unreadState.servers,
              [serverId]: {
                lastRead: new Date(),
                channels: {}
              }
            }
          }
        }));
      },

      markChannelRead: (serverId, channelId, userId) => {
        set((state) => {
          const serverState = state.unreadState.servers[serverId] || {
            lastRead: new Date(0),
            channels: {}
          };

          return {
            unreadState: {
              ...state.unreadState,
              servers: {
                ...state.unreadState.servers,
                [serverId]: {
                  ...serverState,
                  channels: {
                    ...serverState.channels,
                    [channelId]: new Date()
                  }
                }
              }
            }
          };
        });
      },

      hasUnreadMessages: (serverId, userId) => {
        const { messages, unreadState } = get();
        const serverState = unreadState.servers[serverId];
        if (!serverState) return false;

        const lastServerMessage = messages
          .filter(m => m.serverId === serverId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        return lastServerMessage && new Date(lastServerMessage.timestamp) > new Date(serverState.lastRead);
      },

      hasUnreadChannel: (serverId, channelId, userId) => {
        const { messages, unreadState } = get();
        const serverState = unreadState.servers[serverId];
        if (!serverState) return false;

        const lastChannelRead = serverState.channels[channelId] || new Date(0);
        const lastChannelMessage = messages
          .filter(m => m.serverId === serverId && m.receiverId === channelId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        return lastChannelMessage && new Date(lastChannelMessage.timestamp) > new Date(lastChannelRead);
      },

      getLastMessageInChannel: (serverId, channelId) => {
        const { messages } = get();
        return messages
          .filter(m => m.serverId === serverId && m.receiverId === channelId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      }
    }),
    {
      name: 'discord-messages',
      version: 1,
      migrate: migrateState
    }
  )
);