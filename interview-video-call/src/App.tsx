import React, { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { VideoCall } from './components/VideoCall';
import { CodeEditor } from './components/CodeEditor';
import { Chat } from './components/Chat';
import { Message, CodeState, Room } from './types';
import { Plus, Copy, Check, UserPlus } from 'lucide-react';
import * as socketService from './socket';

function App() {
  const [room, setRoom] = useState<Room | null>(null);
  const [isInterviewer, setIsInterviewer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [username, setUsername] = useState('');
  const [joinRequests, setJoinRequests] = useState<{ username: string; userId: string }[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const createRoom = () => {
    const newRoom: Room = {
      id: nanoid(),
      participants: [],
      messages: [],
      codeState: {
        content: '// Start coding here\n',
        language: 'javascript'
      },
      expiresAt: Date.now() + 7200000 // 2 hours from now
    };
    setRoom(newRoom);
    setIsInterviewer(true);
    socketService.connectSocket(newRoom.id, username);
  };

  const handleCodeChange = (content: string) => {
    if (!room) return;
    setRoom({
      ...room,
      codeState: {
        ...room.codeState,
        content
      }
    });
    socketService.syncCode(content);
  };

  const handleSendMessage = (content: string, type: 'chat' | 'question' = 'chat') => {
    if (!room) return;
    const newMessage: Message = {
      id: nanoid(),
      sender: username,
      content,
      timestamp: Date.now(),
      type
    };
    setRoom({
      ...room,
      messages: [...room.messages, newMessage]
    });
    socketService.sendMessage(newMessage);
  };

  const handleShareRoom = () => {
    const roomLink = `${window.location.origin}?room=${room?.id}`;
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinRoom = () => {
    if (!username.trim()) {
      setJoinError('Please enter your name');
      return;
    }
    setIsJoining(true);
    setJoinError('');
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');
    if (roomId) {
      socketService.requestJoin(roomId, username);
    }
  };

  const handleApproveJoin = (userId: string) => {
    socketService.approveJoin(userId);
    setJoinRequests(prev => prev.filter(req => req.userId !== userId));
  };

  const handleRejectJoin = (userId: string) => {
    socketService.rejectJoin(userId);
    setJoinRequests(prev => prev.filter(req => req.userId !== userId));
  };

  useEffect(() => {
    socketService.onJoinRequest((data) => {
      setJoinRequests(prev => [...prev, data]);
    });

    socketService.onJoinApproved(() => {
      const params = new URLSearchParams(window.location.search);
      const roomId = params.get('room');
      if (roomId) {
        setRoom({
          id: roomId,
          participants: [],
          messages: [],
          codeState: {
            content: '// Start coding here\n',
            language: 'javascript'
          },
          expiresAt: Date.now() + 7200000
        });
        setIsJoining(false);
        socketService.connectSocket(roomId, username);
      }
    });

    socketService.onJoinRejected(() => {
      setIsJoining(false);
      setJoinError('Your join request was rejected');
    });

    socketService.onCodeSync((content) => {
      setRoom(prev => prev ? {
        ...prev,
        codeState: {
          ...prev.codeState,
          content
        }
      } : null);
    });

    socketService.onMessage((message) => {
      setRoom(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message]
      } : null);
    });

    // Check for room ID in URL
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');
    if (roomId && !room) {
      setIsInterviewer(false);
    }
  }, []);

  if (!room) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="bg-dark-lighter p-8 rounded-xl w-full max-w-md">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Interview Platform</h1>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-dark-light text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your name"
              />
            </div>
            {joinError && (
              <p className="text-red-500 text-sm">{joinError}</p>
            )}
            {isJoining ? (
              <p className="text-center text-gray-400">
                Waiting for interviewer's approval...
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                <button
                  onClick={createRoom}
                  disabled={!username}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  Create Interview Room
                </button>
                {new URLSearchParams(window.location.search).get('room') && (
                  <button
                    onClick={handleJoinRoom}
                    disabled={!username}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-dark-light hover:bg-dark-lighter text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <UserPlus className="w-5 h-5" />
                    Join Interview Room
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Interview Room</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <p className="text-gray-400">Room ID: {room.id}</p>
              <button
                onClick={handleShareRoom}
                className="p-2 rounded-lg bg-dark-light hover:bg-dark-lighter transition-colors"
                title="Copy room link"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-gray-400">
              Role: {isInterviewer ? 'Interviewer' : 'Interviewee'}
            </p>
          </div>
        </header>

        {isInterviewer && joinRequests.length > 0 && (
          <div className="bg-dark-lighter rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4">Join Requests</h2>
            <div className="space-y-4">
              {joinRequests.map((request) => (
                <div key={request.userId} className="flex items-center justify-between bg-dark-light p-4 rounded-lg">
                  <span>{request.username} wants to join</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveJoin(request.userId)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectJoin(request.userId)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <VideoCall isInterviewer={isInterviewer} roomId={room.id} username={username} />
            <CodeEditor
              codeState={room.codeState}
              onChange={handleCodeChange}
              readOnly={!isInterviewer}
            />
          </div>
          <div className="h-[920px]">
            <Chat 
              messages={room.messages} 
              onSendMessage={handleSendMessage}
              isInterviewer={isInterviewer}
              onShareRoom={handleShareRoom}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;