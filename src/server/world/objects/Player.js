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
  }

  toMessage() {
    return {
      ...super.toMessage(),
      size: this.size,
    }
  }

  toPersonalMessage = () => ({
    ...this.toMessage(),
    private: true
  })
}

export default Player;