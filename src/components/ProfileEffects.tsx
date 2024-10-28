import React from 'react';

interface Effect {
  id: string;
  name: string;
  cssClass: string;
  description: string;
}

interface ProfileEffectsProps {
  selectedEffect: string | null;
  onSelectEffect: (effectId: string | null) => void;
  type: 'effect' | 'decoration';
}

const effects: Effect[] = [
  {
    id: 'profile-effect-flame',
    name: 'Flame',
    cssClass: 'profile-effect-flame',
    description: 'Burning with intensity'
  },
  {
    id: 'profile-effect-neon',
    name: 'Neon Pulse',
    cssClass: 'profile-effect-neon',
    description: 'Vibrant neon waves'
  },
  {
    id: 'profile-effect-matrix',
    name: 'Matrix Rain',
    cssClass: 'profile-effect-matrix',
    description: 'Digital rain effect'
  },
  {
    id: 'profile-effect-rainbow',
    name: 'Rainbow Flow',
    cssClass: 'profile-effect-rainbow',
    description: 'Flowing rainbow colors'
  },
  {
    id: 'profile-effect-cosmic',
    name: 'Cosmic Dust',
    cssClass: 'profile-effect-cosmic',
    description: 'Sparkling cosmic effect'
  }
];

const decorations: Effect[] = [
  {
    id: 'avatar-decoration-azure',
    name: 'Azure Ring',
    cssClass: 'avatar-decoration-azure',
    description: 'Glowing blue ring'
  },
  {
    id: 'avatar-decoration-rainbow',
    name: 'Rainbow Border',
    cssClass: 'avatar-decoration-rainbow',
    description: 'Spinning rainbow border'
  },
  {
    id: 'avatar-decoration-pixel',
    name: 'Pixel Frame',
    cssClass: 'avatar-decoration-pixel',
    description: 'Pixelated border effect'
  }
];

export default function ProfileEffects({ selectedEffect, onSelectEffect, type }: ProfileEffectsProps) {
  const items = type === 'effect' ? effects : decorations;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#313338] w-[600px] rounded-lg">
        <div className="p-4 border-b border-[#1e1f22]">
          <h2 className="text-xl font-semibold text-white">
            {type === 'effect' ? 'Add Profile Effect' : 'Change Avatar Decoration'}
          </h2>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <h3 className="text-[#b5bac1] text-xs font-semibold mb-2">YOUR {type === 'effect' ? 'EFFECTS' : 'DECORATIONS'}</h3>
            <div className="grid grid-cols-2 gap-2">
              <div 
                className={`bg-[#1e1f22] rounded p-3 flex items-center justify-center cursor-pointer ${
                  !selectedEffect ? 'ring-2 ring-[#5865f2]' : ''
                }`}
                onClick={() => onSelectEffect(null)}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="w-4 h-0.5 bg-[#b5bac1] transform rotate-45"></div>
                </div>
                <span className="ml-2 text-white">None</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[#b5bac1] text-xs font-semibold mb-2">AVAILABLE {type === 'effect' ? 'EFFECTS' : 'DECORATIONS'}</h3>
            <div className="grid grid-cols-3 gap-3">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className={`group relative cursor-pointer ${
                    selectedEffect === item.id ? 'ring-2 ring-[#5865f2]' : ''
                  }`}
                  onClick={() => onSelectEffect(item.id)}
                >
                  <div className="aspect-square bg-[#1e1f22] rounded-lg overflow-hidden">
                    <div className={`w-full h-full ${item.cssClass}`}></div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                      <p className="text-white text-sm font-medium">{item.name}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/40 flex items-center justify-center transition-opacity">
                    <div className="bg-black/80 text-white text-sm p-2 rounded">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#1e1f22] flex justify-end">
          <button
            onClick={() => onSelectEffect(selectedEffect)}
            className="px-4 py-2 bg-[#5865f2] text-white rounded hover:bg-[#4752c4]"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}