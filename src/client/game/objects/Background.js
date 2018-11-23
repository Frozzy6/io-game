class Background {
  constructor(game) {
    this.game = game;
  }

  preload() {
    this.game.load.image('background', '/img/game/background-texture.png');
  }

  create(w, h) {
    this.background = this.game.add
      // .tileSprite(-500, -500, w + 1000, h + 1000, 'background')
      .tileSprite(0, 0, w, h, 'background')
      .setOrigin(0, 0)
  }

  setSize(w, h) {
    this.background.setSize(w, h);
  }
}

export default Background;