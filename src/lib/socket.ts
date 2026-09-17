import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io('http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('[Socket Frontend] Connected to backend real-time server:', socket?.id);
    });
  }
  return socket;
}

export function joinOutletRoom(outletId: string) {
  const s = getSocket();
  s.emit('join_outlet', outletId);
}

export function leaveOutletRoom(outletId: string) {
  const s = getSocket();
  s.emit('leave_outlet', outletId);
}
