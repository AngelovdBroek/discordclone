// import React, { useState } from 'react';
// import { X, Copy, RefreshCw, Search, Users } from 'lucide-react';
// import { useServers } from '../store/servers';
// import { useUsers, User } from '../store/users';
// import { useMessages } from '../store/messages';

// interface ServerInviteModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   serverId: string;
//   currentUserId: string;
// }

// export default function ServerInviteModal({
//   isOpen,
//   onClose,
//   serverId,
//   currentUserId
// }: ServerInviteModalProps) {
//   const [inviteLink, setInviteLink] = useState('');
//   const [copied, setCopied] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedTab, setSelectedTab] = useState<'link' | 'friends'>('friends');
  
//   const { createInvite, getServer } = useServers();
//   const { getAllUsers, getFriends } = useUsers();
//   const { addMessage } = useMessages();

//   if (!isOpen) return null;

//   const server = getServer(serverId);
//   if (!server) return null;

//   const generateInvite = () => {
//     const invite = createInvite(serverId, currentUserId);
//     const inviteUrl = `${window.location.origin}/invite/${invite.code}`;
//     setInviteLink(inviteUrl);
//     setCopied(false);
//     return invite.code;
//   };

//   const copyInvite = async () => {
//     try {
//       await navigator.clipboard.writeText(inviteLink);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch (err) {
//       console.error('Failed to copy:', err);
//     }
//   };

//   const sendInvite = (friend: User) => {
//     const code = generateInvite();
//     addMessage({
//       content: `Hey! I've invited you to join ${server.name}!`,
//       senderId: currentUserId,
//       receiverId: friend.id,
//       serverInvite: {
//         code,
//         serverId: server.id,
//         serverName: server.name,
//         serverIcon: server.icon,
//         inviterId: currentUserId
//       }
//     });
//   };

//   const friends = getFriends(currentUserId)
//     .map(id => getAllUsers().find(u => u.id === id))
//     .filter((friend): friend is User => 
//       friend !== undefined && 
//       !server.members.includes(friend.id) &&
//       friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//   return (
//     <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
//       <div className="bg-[#313338] w-[440px] rounded-md overflow-hidden">
//         <div className="p-4">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-bold text-white">Invite Friends to {server.name}</h2>
//             <button
//               onClick={onClose}
//               className="text-[#b5bac1] hover:text-white"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>

//           <div className="flex gap-2 mb-4">
//             <button
//               onClick={() => setSelectedTab('friends')}
//               className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 ${
//                 selectedTab === 'friends'
//                   ? 'bg-[#404249] text-white'
//                   : 'text-[#b5bac1] hover:bg-[#35373c] hover:text-white'
//               }`}
//             >
//               <Users className="w-5 h-5" />
//               Send to Friends
//             </button>
//             <button
//               onClick={() => setSelectedTab('link')}
//               className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 ${
//                 selectedTab === 'link'
//                   ? 'bg-[#404249] text-white'
//                   : 'text-[#b5bac1] hover:bg-[#35373c] hover:text-white'
//               }`}
//             >
//               <Copy className="w-5 h-5" />
//               Copy Link
//             </button>
//           </div>

//           {selectedTab === 'friends' ? (
//             <>
//               <div className="relative mb-4">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b5bac1]" />
//                 <input
//                   type="text"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Search friends"
//                   className="w-full pl-10 pr-3 py-2 bg-[#1e1f22] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
//                 />
//               </div>

//               <div className="max-h-[300px] overflow-y-auto">
//                 {friends.length === 0 ? (
//                   <div className="text-center py-8 text-[#949ba4]">
//                     {searchQuery ? 'No friends found' : 'No friends to invite'}
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     {friends.map(friend => (
//                       <div
//                         key={friend.id}
//                         className="flex items-center justify-between p-2 hover:bg-[#35373c] rounded"
//                       >
//                         <div className="flex items-center gap-3">
//                           <img
//                             src={friend.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
//                             alt={friend.displayName}
//                             className="w-8 h-8 rounded-full"
//                           />
//                           <div>
//                             <p className="text-white font-medium">{friend.displayName}</p>
//                             <p className="text-[#949ba4] text-sm">
//                               {friend.username}#{friend.discriminator}
//                             </p>
//                           </div>
//                         </div>
//                         <button
//                           onClick={() => {
//                             sendInvite(friend);
//                             onClose();
//                           }}
//                           className="px-4 py-1.5 bg-[#5865f2] text-white rounded hover:bg-[#4752c4]"
//                         >
//                           Invite
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </>
//           ) : (
//             <>
//               <p className="text-[#b5bac1] text-sm mb-6">
//                 Share this link with others to grant them access to this server.
//               </p>

//               <div className="mb-6">
//                 <div className="flex gap-2">
//                   <div className="flex-1 relative">
//                     <input
//                       type="text"
//                       value={inviteLink}
//                       readOnly
//                       placeholder="Click generate to create an invite link"
//                       className="w-full px-3 py-2 bg-[#1e1f22] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
//                     />
//                   </div>
//                   {inviteLink ? (
//                     <button
//                       onClick={copyInvite}
//                       className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
//                         copied 
//                           ? 'bg-[#3ba55c] text-white' 
//                           : 'bg-[#5865f2] text-white hover:bg-[#4752c4]'
//                       }`}
//                     >
//                       {copied ? (
//                         <>
//                           Copied!
//                           <Copy className="w-4 h-4" />
//                         </>
//                       ) : (
//                         <>
//                           Copy
//                           <Copy className="w-4 h-4" />
//                         </>
//                       )}
//                     </button>
//                   ) : (
//                     <button
//                       onClick={generateInvite}
//                       className="px-4 py-2 bg-[#5865f2] text-white rounded hover:bg-[#4752c4] flex items-center gap-2"
//                     >
//                       Generate
//                       <RefreshCw className="w-4 h-4" />
//                     </button>
//                   )}
//                 </div>
//               </div>

//               <div className="text-[#949ba4] text-sm">
//                 Your invite link expires in 24 hours.
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }





import React, { useState, useEffect } from 'react';
import { X, Copy, RefreshCw, Search, Users } from 'lucide-react';
import { useServers } from '../store/servers';
import { useUsers, User } from '../store/users';
import { useMessages } from '../store/messages';

interface ServerInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  currentUserId: string;
}

export default function ServerInviteModal({
  isOpen,
  onClose,
  serverId,
  currentUserId
}: ServerInviteModalProps) {
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'link' | 'friends'>('friends');
  
  const { createInvite, getServer } = useServers();
  const { getAllUsers, getFriends } = useUsers();
  const { addMessage } = useMessages();

  if (!isOpen) return null;

  const server = getServer(serverId);
  if (!server) return null;

  const generateInvite = () => {
    const invite = createInvite(serverId, currentUserId);
    const inviteUrl = `${window.location.origin}/invite/${invite.code}`;
    setInviteLink(inviteUrl);
    setCopied(false);
    return invite.code;
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const sendInvite = (friend: User) => {
    const code = generateInvite();
    addMessage({
      content: `Hey! I've invited you to join ${server.name}!`,
      senderId: currentUserId,
      receiverId: friend.id,
      serverInvite: {
        code,
        serverId: server.id,
        serverName: server.name,
        serverIcon: server.icon,
        inviterId: currentUserId
      }
    });
  };

  const friends = getFriends(currentUserId)
    .map(id => getAllUsers().find(u => u.id === id))
    .filter((friend): friend is User => 
      friend !== undefined && 
      !server.members.includes(friend.id) &&
      friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#313338] w-[440px] rounded-md overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Invite Friends to {server.name}</h2>
            <button
              onClick={onClose}
              className="text-[#b5bac1] hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedTab('friends')}
              className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 ${
                selectedTab === 'friends'
                  ? 'bg-[#404249] text-white'
                  : 'text-[#b5bac1] hover:bg-[#35373c] hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              Send to Friends
            </button>
            <button
              onClick={() => setSelectedTab('link')}
              className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 ${
                selectedTab === 'link'
                  ? 'bg-[#404249] text-white'
                  : 'text-[#b5bac1] hover:bg-[#35373c] hover:text-white'
              }`}
            >
              <Copy className="w-5 h-5" />
              Copy Link
            </button>
          </div>
          {selectedTab === 'friends' ? (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b5bac1]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search friends"
                  className="w-full pl-10 pr-3 py-2 bg-[#1e1f22] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {friends.length === 0 ? (
                  <div className="text-center py-8 text-[#949ba4]">
                    {searchQuery ? 'No friends found' : 'No friends to invite'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friends.map(friend => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between p-2 hover:bg-[#35373c] rounded"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={friend.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                            alt={friend.displayName}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="text-white font-medium">{friend.displayName}</p>
                            <p className="text-[#949ba4] text-sm">
                              {friend.username}#{friend.discriminator}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            sendInvite(friend);
                            onClose();
                          }}
                          className="px-4 py-1.5 bg-[#5865f2] text-white rounded hover:bg-[#4752c4]"
                        >
                          Invite
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-[#b5bac1] text-sm mb-6">
                Share this link with others to grant them access to this server.
              </p>
              <div className="mb-6">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inviteLink}
                      readOnly
                      placeholder="Click generate to create an invite link"
                      className="w-full px-3 py-2 bg-[#1e1f22] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                    />
                  </div>
                  {inviteLink ? (
                    <button
                      onClick={copyInvite}
                      className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                        copied 
                          ? 'bg-[#3ba55c] text-white'
                          : 'bg-[#5865f2] text-white hover:bg-[#4752c4]'
                      }`}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                      <Copy className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={generateInvite}
                      className="px-4 py-2 bg-[#5865f2] text-white rounded hover:bg-[#4752c4]"
                    >
                      Generate
                      <RefreshCw className="w-5 h-5 ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}