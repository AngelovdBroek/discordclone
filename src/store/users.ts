import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'blocked';
  timestamp: Date;
}

export interface User {
  id: string;
  displayName: string;
  username: string;
  discriminator: string;
  email: string;
  avatar?: string;
  bio?: string;
  banner?: string;
  accentColor?: string;
  effect?: string | null;
  decoration?: string | null;
  memberSince: Date;
  status?: 'online' | 'idle' | 'dnd' | 'offline';
}

interface UsersState {
  users: User[];
  friendRequests: FriendRequest[];
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  getUser: (userId: string) => User | undefined;
  getAllUsers: () => User[];
  sendFriendRequest: (senderId: string, receiverId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  blockUser: (userId: string, blockedId: string) => void;
  unblockUser: (userId: string, blockedId: string) => void;
  getFriendRequests: (userId: string) => FriendRequest[];
  getFriends: (userId: string) => string[];
  getBlockedUsers: (userId: string) => string[];
  areFriends: (userId1: string, userId2: string) => boolean;
  hasPendingRequest: (senderId: string, receiverId: string) => boolean;
}

// Migration function to handle state updates
const migrate = (persistedState: any, version: number) => {
  switch (version) {
    case 0:
      return {
        ...persistedState,
        users: persistedState.users.map((user: any) => ({
          ...user,
          memberSince: new Date(user.memberSince),
          effect: user.effect || null,
          decoration: user.decoration || null
        })),
        friendRequests: persistedState.friendRequests.map((req: any) => ({
          ...req,
          timestamp: new Date(req.timestamp)
        }))
      };
    default:
      return persistedState;
  }
};

export const useUsers = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],
      friendRequests: [],
      
      addUser: (user) => {
        set((state) => ({
          users: [...state.users, user]
        }));
      },

      updateUser: (userId, updates) => {
        set((state) => ({
          users: state.users.map(user => 
            user.id === userId ? { ...user, ...updates } : user
          )
        }));
      },

      deleteUser: (userId) => {
        set((state) => ({
          users: state.users.filter(user => user.id !== userId),
          friendRequests: state.friendRequests.filter(req => 
            req.senderId !== userId && req.receiverId !== userId
          )
        }));
      },

      getUser: (userId) => {
        return get().users.find(user => user.id === userId);
      },

      getAllUsers: () => {
        return get().users;
      },

      sendFriendRequest: (senderId, receiverId) => {
        const existingRequest = get().friendRequests.find(req => 
          (req.senderId === senderId && req.receiverId === receiverId) ||
          (req.senderId === receiverId && req.receiverId === senderId)
        );

        if (!existingRequest) {
          set((state) => ({
            friendRequests: [...state.friendRequests, {
              id: Date.now().toString(),
              senderId,
              receiverId,
              status: 'pending',
              timestamp: new Date()
            }]
          }));
        }
      },

      acceptFriendRequest: (requestId) => {
        set((state) => ({
          friendRequests: state.friendRequests.map(req =>
            req.id === requestId ? { ...req, status: 'accepted' } : req
          )
        }));
      },

      rejectFriendRequest: (requestId) => {
        set((state) => ({
          friendRequests: state.friendRequests.filter(req => req.id !== requestId)
        }));
      },

      blockUser: (userId, blockedId) => {
        set((state) => ({
          friendRequests: [
            ...state.friendRequests.filter(req => 
              !(req.senderId === userId && req.receiverId === blockedId) &&
              !(req.senderId === blockedId && req.receiverId === userId)
            ),
            {
              id: Date.now().toString(),
              senderId: userId,
              receiverId: blockedId,
              status: 'blocked',
              timestamp: new Date()
            }
          ]
        }));
      },

      unblockUser: (userId, blockedId) => {
        set((state) => ({
          friendRequests: state.friendRequests.filter(req => 
            !(req.senderId === userId && req.receiverId === blockedId && req.status === 'blocked')
          )
        }));
      },

      getFriendRequests: (userId) => {
        return get().friendRequests.filter(req => 
          (req.receiverId === userId || req.senderId === userId) &&
          req.status === 'pending'
        );
      },

      getFriends: (userId) => {
        const acceptedRequests = get().friendRequests.filter(req => 
          req.status === 'accepted' &&
          (req.senderId === userId || req.receiverId === userId)
        );

        return acceptedRequests.map(req => 
          req.senderId === userId ? req.receiverId : req.senderId
        );
      },

      getBlockedUsers: (userId) => {
        return get().friendRequests
          .filter(req => req.senderId === userId && req.status === 'blocked')
          .map(req => req.receiverId);
      },

      areFriends: (userId1, userId2) => {
        return get().friendRequests.some(req =>
          req.status === 'accepted' &&
          ((req.senderId === userId1 && req.receiverId === userId2) ||
           (req.senderId === userId2 && req.receiverId === userId1))
        );
      },

      hasPendingRequest: (senderId, receiverId) => {
        return get().friendRequests.some(req =>
          req.status === 'pending' &&
          ((req.senderId === senderId && req.receiverId === receiverId) ||
           (req.senderId === receiverId && req.receiverId === senderId))
        );
      }
    }),
    {
      name: 'discord-users',
      version: 1,
      migrate
    }
  )
);