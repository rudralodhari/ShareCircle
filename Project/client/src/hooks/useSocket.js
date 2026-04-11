import { useContext, useEffect, useCallback } from 'react';
import { SocketContext } from '../context/SocketContext';

export default function useSocket(event, handler) {
  const { socket, connected } = useContext(SocketContext);

  useEffect(() => {
    if (!socket || !event || !handler) return;
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [socket, event, handler]);

  const emit = useCallback(
    (eventName, data) => {
      if (socket) socket.emit(eventName, data);
    },
    [socket]
  );

  return { socket, connected, emit };
}
