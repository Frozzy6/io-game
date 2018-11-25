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
      position: {
        x: parseFloat(this.body.position.x.toFixed(1)),
        y: parseFloat(this.body.position.y.toFixed(1)),
      },
      velocity: {
        x: parseFloat(this.body.velocity.x.toFixed(1)),
        y: parseFloat(this.body.velocity.y.toFixed(1)),
      },
      angle: parseFloat(this.body.angle.toFixed(2)),
      size: this.size,
    }
  }
}

export default PhysicsObject;