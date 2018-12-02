import Matter from 'matter-js/src/module/main.js';
import getID from '../../../common/ids';

class PhysicsObject {
  constructor({body, mass, primitive, friction = 0.3}) {
    this.id = getID();
    this.body = body;
    this.body.gameObject = this;
    this.body.mass = mass;
    this.body.inverseMass = 1 / mass;
    this.body.friction = friction;
    this.body.frictionStatic = friction;
    this.body.frictionAir = friction;
  }

  appendTo(world) {
    Matter.World.add(world, this.body);
  }

  toMessage() {
    return {
      id: this.id,
      x: Math.floor(this.body.position.x),
      y: Math.floor(this.body.position.y),
      vx: Math.floor(this.body.velocity.x),
      vy: Math.floor(this.body.velocity.y),
      angle: parseFloat(this.body.angle.toFixed(2)),
    }
  }
}

export default PhysicsObject;