class WS {
  isReady = false;

  constructor(){
    this.socket = io.connect('ws://localhost:3000/', {
      transports: ['websocket']
    });

    this.socket.on('reconnect_attempt', (err) => {
      console.log(err);
    })

    this.socket.on('connect', () => {
      this.isReady = true;
    });

    this.socket.on('message', (msg) => {
      // console.log(msg);
    })
  }

  emit(type, data) {
    this.socket.emit('message', { type, data });
  }

  on(messageType, callback) {
    this.socket.on('message', (msg) => {
      if (msg.type === messageType) {
        callback(msg.data);
      }
    });
  }
}

export default new WS();

