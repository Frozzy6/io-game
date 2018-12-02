import Matter from 'matter-js/src/module/main.js';
import { defaults } from 'lodash';

import PhysicsObject from './PhysicsObject';
import { Objects } from '../../../common/dictionary';

const defaultParams = {
  radius: 10,
  x: 0,
  y: 0,
  width: 80,
  height: 80,
  mass: 40,
  type: Objects.BOX,
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
      ...super.toMessage(),
      type: this.options.type,
    }
  }
}

export default Box;
