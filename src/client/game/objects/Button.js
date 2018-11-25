import { defaults } from 'lodash';

import AbstractComopnent from './AbstractComponent';

const defaultParams = {
  color: 'white',
  bgColor: 'black',
  x: 0,
  y: 0,
  onClick: () => { 
    console.log('forgot set onClick prop to Button');
  }
}

class Button extends AbstractComopnent {
  constructor(props) {
    const {
      x,
      y,
      text,
      color,
      bgColor,
      onClick,
    } = defaults(props, defaultParams);
    super(props);

    this.text = this.scene.add
      .text(x, y)
      .setText(text)
      .setColor(color)
      .setBackgroundColor(bgColor)
      .setScrollFactor(0)
      .setDepth(10)
      .setInteractive();

    this.text.on('pointerover', () => {
      this.text.setColor(bgColor);
      this.text.setBackgroundColor(color);
    });

    this.text.on('pointerout', () => {
      this.text.setColor(color);
      this.text.setBackgroundColor(bgColor);
    });

    if (onClick) {
      this.onClick(onClick);
    }
  }

  onClick(cb) {
    this.text.on('pointerdown', function() {
      /* Call callback and prevent another events */
      const { stopPropagation } = arguments[3];
      cb(...arguments);
      stopPropagation();
    });
  }
} 

export default Button;