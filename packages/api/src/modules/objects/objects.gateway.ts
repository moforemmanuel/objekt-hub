import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/',
})
export class ObjectsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ObjectsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Emit when a new object is created
  emitObjectCreated(object: any) {
    this.server.emit('object:created', object);
    this.logger.log(`Emitted object:created for object ${object.id}`);
  }

  // Emit when an object is deleted
  emitObjectDeleted(objectId: string) {
    this.server.emit('object:deleted', objectId);
    this.logger.log(`Emitted object:deleted for object ${objectId}`);
  }
}
