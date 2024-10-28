import React, { useState, useRef, useEffect } from 'react';
import { ProfilePreview } from './ProfilePreview';
import FullProfileView from './FullProfileView';
import { User } from '../store/users';
import { useServers } from '../store/servers';

interface MembersListProps {
  serverId?: string;
  members?: User[];
  onMemberClick?: (member: User) => void;
  onStartDM?: (user: User) => void;
  currentUserId: string;
  onOpenSettings?: () => void;
}

const MembersList = ({ 
  serverId,
  members = [], 
  onMemberClick, 
  onStartDM,
  currentUserId,
  onOpenSettings
}: MembersListProps) => {
  const [previewMember, setPreviewMember] = useState<User | null>(null);
  const [fullProfileMember, setFullProfileMember] = useState<User | null>(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const { getServer } = useServers();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
        setPreviewMember(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMemberClick = (member: User, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const previewWidth = 340;
    const previewHeight = 400;
    
    let x = rect.left - previewWidth - 10;
    let y = rect.top;
    
    if (x < 10) x = rect.right + 10;
    
    const maxY = window.innerHeight - previewHeight;
    y = Math.min(y, maxY);
    if (y < 10) y = 10;
    
    if (previewMember?.id === member.id) {
      setPreviewMember(null);
    } else {
      setPreviewMember(member);
      setPreviewPosition({ x, y });
    }
  };

  const handleShowFullProfile = (member: User) => {
    if (member.id === currentUserId && onOpenSettings) {
      onOpenSettings();
    } else {
      setFullProfileMember(member);
    }
    setPreviewMember(null);
  };

  const handleMessageClick = (member: User) => {
    if (member.id !== currentUserId && onStartDM) {
      onStartDM(member);
      setFullProfileMember(null);
      setPreviewMember(null);
    }
  };

  // Get server-specific members if serverId is provided
  let displayMembers = members;
  if (serverId) {
    const server = getServer(serverId);
    if (server) {
      displayMembers = members.filter(member => server.members.includes(member.id));
    } else {
      displayMembers = [];
    }
  }

  // Sort members: online users first, then offline users
  const sortedMembers = [...displayMembers].sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    if (a.status === 'online' && b.status !== 'online') return -1;
    if (a.status !== 'online' && b.status === 'online') return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  // Group members by status
  const onlineMembers = sortedMembers.filter(m => m.status === 'online');
  const offlineMembers = sortedMembers.filter(m => m.status !== 'online');

  const renderMemberItem = (member: User, isOnline: boolean) => (
    <div
      key={member.id}
      onClick={(e) => handleMemberClick(member, e)}
      className="member-item flex items-center gap-3 p-2 rounded hover:bg-[#35373c] cursor-pointer group"
    >
      <div className="relative flex-shrink-0">
        {member.effect && (
          <div className={`absolute inset-[-4px] rounded-full ${member.effect} z-0`} />
        )}
        <div className="relative z-10">
          <img
            src={member.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
            alt={member.displayName}
            className="w-8 h-8 rounded-full"
          />
          {member.decoration && (
            <div className={`absolute inset-[-2px] rounded-full ${member.decoration} z-20`} />
          )}
        </div>
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#2b2d31] z-30 ${
          member.status === 'online' ? 'bg-green-500' :
          member.status === 'idle' ? 'bg-yellow-500' :
          member.status === 'dnd' ? 'bg-red-500' : 'bg-gray-500'
        }`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-[#f3f4f5] text-sm font-medium group-hover:text-white truncate ${
          member.id === currentUserId ? 'font-bold' : ''
        }`}>
          {member.displayName}
          {member.id === currentUserId && ' (you)'}
        </p>
        <p className="text-[#b5bac1] text-xs truncate">
          {member.username}#{member.discriminator}
        </p>
      </div>
    </div>
  );

  if (!serverId || !getServer(serverId)) {
    return null;
  }

  return (
    <div className="w-60 bg-[#2b2d31] p-4">
      <h2 className="text-[#b5bac1] text-xs font-semibold mb-4 uppercase">
        Members — {displayMembers.length}
      </h2>

      {onlineMembers.length > 0 && (
        <div className="mb-4">
          <h3 className="text-[#b5bac1] text-xs font-semibold mb-2 uppercase">
            Online — {onlineMembers.length}
          </h3>
          <div className="space-y-1">
            {onlineMembers.map(member => renderMemberItem(member, true))}
          </div>
        </div>
      )}

      {offlineMembers.length > 0 && (
        <div>
          <h3 className="text-[#b5bac1] text-xs font-semibold mb-2 uppercase">
            Offline — {offlineMembers.length}
          </h3>
          <div className="space-y-1">
            {offlineMembers.map(member => renderMemberItem(member, false))}
          </div>
        </div>
      )}

      {previewMember && (
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
            user={previewMember}
            onShowFullProfile={() => handleShowFullProfile(previewMember)}
            onMessageClick={() => handleMessageClick(previewMember)}
            currentUserId={currentUserId}
            onClose={() => setPreviewMember(null)}
          />
        </div>
      )}

      {fullProfileMember && (
        <FullProfileView 
          user={fullProfileMember}
          onClose={() => setFullProfileMember(null)}
          onMessageClick={() => handleMessageClick(fullProfileMember)}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default MembersList;