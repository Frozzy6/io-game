import * as msgpack from 'notepack';
import * as WebSocket from 'ws';
import { throws } from 'assert';

class SocketManager {
  constructor(server){
    this.wss = new WebSocket.Server({ server })
    this.wss.on('connection', this.onConnection);
    this.sockets = [];
    this.listeners = [];
  }

  setCallbacks({connect, disconnect} = {}) {
    this.connect = connect;
    this.disconnect = disconnect;
  }

  onConnection = (socket) => {
    console.log('socket connected');
    this.connect && this.connect(socket);
    this.sockets.push(socket);

    socket.on('close', this.onDissconnect.bind(null, socket));
    socket.on('message', (byteArray) => {
      const msg = msgpack.decode(Buffer.from(byteArray));
      const type = msg.type;
      this.listeners.forEach((item) => {
        if (item.type === type) {
          item.callback(msg.data, socket);
        }
      })
    });
  }

  on(type, callback) {
    this.listeners.push({ type, callback })
  }

  off(callback) {
    this.listeners = this.listeners.filter(item => item.callback !== callback);
  }

  sendTo(socket, msg) {
    socket.send(msgpack.encode(msg));
  }

  broadcast(type, data) {
    this.wss.clients.forEach((client)=> {
      if (client !== this.wss && client.readyState === WebSocket.OPEN) {
        if (type instanceof Function === true) {
          type(client)
        } else {
          client.send(msgpack.encode({
            type,
            data
          }));
        }
      }
    });
  }

  onDissconnect = (socket) => {
    console.log('user disconected')
    const index = this.sockets.indexOf(socket);
    this.sockets.splice(index, 1);
    this.disconnect && this.disconnect(socket);
  }
}

export default SocketManager;