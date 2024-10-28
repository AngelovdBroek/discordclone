import React, { useState, useEffect } from 'react';
import { X, LogOut, AlertTriangle, Volume2, Mic, Headphones } from 'lucide-react';
import ProfileEffects from './ProfileEffects';
import CompactProfilePreview from './CompactProfilePreview';
import VoiceSettings from './VoiceSettings';

interface User {
  displayName: string;
  discriminator: string;
  avatar: string;
  banner: string;
  bio: string;
  effect: string | null;
  decoration: string | null;
  memberSince: Date;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (updates: Partial<User>) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  onDeleteAccount,
}) => {
  const [activeTab, setActiveTab] = useState('user-profile');
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || '');
  const [showEffectsModal, setShowEffectsModal] = useState(false);
  const [effectType, setEffectType] = useState<'effect' | 'decoration'>('effect');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onUpdateUser({
      displayName,
      bio,
    });
    onClose();
  };

  const handleFileSelect = (type: 'avatar' | 'banner') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          onUpdateUser({ [type]: dataUrl });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const openEffectsModal = (type: 'effect' | 'decoration') => {
    setEffectType(type);
    setShowEffectsModal(true);
  };

  const handleDeleteAccount = () => {
    if (showDeleteConfirm) {
      onDeleteAccount();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#313338] w-full max-w-[900px] h-[85vh] rounded-lg flex">
        <div className="w-[232px] p-4 bg-[#2b2d31] rounded-l-lg flex flex-col">
          <button
            className={`w-full text-left px-2.5 py-1.5 rounded ${
              activeTab === 'user-profile'
                ? 'bg-[#404249] text-white'
                : 'text-[#b5bac1] hover:bg-[#35373c] hover:text-white'
            }`}
            onClick={() => setActiveTab('user-profile')}
          >
            User Profile
          </button>
          <button
            className={`w-full text-left px-2.5 py-1.5 rounded ${
              activeTab === 'voice'
                ? 'bg-[#404249] text-white'
                : 'text-[#b5bac1] hover:bg-[#35373c] hover:text-white'
            }`}
            onClick={() => setActiveTab('voice')}
          >
            Voice & Video
          </button>
          
          <div className="mt-auto space-y-2">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[#ed4245] hover:bg-[#ed4245] hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
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

          {activeTab === 'user-profile' ? (
            <div className="flex gap-8">
              <div className="flex-1">
                <h2 className="text-white text-xl font-semibold mb-6">User Profile</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[#b5bac1] text-xs font-semibold mb-2">
                      DISPLAY NAME
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#1e1f22] text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#b5bac1] text-xs font-semibold mb-2">
                      ABOUT ME
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={190}
                      className="w-full h-[120px] bg-[#1e1f22] text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5865f2] resize-none"
                    />
                    <div className="text-[#b5bac1] text-xs text-right mt-1">
                      {bio.length}/190
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#b5bac1] text-xs font-semibold mb-2">
                      PROFILE CUSTOMIZATION
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openEffectsModal('effect')}
                        className="bg-[#5865f2] text-white px-4 py-2 rounded hover:bg-[#4752c4]"
                      >
                        Change Effect
                      </button>
                      <button
                        onClick={() => openEffectsModal('decoration')}
                        className="bg-[#5865f2] text-white px-4 py-2 rounded hover:bg-[#4752c4]"
                      >
                        Change Decoration
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleFileSelect('avatar')}
                      className="bg-[#5865f2] text-white px-4 py-2 rounded hover:bg-[#4752c4]"
                    >
                      Change Avatar
                    </button>
                    <button
                      onClick={() => handleFileSelect('banner')}
                      className="bg-[#5865f2] text-white px-4 py-2 rounded hover:bg-[#4752c4]"
                    >
                      Change Banner
                    </button>
                  </div>

                  <button
                    onClick={handleSave}
                    className="w-full bg-[#5865f2] text-white px-4 py-2 rounded hover:bg-[#4752c4]"
                  >
                    Save Changes
                  </button>

                  <div className="mt-8 pt-8 border-t border-[#1e1f22]">
                    <h3 className="text-[#ed4245] text-lg font-semibold mb-4">Delete Account</h3>
                    <div className="bg-[#1e1f22] rounded-md p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-[#ed4245] flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-white text-sm mb-2">
                            This will permanently delete your account and remove all your data.
                          </p>
                          <p className="text-[#b5bac1] text-sm">
                            This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className={`w-full px-4 py-2 rounded text-white transition-colors ${
                        showDeleteConfirm 
                          ? 'bg-[#ed4245] hover:bg-[#da373c]' 
                          : 'bg-[#2c2d31] hover:bg-[#ed4245]'
                      }`}
                    >
                      {showDeleteConfirm ? 'Click again to confirm deletion' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-[280px]">
                <h3 className="text-[#b5bac1] text-xs font-semibold mb-4">PREVIEW</h3>
                <CompactProfilePreview user={user} />
              </div>
            </div>
          ) : activeTab === 'voice' ? (
            <VoiceSettings />
          ) : null}
        </div>
      </div>

      {showEffectsModal && (
        <ProfileEffects
          selectedEffect={effectType === 'effect' ? user.effect : user.decoration}
          onSelectEffect={(effect) => {
            onUpdateUser({ [effectType]: effect });
            setShowEffectsModal(false);
          }}
          type={effectType}
        />
      )}
    </div>
  );
};

export default SettingsModal;