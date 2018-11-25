import uuid from 'uuid';
import Matter from 'matter-js/src/module/main.js';
import PhysicsObject from './PhysicsObject';

class Player extends PhysicsObject {
  constructor(socket, pos, size) {
    super({
      body: Matter.Bodies.circle(pos.x, pos.y, size),
      size,
      mass: 15
    })

    this.socket = socket;
    this.hp = 100;
    this.movementSpeed = 0.3;
    this.body.frictionAir = 0.3;
    this.isAlive = true;
  }

  // getPublicData = () => ({
  //   id: this.id,
  //   hp: this.hp,
  //   angle: this.angle,
  //   position: this.position,
  //   velocity: this.velocity,
  // })

  toMessagePrivate = () => ({
    ...this.toMessage(),
    private: true
  })
}

export default Player;