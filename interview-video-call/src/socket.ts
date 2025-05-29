import { io } from 'socket.io-client';
import { Message } from './types';

const SOCKET_URL = 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
});

export const connectSocket = (roomId: string, username: string) => {
  socket.auth = { roomId, username };
  socket.connect();
};

// WebRTC signaling
export const sendSignal = (signal: any, to: string) => {
  socket.emit('signal', { signal, to });
};

export const onSignal = (callback: (signal: any, from: string) => void) => {
  socket.on('signal', ({ signal, from }) => callback(signal, from));
};

// Room management
export const requestJoin = (roomId: string, username: string) => {
  socket.emit('request_join', { roomId, username });
};

export const onJoinRequest = (callback: (data: { username: string, userId: string }) => void) => {
  socket.on('join_request', callback);
};

export const approveJoin = (userId: string) => {
  socket.emit('approve_join', { userId });
};

export const rejectJoin = (userId: string) => {
  socket.emit('reject_join', { userId });
};

export const onJoinApproved = (callback: () => void) => {
  socket.on('join_approved', callback);
};

export const onJoinRejected = (callback: () => void) => {
  socket.on('join_rejected', callback);
};

// Code sync
export const syncCode = (content: string) => {
  socket.emit('code_sync', { content });
};

export const onCodeSync = (callback: (content: string) => void) => {
  socket.on('code_sync', ({ content }) => callback(content));
};

// Chat
export const sendMessage = (message: Message) => {
  socket.emit('chat_message', message);
};

export const onMessage = (callback: (message: Message) => void) => {
  socket.on('chat_message', callback);
};