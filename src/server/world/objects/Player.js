import Matter from 'matter-js/src/module/main.js';
import PhysicsObject from './PhysicsObject';

class Player extends PhysicsObject {
  constructor(socket, pos, size = 30) {
    super({
      body: Matter.Bodies.circle(pos.x, pos.y, size),
      size,
      mass: 15
    })

    this.socket = socket;
    this.hp = 100;
    this.movementSpeed = 0.3;
    this.body.frictionAir = 0.3;
    this.size = size;
    this.isAlive = true;
    this.shotStart = true;
    this.fireGap = 200;
    this.lastShootTime = 0;

    /* for client reconciliation */
    this.lastProcessedInput = 0;
  }

  shot(timestamp) {
    this.lastShootTime = timestamp;
  }

  toMessage() {
    return {
      ...super.toMessage(),
      size: this.size,
      isActivePlayer: false,
      frictionAir: this.body.frictionAir,
      // TODO: make as personal message
      lastProcessedInput: this.lastProcessedInput,
    }
  }

  toPersonalMessage() {
    return {
      ...super.toMessage(),
      size: this.size,
      isActivePlayer: true,
      lastProcessedInput: this.lastProcessedInput,
    }
  }
}

export default Player;