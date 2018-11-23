import socketio from 'socket.io';

class SocketManager {
  constructor(http){
    this.io = socketio(http);
    // this.io.set('transports', ['ws']);
    this.io.on('connection', this.onConnection);

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
    socket.on('disconnect', this.onDissconnect.bind(null, socket));
    socket.on('message', (msg) => {
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

  each(fn) {
    for (let i = 0; i < this.sockets.length; ++i) {
      fn(this.sockets[i]);
    }
  }

  broadcast(type, data) {
    this.io.emit('message', {
      type,
      data,
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