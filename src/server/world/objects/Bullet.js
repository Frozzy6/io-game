import { defaults } from 'lodash';
import Matter from 'matter-js/src/module/main.js';

import PhysicsObject from './PhysicsObject';

const defaultParams = {
  width: 10,
  height: 20,
  startVelocity: 1.75,
  mass: 5,
  friction: 0.05,
}

class Bullet extends PhysicsObject {
  constructor(props) {
    const options = defaults(props, defaultParams);
    options.x = options.playerX + 40 * Math.cos(options.playerAngle);
    options.y = options.playerY + 40 * Math.sin(options.playerAngle);
    const body = Matter.Bodies.rectangle(options.x, options.y, options.width, options.height);
    Matter.Body.setAngle(body, options.playerAngle + 1.5);

    super({ ...options, body });
    this.options = options;
    
    if (options.world) {
      this.appendTo(options.world);
    }
  }

  toMessage() {
    return {
      primitive: this.options.primitive,
      texture: this.options.texture,
      width: this.options.width,
      height: this.options.height,
      ...super.toMessage()
    }
  }

  appendTo(world) {
    const {
      startVelocity,
      playerAngle,
    } = this.options;
    super.appendTo(world);
    
    Matter.Body.setVelocity(this.body, {
      x: startVelocity * Math.cos(playerAngle),
      y: startVelocity * Math.sin(playerAngle),
    })

    Matter.Body.applyForce(this.body, { x: this.body.position.x, y: this.body.position.y }, {
      x: startVelocity * Math.cos(playerAngle),
      y: startVelocity * Math.sin(playerAngle),
    });
  }
}

export default Bullet;
