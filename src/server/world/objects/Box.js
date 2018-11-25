import { defaults } from 'lodash';

import PhysicsObject from './PhysicsObject';
import { Primitives } from '../../../common/dictionary';

const defaultParams = {
  width: 80,
  height: 80,
  x: 0,
  y: 0,
  primitive: Primitives.RECT,
  texture: 'box',
}

class Box extends PhysicsObject {
  constructor(props) {
    this.options = defaults(props, defaultParams);
    super(this.options);
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
