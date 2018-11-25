import AbstractComopnent from './AbstractComponent';

const defaults = {
  color: 'white',
  bgColor: 'black',
  hoverColor: '#efefef'
}

class Button extends AbstractComopnent {
  constructor(props) {
    super(props);
    this.text = this.scene.add
      .text(props.x, props.y)
      .setText(props.text)
      .setColor(props.color || defaults.color)
      .setBackgroundColor(props.bgColor || defaults.bgColor)
      .setScrollFactor(0)
      .setInteractive()

    this.text.on('pointerover', () => {
      console.log('over')
      this.text.setColor('black')
      this.text.setBackgroundColor(props.hoverColor || defaults.hoverColor)
    });

    this.text.on('pointerout', () => {
      console.log('out')
      this.text.setColor('white')
      this.text.setBackgroundColor(props.bgColor || defaults.bgColor)
    });
  }

  onClick(cb) {
    this.text.on('pointerdown', cb);
  }
} 

export default Button;