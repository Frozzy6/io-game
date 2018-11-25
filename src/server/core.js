import World from "./world/World";

class Core {
  constructor(socketManager) {
    this.sm = socketManager;
    this.world = new World({
      sm: this.sm,
      tickRate: 30,
    });

    this.sm.setCallbacks({
      connect: ()=> {
        console.log('DUMMY: connection callback');
      },
      disconnect: this.world.removePlayer,
    });

    this.handleMessages();
  }

  handleMessages() {
    const { sm } = this;
    sm.on('GET_WORLD_INFO', (data, socket) => {
      socket.emit('message', {
        type: 'WORLD_INFO',
        data: this.world.collectWorldInfo(socket),
      })
    });

    sm.on('ADD_ME', (data, socket) => {
      this.world.addPlayer(socket);
    });

    sm.on('UPDATE_ME', this.world.updatePlayer);
    sm.on('WANT_TO_SHOT', (data, socket) => {
      this.world.playerShoot(socket);
    });
  }
}

export default Core;