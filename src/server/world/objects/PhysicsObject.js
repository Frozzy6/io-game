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
      x: +this.body.position.x.toFixed(2),
      y: +this.body.position.y.toFixed(2),
      vx: +this.body.velocity.x.toFixed(2),
      vy: +this.body.velocity.y.toFixed(2),
      angle: parseFloat(this.body.angle.toFixed(2)),
    }
  }
}

export default PhysicsObject;