import World from "./world/World";
import { UserMessages } from '../common/dictionary';

class Core {
  constructor(socketManager) {
    this.sm = socketManager;
    this.world = new World({
      sm: this.sm,
      tickRate: 60,
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
      sm.sendTo(socket, {
        type: 'WORLD_INFO',
        data: this.world.collectWorldInfo(socket),
      });
    });

    sm.on(UserMessages.WANT_JOIN, (data, socket) => {
      this.world.addPlayer(socket);
    });

    sm.on(UserMessages.INPUT, this.world.updatePlayer);
    sm.on('WANT_TO_SHOT', (data, socket) => {
      this.world.playerShoot(socket);
    });

    sm.on('WANT_TO_SHOT_RAY', (data, socket) => {
      this.world.playerShootRay(socket);
    });
  }
}

export default Core;