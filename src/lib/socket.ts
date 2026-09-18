import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
    : 'https://rmsbackend-c4bk.onrender.com');

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
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
