import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';

class Game {
  constructor(opts = {}) {
    const { Game } = Phaser;
    this.opts = opts;

    const config = {
      type: Phaser.AUTO,
      // pixelArt: true,
      roundPixels: true,
      width: window.innerWidth,
      height: window.innerHeight,
      autoResize: true,
      parent: "entry",
      scene: [
        BootScene, GameScene
      ]
    };

    this.game = new Game(config);
  }

}

export default Game;