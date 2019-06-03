import * as msgpack from 'notepack.io';

class WS {
  isReady = false;
  sendedPckgPerSec = 0;
  recievedPckgPerSec = 0;

  constructor(){
    this.sendedCount = 0;
    this.recievedCount = 0;
    this.lag = 500;
    this.socket = new WebSocket('ws://localhost:3000/');
    this.socket.binaryType = 'arraybuffer';

    this.listeners = [];


    this.socket.onopen = () => {
      this.isReady = true;
    };

    // debug counter
    this.socket.onmessage = (event) => {
      const process = () => {
        this.recievedCount++;
        const msg = msgpack.decode(new Uint8Array(event.data));
        // console.log('decoded', msg);
        this.listeners.forEach(({messageType, callback}) => {
          if (msg.type === messageType) {
            callback(msg.data);
          }
        })
      };
      setTimeout(process, this.lag);
    };

    setInterval(()=>{
      this.sendedPckgPerSec = this.sendedCount;
      this.recievedPckgPerSec = this.recievedCount;
      this.sendedCount = 0;
      this.recievedCount = 0;
    }, 1000);
  }

  emit(type, data) {
    const process = () => {
      this.sendedCount++;
      this.socket.send(msgpack.encode({
        type,
        data
      }))
    };

    setTimeout(process, this.lag);
  }

  on(messageType, callback) {
    this.listeners.push({
      messageType,
      callback
    });
    // this.socket.onmessage = (event) => {
    //   const msg = msgpack.decode(new Uint8Array(event.data));
    //   console.log('decoded', msg);
    //   console.log(msg.type)
    //   if (msg.type === messageType) {
    //     callback(msg.data);
    //   }
    // };
  }

  setLag(lag) {
    this.lag = lag;
    console.log(`Now log is ${this.lag}`);
  }
}

export default new WS();

