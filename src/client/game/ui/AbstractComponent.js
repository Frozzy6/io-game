class AbstractComponent {
  constructor(props) {
    if (props.scene === null) {
      throw new Error('You probably forgot to set a scene');
    }
    this.scene = props.scene;
  }
}

export default AbstractComponent;
