import React, { useState, useRef } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import { useServers } from '../store/servers';

interface CreateServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onServerCreated: (serverId: string) => void;
}

export default function CreateServerModal({
  isOpen,
  onClose,
  currentUserId,
  onServerCreated
}: CreateServerModalProps) {
  const [serverName, setServerName] = useState("");
  const [serverIcon, setServerIcon] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createServer } = useServers();

  if (!isOpen) return null;

  const handleIconSelect = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setServerIcon(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = () => {
    if (!serverName.trim()) return;

    const server = createServer(
      serverName.trim(),
      serverIcon || "https://cdn.discordapp.com/embed/avatars/0.png",
      currentUserId
    );

    onServerCreated(server.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#313338] w-[440px] rounded-md overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Customize Your Server</h2>
            <button
              onClick={onClose}
              className="text-[#b5bac1] hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-[#b5bac1] text-sm mb-6">
            Give your new server a personality with a name and an icon. You can always change it later.
          </p>

          <div className="flex justify-center mb-6">
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && handleIconSelect(e.target.files[0])}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-[100px] h-[100px] rounded-full bg-[#1e1f22] flex items-center justify-center group relative overflow-hidden"
              >
                {serverIcon ? (
                  <img
                    src={serverIcon}
                    alt="Server icon"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-[#b5bac1] group-hover:text-white" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-[#b5bac1] uppercase mb-2">
              Server Name
            </label>
            <input
              type="text"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              className="w-full px-3 py-2 bg-[#1e1f22] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
              placeholder="Enter server name"
            />
          </div>

          <p className="text-[#949ba4] text-xs mb-6">
            By creating a server, you agree to Discord's Community Guidelines.
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white hover:underline"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={!serverName.trim()}
              className="px-4 py-2 bg-[#5865f2] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4752c4]"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}