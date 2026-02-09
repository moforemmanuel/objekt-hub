import { useEffect } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { useObjectsStore } from '@/stores/objects';
import type { ObjectItem } from '@/lib/api';

export const useSocket = () => {
  const { addObject, removeObject } = useObjectsStore();

  useEffect(() => {
    const socket = getSocket();

    // Listen for object created
    socket.on('object:created', (newObject: ObjectItem) => {
      console.log('📦 New object created:', newObject);
      addObject(newObject);
    });

    // Listen for object deleted
    socket.on('object:deleted', (objectId: string) => {
      console.log('🗑️ Object deleted:', objectId);
      removeObject(objectId);
    });

    return () => {
      socket.off('object:created');
      socket.off('object:deleted');
    };
  }, [addObject, removeObject]);

  return {
    disconnect: disconnectSocket,
  };
};
