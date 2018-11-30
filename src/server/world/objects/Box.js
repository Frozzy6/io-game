import Matter from 'matter-js/src/module/main.js';
import { defaults } from 'lodash';

import PhysicsObject from './PhysicsObject';
import { Primitives, Textures } from '../../../common/dictionary';

const defaultParams = {
  radius: 10,
  x: 0,
  y: 0,
  width: 80,
  height: 80,
  mass: 40,
  primitive: Primitives.RECT,
  texture: Textures.BOX,
  size: 80,
}

class Box extends PhysicsObject {
  constructor(props) {
    const options = defaults(props, defaultParams);
    const body = Matter.Bodies.rectangle(options.x, options.y, 80, 80);
    super({ ...options, body });
    this.options = options;
    this.body.slop = 0.01;
  }

  toMessage() {
    return {
      primitive: this.options.primitive,
      texture: this.options.texture,
      ...super.toMessage()
    }
  }
}

export default Box;
