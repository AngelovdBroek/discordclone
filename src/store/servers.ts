import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UnreadState {
  [channelId: string]: {
    lastRead: number;
    hasUnread: boolean;
  };
}

export interface Category {
  id: string;
  name: string;
  channels: Channel[];
  collapsed: Record<string, boolean>;
}

export interface Server {
  id: string;
  name: string;
  icon: string;
  ownerId: string;
  members: string[];
  admins?: string[];
  categories: Category[];
  invites: ServerInvite[];
  unreadState: Record<string, UnreadState>;
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  categoryId: string;
}

export interface ServerInvite {
  code: string;
  serverId: string;
  creatorId: string;
  expiresAt?: Date;
  maxUses?: number;
  uses: number;
  server: Server;
}

interface ServersState {
  servers: Server[];
  createServer: (name: string, icon: string, ownerId: string) => Server;
  joinServer: (inviteCode: string, userId: string) => boolean;
  createInvite: (serverId: string, creatorId: string, maxUses?: number, expiresIn?: number) => ServerInvite;
  getServer: (serverId: string) => Server | undefined;
  updateServer: (serverId: string, updates: Partial<Server>) => void;
  deleteServer: (serverId: string) => void;
  addCategory: (serverId: string, name: string) => void;
  addChannel: (serverId: string, categoryId: string, name: string, type: 'text' | 'voice') => void;
  getUserServers: (userId: string) => Server[];
  toggleCategoryCollapse: (serverId: string, categoryId: string, userId: string) => void;
  hasUnreadMessages: (serverId: string, userId: string) => boolean;
  markChannelAsRead: (serverId: string, channelId: string, userId: string) => void;
  markChannelAsUnread: (serverId: string, channelId: string, userId: string) => void;
  getInvite: (code: string) => ServerInvite | undefined;
  hasUnreadChannel: (serverId: string, channelId: string, userId: string) => boolean;
}

export const useServers = create<ServersState>()(
  persist(
    (set, get) => ({
      servers: [],

      createServer: (name, icon, ownerId) => {
        const newServer: Server = {
          id: Date.now().toString(),
          name,
          icon,
          ownerId,
          members: [ownerId],
          admins: [ownerId],
          categories: [
            {
              id: 'general',
              name: 'General',
              channels: [
                { id: 'welcome', name: 'welcome', type: 'text', categoryId: 'general' },
                { id: 'general', name: 'general', type: 'text', categoryId: 'general' }
              ],
              collapsed: {}
            }
          ],
          invites: [],
          unreadState: {
            [ownerId]: {
              welcome: { lastRead: Date.now(), hasUnread: false },
              general: { lastRead: Date.now(), hasUnread: false }
            }
          }
        };

        set((state) => ({
          servers: [...state.servers, newServer]
        }));

        return newServer;
      },

      updateServer: (serverId, updates) => {
        set((state) => ({
          servers: state.servers.map(server => 
            server.id === serverId ? { ...server, ...updates } : server
          )
        }));
      },

      deleteServer: (serverId) => {
        set((state) => ({
          servers: state.servers.filter(s => s.id !== serverId)
        }));
      },

      joinServer: (inviteCode, userId) => {
        const server = get().servers.find(s => 
          s.invites.some(i => i.code === inviteCode)
        );

        if (!server || server.members.includes(userId)) {
          return false;
        }

        set((state) => ({
          servers: state.servers.map(s => {
            if (s.id === server.id) {
              const unreadState = { ...s.unreadState };
              unreadState[userId] = {};
              s.categories.forEach(category => {
                category.channels.forEach(channel => {
                  unreadState[userId][channel.id] = {
                    lastRead: Date.now(),
                    hasUnread: false
                  };
                });
              });

              return {
                ...s,
                members: [...s.members, userId],
                unreadState,
                invites: s.invites.map(i => {
                  if (i.code === inviteCode) {
                    return { ...i, uses: i.uses + 1 };
                  }
                  return i;
                })
              };
            }
            return s;
          })
        }));

        return true;
      },

      createInvite: (serverId, creatorId, maxUses, expiresIn) => {
        const server = get().getServer(serverId);
        if (!server) throw new Error('Server not found');

        const invite: ServerInvite = {
          code: Math.random().toString(36).substring(2, 10),
          serverId,
          creatorId,
          uses: 0,
          maxUses,
          expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : undefined,
          server
        };

        set((state) => ({
          servers: state.servers.map(s => {
            if (s.id === serverId) {
              return {
                ...s,
                invites: [...s.invites, invite]
              };
            }
            return s;
          })
        }));

        return invite;
      },

      getServer: (serverId) => {
        return get().servers.find(s => s.id === serverId);
      },

      addCategory: (serverId, name) => {
        set((state) => ({
          servers: state.servers.map(s => {
            if (s.id === serverId) {
              const newCategory: Category = {
                id: Date.now().toString(),
                name,
                channels: [],
                collapsed: {}
              };
              return {
                ...s,
                categories: [...s.categories, newCategory]
              };
            }
            return s;
          })
        }));
      },

      addChannel: (serverId, categoryId, name, type) => {
        set((state) => ({
          servers: state.servers.map(s => {
            if (s.id === serverId) {
              const newChannel: Channel = {
                id: Date.now().toString(),
                name,
                type,
                categoryId
              };

              const unreadState = { ...s.unreadState };
              s.members.forEach(memberId => {
                if (!unreadState[memberId]) {
                  unreadState[memberId] = {};
                }
                unreadState[memberId][newChannel.id] = {
                  lastRead: Date.now(),
                  hasUnread: false
                };
              });

              return {
                ...s,
                categories: s.categories.map(c => {
                  if (c.id === categoryId) {
                    return {
                      ...c,
                      channels: [...c.channels, newChannel]
                    };
                  }
                  return c;
                }),
                unreadState
              };
            }
            return s;
          })
        }));
      },

      getUserServers: (userId) => {
        return get().servers.filter(s => s.members.includes(userId));
      },

      toggleCategoryCollapse: (serverId, categoryId, userId) => {
        set((state) => ({
          servers: state.servers.map(s => {
            if (s.id === serverId) {
              return {
                ...s,
                categories: s.categories.map(c => {
                  if (c.id === categoryId) {
                    return {
                      ...c,
                      collapsed: {
                        ...c.collapsed,
                        [userId]: !c.collapsed[userId]
                      }
                    };
                  }
                  return c;
                })
              };
            }
            return s;
          })
        }));
      },

      hasUnreadMessages: (serverId, userId) => {
        const server = get().getServer(serverId);
        if (!server?.unreadState?.[userId]) return false;

        return Object.values(server.unreadState[userId]).some(
          channelState => channelState.hasUnread
        );
      },

      hasUnreadChannel: (serverId, channelId, userId) => {
        const server = get().getServer(serverId);
        return server?.unreadState?.[userId]?.[channelId]?.hasUnread || false;
      },

      markChannelAsRead: (serverId, channelId, userId) => {
        set((state) => ({
          servers: state.servers.map(s => {
            if (s.id === serverId && s.unreadState?.[userId]) {
              return {
                ...s,
                unreadState: {
                  ...s.unreadState,
                  [userId]: {
                    ...s.unreadState[userId],
                    [channelId]: {
                      lastRead: Date.now(),
                      hasUnread: false
                    }
                  }
                }
              };
            }
            return s;
          })
        }));
      },

      markChannelAsUnread: (serverId, channelId, userId) => {
        set((state) => ({
          servers: state.servers.map(s => {
            if (s.id === serverId && s.unreadState?.[userId]) {
              return {
                ...s,
                unreadState: {
                  ...s.unreadState,
                  [userId]: {
                    ...s.unreadState[userId],
                    [channelId]: {
                      lastRead: Date.now(),
                      hasUnread: true
                    }
                  }
                }
              };
            }
            return s;
          })
        }));
      },

      getInvite: (code) => {
        for (const server of get().servers) {
          const invite = server.invites.find(i => i.code === code);
          if (invite) {
            return { ...invite, server };
          }
        }
        return undefined;
      }
    }),
    {
      name: 'discord-servers',
      version: 1
    }
  )
);