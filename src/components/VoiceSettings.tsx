import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Mic } from 'lucide-react';
import { useVoice } from '../store/voice';

export default function VoiceSettings() {
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [isTestingInput, setIsTestingInput] = useState(false);
  const [inputLevel, setInputLevel] = useState<number>(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [deviceLoadError, setDeviceLoadError] = useState<string | null>(null);

  const { 
    inputVolume,
    selectedInputDevice,
    setInputDevice,
    setInputVolume
  } = useVoice();

  const audioContext = useRef<AudioContext>();
  const analyser = useRef<AnalyserNode>();
  const mediaStream = useRef<MediaStream>();
  const animationFrame = useRef<number>();

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        setPermissionGranted(true);
        stream.getTracks().forEach(track => track.stop());
        
        await loadDevices();
        
        navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
        
      } catch (err) {
        console.error('Error initializing audio:', err);
        setDeviceLoadError('Please grant microphone permissions to use voice features.');
        setPermissionGranted(false);
      }
    };

    init();
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      stopInputTest();
      if (audioContext.current?.state !== 'closed') {
        audioContext.current?.close();
      }
    };
  }, []);

  const loadDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter(device => device.kind === 'audioinput');
      setInputDevices(inputs);

      if (!selectedInputDevice && inputs.length > 0) {
        setInputDevice(inputs[0].deviceId);
      }

    } catch (err) {
      console.error('Error loading devices:', err);
      setDeviceLoadError('Failed to load audio devices. Please check your permissions.');
    }
  };

  const handleDeviceChange = async () => {
    await loadDevices();
  };

  const startInputTest = async () => {
    try {
      stopInputTest();

      audioContext.current = new AudioContext();
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedInputDevice ? { exact: selectedInputDevice } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaStream.current = stream;

      const source = audioContext.current.createMediaStreamSource(stream);
      analyser.current = audioContext.current.createAnalyser();
      const gainNode = audioContext.current.createGain();
      
      analyser.current.fftSize = 32;
      analyser.current.smoothingTimeConstant = 0.2;
      
      source.connect(gainNode);
      gainNode.connect(analyser.current);
      gainNode.connect(audioContext.current.destination);
      gainNode.gain.value = inputVolume / 100;
      
      setIsTestingInput(true);
      updateInputLevel();

    } catch (err) {
      console.error('Error testing input:', err);
      setDeviceLoadError('Failed to access microphone. Please check your permissions.');
      setIsTestingInput(false);
    }
  };

  const updateInputLevel = () => {
    if (!analyser.current || !isTestingInput) return;

    const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
    analyser.current.getByteFrequencyData(dataArray);
    
    // Focus on voice frequencies (roughly 85-255 Hz)
    const voiceRange = dataArray.slice(1, 4);
    const average = voiceRange.reduce((acc, val) => acc + val, 0) / voiceRange.length;
    
    // Apply input volume and normalize
    const normalizedLevel = Math.min((average / 128) * (inputVolume / 100), 1);
    
    // Smooth the level changes
    setInputLevel(prev => prev * 0.8 + normalizedLevel * 0.2);
    animationFrame.current = requestAnimationFrame(updateInputLevel);
  };

  const stopInputTest = () => {
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
    }

    if (audioContext.current?.state !== 'closed') {
      audioContext.current?.close();
    }

    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    setIsTestingInput(false);
    setInputLevel(0);
  };

  const handleInputVolumeChange = (value: number) => {
    setInputVolume(value);
    if (audioContext.current) {
      const gainNode = audioContext.current.createGain();
      gainNode.gain.value = value / 100;
    }
  };

  // Generate meter segments
  const meterSegments = Array.from({ length: 20 }, (_, i) => {
    const threshold = i / 20;
    const isActive = inputLevel >= threshold;
    const color = isActive ? 
      (inputLevel > 0.8 ? 'bg-red-500' : 
       inputLevel > 0.6 ? 'bg-yellow-500' : 
       'bg-green-500') : 
      'bg-[#4f545c]';
    
    return (
      <div
        key={i}
        className={`h-8 w-2 ${color} rounded-sm transition-colors duration-100`}
      />
    );
  });

  return (
    <div className="space-y-8">
      <h2 className="text-white text-xl font-semibold mb-6">Voice Settings</h2>

      {deviceLoadError && (
        <div className="bg-[#ed4245] text-white p-4 rounded-md mb-4">
          {deviceLoadError}
        </div>
      )}

      {!permissionGranted && (
        <div className="bg-[#faa61a] text-white p-4 rounded-md mb-4">
          Please grant microphone permissions to use voice features.
        </div>
      )}

      <div>
        <h3 className="text-[#b5bac1] text-xs font-semibold mb-4">INPUT DEVICE</h3>
        <div className="space-y-4">
          <select
            value={selectedInputDevice || ''}
            onChange={(e) => setInputDevice(e.target.value)}
            className="w-full bg-[#1e1f22] text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
          >
            {inputDevices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone (${device.deviceId.slice(0, 5)})`}
              </option>
            ))}
          </select>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#b5bac1] text-sm">Input Volume</span>
              <span className="text-[#b5bac1] text-sm">{inputVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={inputVolume}
              onChange={(e) => handleInputVolumeChange(parseInt(e.target.value))}
              className="w-full accent-[#5865f2]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#b5bac1] text-sm">Input Level</span>
              <div className="flex items-center gap-2">
                <label className="text-[#b5bac1] text-sm">
                  <input
                    type="checkbox"
                    checked={isTestingInput}
                    onChange={() => isTestingInput ? stopInputTest() : startInputTest()}
                    className="mr-2"
                  />
                  Listen to test
                </label>
                <button
                  onClick={() => isTestingInput ? stopInputTest() : startInputTest()}
                  className={`px-3 py-1 rounded ${
                    isTestingInput 
                      ? 'bg-[#ed4245] hover:bg-[#c93b3e]' 
                      : 'bg-[#5865f2] hover:bg-[#4752c4]'
                  } text-white text-sm`}
                >
                  {isTestingInput ? 'Stop Test' : 'Let\'s Check'}
                </button>
              </div>
            </div>
            <div className="bg-[#1e1f22] rounded-md p-2 flex items-center gap-1">
              {meterSegments}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}