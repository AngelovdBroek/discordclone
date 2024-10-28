import React, { useState, useRef } from 'react';
import { X, Upload, Trash2, UserPlus, Shield } from 'lucide-react';
import { Server, useServers } from '../store/servers';
import { useUsers } from '../store/users';

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server;
  onUpdateServer: (serverId: string, updates: Partial<Server>) => void;
}

export default function ServerSettingsModal({
  isOpen,
  onClose,
  server,
  onUpdateServer
}: ServerSettingsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [serverName, setServerName] = useState(server.name);
  const [serverIcon, setServerIcon] = useState(server.icon);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [admins, setAdmins] = useState<string[]>(server.admins || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { updateServer, deleteServer } = useServers();
  const { getAllUsers } = useUsers();

  const allUsers = getAllUsers();

  if (!isOpen) return null;

  const handleIconSelect = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setServerIcon(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!serverName.trim()) return;

    updateServer(server.id, {
      name: serverName.trim(),
      icon: serverIcon,
      admins
    });
    onClose();
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteServer(server.id);
      onClose();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const toggleAdmin = (userId: string) => {
    if (admins.includes(userId)) {
      setAdmins(admins.filter(id => id !== userId));
    } else {
      setAdmins([...admins, userId]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#313338] w-[800px] h-[85vh] rounded-lg flex">
        <div className="w-[232px] p-4 bg-[#2b2d31] rounded-l-lg">
          <button
            className={`w-full text-left px-2.5 py-1.5 rounded ${
              activeTab === 'overview'
                ? 'bg-[#404249] text-white'
                : 'text-[#b5bac1] hover:bg-[#35373c] hover:text-white'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`w-full text-left px-2.5 py-1.5 rounded ${
              activeTab === 'roles'
                ? 'bg-[#404249] text-white'
                : 'text-[#b5bac1] hover:bg-[#35373c] hover:text-white'
            }`}
            onClick={() => setActiveTab('roles')}
          >
            Roles
          </button>
          <div className="mt-auto pt-4 border-t border-[#1e1f22]">
            <button
              onClick={handleDelete}
              className={`w-full px-2.5 py-1.5 rounded text-[#ed4245] hover:bg-[#ed4245] hover:text-white flex items-center gap-2`}
            >
              <Trash2 className="w-4 h-4" />
              Delete Server
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 relative overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-[#b5bac1] hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>

          {activeTab === 'overview' ? (
            <div>
              <h2 className="text-white text-xl font-semibold mb-6">Server Overview</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[#b5bac1] text-xs font-semibold mb-2">
                    SERVER NAME
                  </label>
                  <input
                    type="text"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className="w-full bg-[#1e1f22] text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                  />
                </div>

                <div>
                  <label className="block text-[#b5bac1] text-xs font-semibold mb-2">
                    SERVER ICON
                  </label>
                  <div className="flex items-center gap-4">
                    <img
                      src={serverIcon}
                      alt={serverName}
                      className="w-20 h-20 rounded-full"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => e.target.files?.[0] && handleIconSelect(e.target.files[0])}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-[#5865f2] text-white rounded hover:bg-[#4752c4] flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Change Icon
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full bg-[#5865f2] text-white px-4 py-2 rounded hover:bg-[#4752c4]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : activeTab === 'roles' ? (
            <div>
              <h2 className="text-white text-xl font-semibold mb-6">Server Roles</h2>
              
              <div className="space-y-4">
                {server.members.map(memberId => {
                  const member = allUsers.find(u => u.id === memberId);
                  if (!member) return null;

                  const isAdmin = admins.includes(memberId);
                  const isOwner = server.ownerId === memberId;

                  return (
                    <div key={memberId} className="flex items-center justify-between p-3 bg-[#2b2d31] rounded">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                          alt={member.displayName}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="text-white font-medium">{member.displayName}</p>
                          <p className="text-[#b5bac1] text-sm">
                            {member.username}#{member.discriminator}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOwner ? (
                          <div className="px-2 py-1 bg-[#5865f2] text-white rounded-full flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            Owner
                          </div>
                        ) : (
                          <button
                            onClick={() => toggleAdmin(memberId)}
                            className={`px-2 py-1 rounded-full flex items-center gap-1 ${
                              isAdmin 
                                ? 'bg-[#3ba55c] text-white' 
                                : 'bg-[#4f545c] text-[#b5bac1] hover:bg-[#5865f2] hover:text-white'
                            }`}
                          >
                            <Shield className="w-4 h-4" />
                            Admin
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}