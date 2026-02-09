# Socket.IO Real-Time Events Documentation

This document describes how to use Socket.IO to receive real-time updates from the ObjektHub API.

## Overview

The API uses Socket.IO to broadcast real-time events when objects are created or deleted. This allows clients to receive instant updates without polling the API.

**WebSocket Endpoint:** `ws://localhost:8000` (development) or your production URL

**Namespace:** `/` (root namespace)

**CORS:** Enabled for all origins

## Connection

### Web (Browser)

Install the Socket.IO client:

```bash
npm install socket.io-client
# or
yarn add socket.io-client
# or
pnpm add socket.io-client
```

Connect to the server:

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

### React Example

```tsx
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io('http://localhost:8000');

    socketInstance.on('connect', () => {
      console.log('Connected:', socketInstance.id);
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected');
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, connected };
}

function App() {
  const { socket, connected } = useSocket();
  const [objects, setObjects] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new objects
    socket.on('object:created', (newObject) => {
      console.log('New object created:', newObject);
      setObjects((prev) => [newObject, ...prev]);
    });

    // Listen for deleted objects
    socket.on('object:deleted', (objectId) => {
      console.log('Object deleted:', objectId);
      setObjects((prev) => prev.filter((obj) => obj.id !== objectId));
    });

    return () => {
      socket.off('object:created');
      socket.off('object:deleted');
    };
  }, [socket]);

  return (
    <div>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
      {/* Your app content */}
    </div>
  );
}
```

### React Native / Expo (Mobile)

Install the Socket.IO client:

```bash
npm install socket.io-client
# or
yarn add socket.io-client
# or
pnpm add socket.io-client
```

Usage:

```typescript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function useSocket() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Use your actual server URL
    const socketInstance = io('http://localhost:8000', {
      transports: ['websocket'],
      reconnection: true,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, connected };
}

// In your component
export default function HomeScreen() {
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('object:created', (newObject) => {
      console.log('New object:', newObject);
      // Update your state
    });

    socket.on('object:deleted', (objectId) => {
      console.log('Deleted object:', objectId);
      // Update your state
    });

    return () => {
      socket.off('object:created');
      socket.off('object:deleted');
    };
  }, [socket]);

  return (
    // Your UI
  );
}
```

### Next.js Example

Create a Socket.IO context provider:

```typescript
// lib/socket-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

    socketInstance.on('connect', () => {
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
```

Usage in components:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/lib/socket-provider';

export default function ObjectsList() {
  const { socket, connected } = useSocket();
  const [objects, setObjects] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.on('object:created', (newObject) => {
      setObjects((prev) => [newObject, ...prev]);
    });

    socket.on('object:deleted', (objectId) => {
      setObjects((prev) => prev.filter((obj) => obj.id !== objectId));
    });

    return () => {
      socket.off('object:created');
      socket.off('object:deleted');
    };
  }, [socket]);

  return (
    <div>
      <p>WebSocket: {connected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      {/* Render objects */}
    </div>
  );
}
```

## Available Events

### Server → Client Events

#### `object:created`

Emitted when a new object is created via the API.

**Payload:**

```typescript
{
  id: string;           // Object ID
  title: string;        // Object title
  description?: string; // Optional description
  imageUrl: string;     // URL to the uploaded image
  createdBy: string;    // User ID who created the object
  createdAt: string;    // ISO timestamp
}
```

**Example:**

```typescript
socket.on('object:created', (object) => {
  console.log('New object:', object);
  // {
  //   id: '507f1f77bcf86cd799439011',
  //   title: 'My Object',
  //   description: 'A beautiful object',
  //   imageUrl: 'https://s3.backblaze.com/bucket/objects/1234567890-abc.jpg',
  //   createdBy: '507f1f77bcf86cd799439012',
  //   createdAt: '2026-02-09T10:30:00.000Z'
  // }
});
```

#### `object:deleted`

Emitted when an object is deleted via the API.

**Payload:**

```typescript
string // The ID of the deleted object
```

**Example:**

```typescript
socket.on('object:deleted', (objectId) => {
  console.log('Object deleted:', objectId);
  // '507f1f77bcf86cd799439011'
});
```

### Connection Events

These are standard Socket.IO events:

#### `connect`

Emitted when the client successfully connects to the server.

```typescript
socket.on('connect', () => {
  console.log('Connected with ID:', socket.id);
});
```

#### `disconnect`

Emitted when the client disconnects from the server.

```typescript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  // Reasons: 'io server disconnect', 'io client disconnect', 'ping timeout', 'transport close', 'transport error'
});
```

#### `connect_error`

Emitted when a connection error occurs.

```typescript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

## Best Practices

### 1. Clean Up Event Listeners

Always remove event listeners when components unmount to prevent memory leaks:

```typescript
useEffect(() => {
  if (!socket) return;

  const handleObjectCreated = (object) => {
    // Handle event
  };

  socket.on('object:created', handleObjectCreated);

  return () => {
    socket.off('object:created', handleObjectCreated);
  };
}, [socket]);
```

### 2. Handle Reconnection

Socket.IO automatically reconnects, but you should handle reconnection in your UI:

```typescript
socket.on('disconnect', () => {
  setStatus('Reconnecting...');
});

socket.on('connect', () => {
  setStatus('Connected');
  // Re-fetch data to sync state
  fetchLatestObjects();
});
```

### 3. Environment Configuration

Use environment variables for the WebSocket URL:

```typescript
// Web
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Mobile (Expo)
const SOCKET_URL = __DEV__ ? 'http://localhost:8000' : 'https://api.yourapp.com';
```

### 4. Error Handling

Always implement error handling:

```typescript
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error);
  // Show error message to user
  // Retry logic if needed
});
```

### 5. Optimistic Updates

Combine real-time updates with optimistic UI updates:

```typescript
async function deleteObject(id: string) {
  // Optimistically update UI
  setObjects((prev) => prev.filter((obj) => obj.id !== id));

  try {
    await api.delete(`/objects/${id}`);
    // Server will emit 'object:deleted' event
  } catch (error) {
    // Revert optimistic update
    fetchObjects();
  }
}
```

## Production Deployment

When deploying to production:

1. **Update CORS Settings** in the gateway if needed:

```typescript
// packages/api/src/modules/objects/objects.gateway.ts
@WebSocketGateway({
  cors: {
    origin: ['https://yourapp.com', 'https://www.yourapp.com'],
    credentials: true,
  },
})
```

2. **Use HTTPS/WSS** for secure connections:

```typescript
const socket = io('https://api.yourapp.com', {
  secure: true,
  rejectUnauthorized: true,
});
```

3. **Configure Load Balancing** if using multiple server instances:

Enable sticky sessions or use a Redis adapter for Socket.IO.

## Testing WebSocket Connection

You can test the WebSocket connection using the browser console:

```javascript
// Open browser console on any page
const socket = io('http://localhost:8000');

socket.on('connect', () => {
  console.log('Connected!', socket.id);
});

socket.on('object:created', (data) => {
  console.log('Object created:', data);
});

socket.on('object:deleted', (id) => {
  console.log('Object deleted:', id);
});
```

Then create or delete an object via the API and watch for events in the console.

## Troubleshooting

### Connection Issues

1. **Firewall/Network:** Ensure WebSocket traffic is not blocked
2. **CORS:** Check that your client origin is allowed in the gateway configuration
3. **Port:** Verify the server is running on the correct port (default: 8000)

### Events Not Received

1. **Check connection status:** Ensure `socket.connected === true`
2. **Verify event names:** Event names are case-sensitive (`object:created` not `objectCreated`)
3. **Server logs:** Check server logs for emission confirmations

### Mobile Development (Expo)

When testing on a physical device:

1. Use your computer's local IP instead of `localhost`:
   ```typescript
   const socket = io('http://192.168.1.100:8000');
   ```

2. Ensure both devices are on the same network

3. For Android, add to `app.json`:
   ```json
   {
     "expo": {
       "android": {
         "usesCleartextTraffic": true
       }
     }
   }
   ```

## Additional Resources

- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)
- [Socket.IO React Integration](https://socket.io/how-to/use-with-react)
- [Socket.IO React Native](https://socket.io/how-to/use-with-react-native)
