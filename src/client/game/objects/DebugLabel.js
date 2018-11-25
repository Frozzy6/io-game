class DebugLabel {
  constructor(scene, x, y, label = 'DebugLabel'){
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.label = label;

    this.create();
  }

  create(){
    this.text = this.scene.add
      .text(this.x, this.y)
      .setText(this.label)
      .setScrollFactor(0)
      .setColor('white')
      .setDepth(10)
      .setBackgroundColor('black');
  }

  setText(text) {
    this.text.setText(text);
  }
}

export default DebugLabel;