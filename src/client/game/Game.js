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
      physics: {
        default: 'matter',
        matter: {
          debug: true,
          gravity: {
            x: 0,
            y: 0
          },
        }
      },
      scene: [
        BootScene,
        GameScene,
      ]
    };

    this.game = new Game(config);
  }

}

export default Game;