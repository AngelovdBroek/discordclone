import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VoiceState {
  localStream: MediaStream | null;
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  gainNode: GainNode | null;
  selectedInputDevice: string | null;
  inputVolume: number;
  currentChannelId: string | null;
  userStates: Record<string, {
    muted: boolean;
    deafened: boolean;
    speaking: boolean;
    audioLevel: number;
  }>;

  initialize: () => Promise<void>;
  joinChannel: (channelId: string, userId: string) => Promise<void>;
  leaveChannel: (userId: string) => void;
  toggleMute: (userId: string) => void;
  toggleDeafen: (userId: string) => void;
  setSpeaking: (userId: string, speaking: boolean) => void;
  getUserVoiceState: (userId: string) => {
    muted: boolean;
    deafened: boolean;
    speaking: boolean;
    audioLevel: number;
  } | undefined;
  getChannelParticipants: (channelId: string) => string[];
  getUserChannel: (userId: string) => string | null;
  cleanup: () => void;
  setInputDevice: (deviceId: string) => void;
  setInputVolume: (volume: number) => void;
}

const migrateState = (persistedState: any, version: number): any => {
  switch (version) {
    case 0:
      return {
        ...persistedState,
        localStream: null,
        audioContext: null,
        analyser: null,
        gainNode: null,
        selectedInputDevice: persistedState.selectedInputDevice || null,
        inputVolume: persistedState.inputVolume || 100,
        currentChannelId: null,
        userStates: persistedState.userStates || {}
      };
    default:
      return persistedState;
  }
};

export const useVoice = create<VoiceState>()(
  persist(
    (set, get) => ({
      localStream: null,
      audioContext: null,
      analyser: null,
      gainNode: null,
      selectedInputDevice: null,
      inputVolume: 100,
      currentChannelId: null,
      userStates: {},

      initialize: async () => {
        try {
          const audioContext = new AudioContext();
          set({ audioContext });
        } catch (err) {
          console.error('Failed to initialize audio context:', err);
          throw err;
        }
      },

      joinChannel: async (channelId: string, userId: string) => {
        try {
          const state = get();
          
          // Stop any existing stream
          if (state.localStream) {
            state.localStream.getTracks().forEach(track => track.stop());
          }

          // Get microphone access
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              deviceId: state.selectedInputDevice ? { exact: state.selectedInputDevice } : undefined,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });

          // Set up audio processing
          if (state.audioContext) {
            const source = state.audioContext.createMediaStreamSource(stream);
            const analyser = state.audioContext.createAnalyser();
            const gainNode = state.audioContext.createGain();

            analyser.fftSize = 1024;
            analyser.smoothingTimeConstant = 0.2;

            source.connect(gainNode);
            gainNode.connect(analyser);
            gainNode.gain.value = state.inputVolume / 100;

            set({
              localStream: stream,
              currentChannelId: channelId,
              analyser,
              gainNode,
              userStates: {
                ...state.userStates,
                [userId]: {
                  muted: false,
                  deafened: false,
                  speaking: false,
                  audioLevel: 0
                }
              }
            });

            // Start monitoring audio levels
            const checkAudioLevel = () => {
              if (!get().analyser) return;
              
              const dataArray = new Uint8Array(get().analyser!.frequencyBinCount);
              get().analyser!.getByteFrequencyData(dataArray);
              
              // Focus on voice frequencies
              const voiceRange = dataArray.slice(2, 6);
              const average = voiceRange.reduce((acc, val) => acc + val, 0) / voiceRange.length;
              const normalizedLevel = Math.min((average / 128) * (state.inputVolume / 100), 1);

              const userState = get().userStates[userId];
              if (userState && !userState.muted && !userState.deafened) {
                set(state => ({
                  userStates: {
                    ...state.userStates,
                    [userId]: {
                      ...state.userStates[userId],
                      speaking: normalizedLevel > 0.1,
                      audioLevel: normalizedLevel
                    }
                  }
                }));
              }

              if (get().currentChannelId === channelId) {
                requestAnimationFrame(checkAudioLevel);
              }
            };

            checkAudioLevel();
          }
        } catch (err) {
          console.error('Failed to join voice channel:', err);
          throw err;
        }
      },

      leaveChannel: (userId: string) => {
        const state = get();
        
        if (state.localStream) {
          state.localStream.getTracks().forEach(track => track.stop());
        }

        if (state.gainNode) {
          state.gainNode.disconnect();
        }

        if (state.analyser) {
          state.analyser.disconnect();
        }

        set({
          localStream: null,
          currentChannelId: null,
          analyser: null,
          gainNode: null,
          userStates: {
            ...state.userStates,
            [userId]: {
              muted: false,
              deafened: false,
              speaking: false,
              audioLevel: 0
            }
          }
        });
      },

      toggleMute: (userId: string) => {
        const state = get();
        const userState = state.userStates[userId];
        
        if (userState) {
          if (state.localStream) {
            state.localStream.getAudioTracks().forEach(track => {
              track.enabled = userState.muted;
            });
          }

          set({
            userStates: {
              ...state.userStates,
              [userId]: {
                ...userState,
                muted: !userState.muted,
                speaking: false
              }
            }
          });
        }
      },

      toggleDeafen: (userId: string) => {
        const state = get();
        const userState = state.userStates[userId];
        
        if (userState) {
          if (state.localStream) {
            state.localStream.getAudioTracks().forEach(track => {
              track.enabled = userState.deafened;
            });
          }

          set({
            userStates: {
              ...state.userStates,
              [userId]: {
                ...userState,
                deafened: !userState.deafened,
                muted: !userState.deafened,
                speaking: false
              }
            }
          });
        }
      },

      setSpeaking: (userId: string, speaking: boolean) => {
        const state = get();
        const userState = state.userStates[userId];
        
        if (userState && !userState.muted && !userState.deafened) {
          set({
            userStates: {
              ...state.userStates,
              [userId]: {
                ...userState,
                speaking
              }
            }
          });
        }
      },

      getUserVoiceState: (userId: string) => {
        return get().userStates[userId];
      },

      getChannelParticipants: (channelId: string) => {
        const state = get();
        return Object.entries(state.userStates)
          .filter(([_, state]) => state.speaking || !state.muted)
          .map(([userId]) => userId);
      },

      getUserChannel: (userId: string) => {
        return get().currentChannelId;
      },

      cleanup: () => {
        const state = get();
        
        if (state.localStream) {
          state.localStream.getTracks().forEach(track => track.stop());
        }

        if (state.gainNode) {
          state.gainNode.disconnect();
        }

        if (state.analyser) {
          state.analyser.disconnect();
        }

        set({
          localStream: null,
          audioContext: null,
          analyser: null,
          gainNode: null,
          currentChannelId: null,
          userStates: {}
        });
      },

      setInputDevice: (deviceId: string) => {
        set({ selectedInputDevice: deviceId });
      },

      setInputVolume: (volume: number) => {
        const state = get();
        if (state.gainNode) {
          state.gainNode.gain.value = volume / 100;
        }
        set({ inputVolume: volume });
      }
    }),
    {
      name: 'voice-storage',
      version: 1,
      migrate: migrateState
    }
  )
);