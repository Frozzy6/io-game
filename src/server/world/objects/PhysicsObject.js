import uuid from 'uuid';

class PhysicsObject {
  constructor({body, mass, size = 100, friction = 0.3}) {
    this.id = uuid.v4();
    this.body = body;
    this.body.mass = mass;
    this.body.inverseMass = 1 / mass;
    this.body.friction = friction;
    this.body.frictionStatic = friction;
    this.body.frictionAir = friction;
    this.size = size;
  }

  setBody(body) {
    this.body = body;
  }

  toMessage() {
    return {
      id: this.id,
      position: this.body.position,
      velocity: this.body.velocity,
      angle: this.body.angle,
      size: this.size,
    }
  }
}

export default PhysicsObject;