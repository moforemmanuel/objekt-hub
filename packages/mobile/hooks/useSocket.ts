import { useEffect } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { useObjectsStore } from '@/stores/objects';
import type { ObjectItem } from '@/lib/api';

export const useSocket = () => {
  const { addObject, removeObject } = useObjectsStore();

  useEffect(() => {
    const socket = getSocket();

    socket.on('object:created', (newObject: ObjectItem) => {
      addObject(newObject);
    });

    socket.on('object:deleted', (objectId: string) => {
      removeObject(objectId);
    });

    return () => {
      socket.off('object:created');
      socket.off('object:deleted');
    };
  }, [addObject, removeObject]);

  return { disconnect: disconnectSocket };
};
