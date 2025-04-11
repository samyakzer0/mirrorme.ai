
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { processAudioData } from '@/lib/audioProcessor';

interface AudioCaptureProps {
  onFeedbackGenerated: (feedback: string, type: 'good' | 'warning' | 'alert') => void;
}

const AudioCapture: React.FC<AudioCaptureProps> = ({ onFeedbackGenerated }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const processingIntervalRef = useRef<number | null>(null);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);
      return true;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      setHasPermission(false);
      toast.error('Microphone access denied. Please enable microphone access to use MirrorMe.AI.');
      return false;
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      const permissionGranted = await requestMicrophonePermission();
      if (!permissionGranted) return;
    }

    if (streamRef.current) {
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
      // Process audio every 5 seconds
      processingIntervalRef.current = window.setInterval(() => {
        if (audioChunksRef.current.length > 0) {
          processAudioChunk();
        }
      }, 5000);
      
      toast.success('MirrorMe.AI is now listening');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
        processingIntervalRef.current = null;
      }
      
      // Final processing of any remaining audio
      if (audioChunksRef.current.length > 0) {
        processAudioChunk();
      }
      
      toast.info('MirrorMe.AI has stopped listening');
    }
  };

  const processAudioChunk = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
    audioChunksRef.current = []; // Clear for the next batch
    
    try {
      // In a real implementation, this would send to Hugging Face API
      const { feedback, feedbackType } = await processAudioData(audioBlob);
      onFeedbackGenerated(feedback, feedbackType);
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  };

  useEffect(() => {
    // Check initial permission on component mount
    requestMicrophonePermission();
    
    // Cleanup function
    return () => {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        className={`rounded-full p-6 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-mirror-purple hover:bg-mirror-purple-dark'}`}
        onClick={isRecording ? stopRecording : startRecording}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording ? (
          <MicOff className="h-6 w-6 text-white" />
        ) : (
          <Mic className="h-6 w-6 text-white" />
        )}
      </Button>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {isRecording ? 'Tap to stop' : 'Tap to start'}
      </span>
    </div>
  );
};

export default AudioCapture;
