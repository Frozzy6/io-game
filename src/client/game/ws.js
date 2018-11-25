import * as msgpack from 'notepack.io';

class WS {
  isReady = false;
  sendedPckgPerSec = 0;
  recievedPckgPerSec = 0;

  constructor(){
    this.sendedCount = 0;
    this.recievedCount = 0;
    
    this.socket = io.connect('ws://localhost:3000/', {
      transports: ['websocket']
    });

    this.socket.on('reconnect_attempt', (err) => {
      console.log(err);
    })

    this.socket.on('connect', () => {
      this.isReady = true;
    });

    // debug counter
    this.socket.on('message', (msg) => {
      this.recievedCount++;
    });

    setInterval(()=>{
      this.sendedPckgPerSec = this.sendedCount;
      this.recievedPckgPerSec = this.recievedCount;
      this.sendedCount = 0;
      this.recievedCount = 0;
    }, 1000);
  }

  emit(type, data) {
    this.sendedCount++;
    this.socket.emit('message', { type, data });
  }

  on(messageType, callback) {
    this.socket.on('message', (msg) => {
      // console.log('raw', rawMsg);
      // const msg = msgpack.decode(Buffer.from(rawMsg));
      // console.log('decoded', msg);
      if (msg.type === messageType) {
        callback(msg.data);
      }
    });
  }
}

export default new WS();

