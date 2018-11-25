import AbstractComponent from './AbstractComponent';
import Button from './Button';
import DebugLabel from './DebugLabel';

class ButtonGroup extends AbstractComponent {
  constructor(props) {
    super(props);
    const {
      x,
      y,
      title,
    } = props;
    this.y = y;
    this.offset = 15;
    this.groupContainer = this.scene.add
      .container(x, y)
      .setScrollFactor(0)
      .setDepth(10);
    const titleText = new DebugLabel(this.scene, x, y, `----${title}----`);
    this.groupContainer.add(titleText.text);
  }

  addButton(label, onClick) {
    const buttonControl = new Button({
      scene: this.scene,
      y: this.y + this.offset,
      text: `[b]${label}`,
      onClick,
    });
    this.groupContainer.add(buttonControl.text);
    this.offset += 15;
  }
}

export default ButtonGroup;