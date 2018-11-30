class Background {
  constructor({ scene, width, height }) {
    this.scene = scene;
    this.background = this.scene.add
      // .tileSprite(-500, -500, w + 1000, h + 1000, 'background')
      .tileSprite(0, 0, width, height, 'background')
      .setOrigin(0, 0)
  }

  static preload(scene) {
    scene.load.image('background', '/img/game/background-texture.png');
  }

  setSize(w, h) {
    this.background.setSize(w, h);
  }
}

export default Background;