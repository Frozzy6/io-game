class DebugLabel {
  constructor(game, x, y, label = 'DebugLabel'){
    this.game = game;
    this.x = x;
    this.y = y;
    this.label = label;

    this.create();
  }

  create(){
    this.text = this.game.add
      .text(this.x, this.y)
      .setText(this.label)
      .setScrollFactor(0)
      .setColor('white')
      .setBackgroundColor('black');
  }

  setText(text) {
    this.text.setText(text);
  }
}

export default DebugLabel;