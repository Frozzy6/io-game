import uuid from 'uuid';
import Matter from 'matter-js/src/module/main.js';

class PhysicsObject {
  constructor({body, mass, primitive, friction = 0.3}) {
    this.id = uuid.v4();
    this.body = body;
    this.body.gameObject = this;
    this.body.mass = mass;
    this.body.inverseMass = 1 / mass;
    this.body.friction = friction;
    this.body.frictionStatic = friction;
    this.body.frictionAir = friction;
    //TODO: remove and impliment later
    this.primitive = primitive;
  }

  appendTo(world) {
    Matter.World.add(world, this.body);
  }

  toMessage() {
    return {
      id: this.id,
      position: {
        x: Math.floor(this.body.position.x),
        y: Math.floor(this.body.position.y),
      },
      velocity: {
        x: Math.floor(this.body.velocity.x),
        y: Math.floor(this.body.velocity.y),
      },
      angle: parseFloat(this.body.angle.toFixed(2)),
    }
  }
}

export default PhysicsObject;