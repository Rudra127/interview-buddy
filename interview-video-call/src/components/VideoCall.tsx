import { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff } from 'lucide-react';
import * as socketService from '../socket';

interface VideoCallProps {
  isInterviewer: boolean;
  roomId: string;
  username: string;
}

export function VideoCall({ isInterviewer, roomId, username }: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        localStreamRef.current = stream;

        // Initialize WebRTC peer connection
        const configuration: RTCConfiguration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
          ]
        };

        const peerConnection = new RTCPeerConnection(configuration);
        peerConnectionRef.current = peerConnection;

        // Add local tracks to the peer connection
        stream.getTracks().forEach(track => {
          if (localStreamRef.current) {
            peerConnection.addTrack(track, localStreamRef.current);
          }
        });

        // Handle incoming remote tracks
        peerConnection.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setIsConnected(true);
          }
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socketService.sendSignal({
              type: 'ice-candidate',
              candidate: event.candidate
            }, roomId);
          }
        };

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
          console.log('Connection state:', peerConnection.connectionState);
          setIsConnected(peerConnection.connectionState === 'connected');
        };

        // Create offer if interviewer
        if (isInterviewer) {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          socketService.sendSignal({
            type: 'offer',
            sdp: offer.sdp
          }, roomId);
        }

        // Handle signaling through socket
        socketService.onSignal(async (signal, from) => {
          try {
            if (signal.type === 'offer') {
              await peerConnection.setRemoteDescription(new RTCSessionDescription({
                type: 'offer',
                sdp: signal.sdp
              }));
              const answer = await peerConnection.createAnswer();
              await peerConnection.setLocalDescription(answer);
              socketService.sendSignal({
                type: 'answer',
                sdp: answer.sdp
              }, from);
            } else if (signal.type === 'answer') {
              await peerConnection.setRemoteDescription(new RTCSessionDescription({
                type: 'answer',
                sdp: signal.sdp
              }));
            } else if (signal.type === 'ice-candidate') {
              await peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
          } catch (error) {
            console.error('Error handling signal:', error);
          }
        });

      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initializeMedia();

    return () => {
      // Cleanup
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      peerConnectionRef.current?.close();
    };
  }, [isInterviewer, roomId]);

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };

  return (
    <div className="relative w-full h-[400px] bg-dark-lighter rounded-xl overflow-hidden grid grid-cols-2 gap-4 p-4">
      <div className="relative">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover rounded-lg bg-dark"
        />
        <p className="absolute bottom-2 left-2 text-sm text-white bg-black bg-opacity-50 px-2 py-1 rounded">
          You ({username})
        </p>
      </div>
      <div className="relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover rounded-lg bg-dark"
        />
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark bg-opacity-90">
            <p className="text-gray-400">Waiting for peer to connect...</p>
          </div>
        )}
        <p className="absolute bottom-2 left-2 text-sm text-white bg-black bg-opacity-50 px-2 py-1 rounded">
          {isInterviewer ? 'Interviewee' : 'Interviewer'}
        </p>
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-colors ${
            isVideoEnabled ? 'bg-primary' : 'bg-red-500'
          }`}
        >
          {isVideoEnabled ? (
            <Video className="w-6 h-6 text-white" />
          ) : (
            <VideoOff className="w-6 h-6 text-white" />
          )}
        </button>
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-colors ${
            isAudioEnabled ? 'bg-primary' : 'bg-red-500'
          }`}
        >
          {isAudioEnabled ? (
            <Mic className="w-6 h-6 text-white" />
          ) : (
            <MicOff className="w-6 h-6 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}