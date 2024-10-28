// import React from 'react';
// import { Mic, MicOff, Headphones, PhoneOff, Settings } from 'lucide-react';
// import { useVoice } from '../store/voice';
// import { useUsers } from '../store/users';

// interface VoiceControlsProps {
//   userId: string;
//   onLeave: () => void;
//   onOpenSettings: () => void;
// }

// export default function VoiceControls({ userId, onLeave, onOpenSettings }: VoiceControlsProps) {
//   const { toggleMute, toggleDeafen, getUserVoiceState } = useVoice();
//   const { getUser } = useUsers();
//   const voiceState = getUserVoiceState(userId);
//   const user = getUser(userId);

//   if (!voiceState || !user) return null;

//   return (
//     <div className="mt-auto h-[52px] bg-[#232428] px-2 flex items-center gap-2">
//       <div className="relative">
//         <img
//           src={user.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
//           alt={user.displayName}
//           className="w-8 h-8 rounded-full"
//         />
//         {voiceState.speaking && (
//           <div className="absolute inset-[-2px] border-2 border-[#3ba55c] rounded-full animate-pulse" />
//         )}
//         {user.decoration && (
//           <div className={`absolute inset-[-2px] rounded-full ${user.decoration} z-20`} />
//         )}
//         {user.effect && (
//           <div className={`absolute inset-[-4px] rounded-full ${user.effect} z-0`} />
//         )}
//       </div>
//       <div className="flex-1 min-w-0">
//         <div className="text-sm font-medium text-white truncate">{user.displayName}</div>
//         <div className="text-xs text-[#949ba4]">
//           {voiceState.speaking ? 'Speaking' : 'Voice Connected'}
//         </div>
//       </div>
//       <button
//         onClick={() => toggleMute(userId)}
//         className={`p-2 rounded-md ${
//           voiceState.muted ? 'bg-[#ed4245] text-white' : 'hover:bg-[#404249] text-[#b5bac1]'
//         }`}
//       >
//         {voiceState.muted ? (
//           <MicOff className="w-5 h-5" />
//         ) : (
//           <Mic className="w-5 h-5" />
//         )}
//       </button>
//       <button
//         onClick={() => toggleDeafen(userId)}
//         className={`p-2 rounded-md ${
//           voiceState.deafened ? 'bg-[#ed4245] text-white' : 'hover:bg-[#404249] text-[#b5bac1]'
//         }`}
//       >
//         {voiceState.deafened ? (
//           <PhoneOff className="w-5 h-5" />
//         ) : (
//           <Headphones className="w-5 h-5" />
//         )}
//       </button>
//       <button
//         onClick={onOpenSettings}
//         className="p-2 rounded-md hover:bg-[#404249] text-[#b5bac1]"
//       >
//         <Settings className="w-5 h-5" />
//       </button>
//       <button
//         onClick={onLeave}
//         className="px-3 py-1 bg-[#ed4245] text-white text-sm rounded hover:bg-[#c93b3e]"
//       >
//         Disconnect
//       </button>
//     </div>
//   );
// }




import React from 'react';
import { Mic, MicOff, Headphones, PhoneOff, Settings } from 'lucide-react';
import { useVoice } from '../store/voice';
import { useUsers } from '../store/users';

interface VoiceControlsProps {
  userId: string;
  onLeave: () => void;
  onOpenSettings: () => void;
}

export default function VoiceControls({ userId, onLeave, onOpenSettings }: VoiceControlsProps) {
  const { toggleMute, toggleDeafen, getUserVoiceState } = useVoice();
  const { getUser } = useUsers();
  const voiceState = getUserVoiceState(userId);
  const user = getUser(userId);

  if (!voiceState || !user) return null;

  return (
    <div className="mt-auto h-[52px] bg-[#232428] px-2 flex items-center gap-2">
      <div className="relative">
        <img
          src={user.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
          alt={user.displayName}
          className={`w-8 h-8 rounded-full ${voiceState.speaking ? 'ring-2 ring-[#3ba55c]' : ''}`}
        />
        {user.decoration && (
          <div className={`absolute inset-[-2px] rounded-full ${user.decoration} z-20`} />
        )}
        {user.effect && (
          <div className={`absolute inset-[-4px] rounded-full ${user.effect} z-0`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{user.displayName}</div>
        <div className="text-xs text-[#949ba4]">
          {voiceState.speaking ? 'Speaking' : 'Voice Connected'}
        </div>
      </div>
      <button
        onClick={() => toggleMute(userId)}
        className={`p-2 rounded-md ${
          voiceState.muted ? 'bg-[#ed4245] text-white' : 'hover:bg-[#404249] text-[#b5bac1]'
        }`}
      >
        {voiceState.muted ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
      <button
        onClick={() => toggleDeafen(userId)}
        className={`p-2 rounded-md ${
          voiceState.deafened ? 'bg-[#ed4245] text-white' : 'hover:bg-[#404249] text-[#b5bac1]'
        }`}
      >
        {voiceState.deafened ? (
          <PhoneOff className="w-5 h-5" />
        ) : (
          <Headphones className="w-5 h-5" />
        )}
      </button>
      <button
        onClick={onOpenSettings}
        className="p-2 rounded-md hover:bg-[#404249] text-[#b5bac1]"
      >
        <Settings className="w-5 h-5" />
      </button>
      <button
        onClick={onLeave}
        className="px-3 py-1 bg-[#ed4245] text-white text-sm rounded hover:bg-[#c93b3e]"
      >
        Disconnect
      </button>
    </div>
  );
}