import DebugLabel from '../ui/DebugLabel';
import ButtonGroup from '../ui/ButtonGroup';
import Background from '../objects/Background';
import Player from '../objects/Player';
import ws from '../ws';
import Box from '../objects/Box';
import Bullet from '../objects/Bullet';
import { Messages, UserMessages, DebugMessages } from '../../../common/dictionary';

class GameScene extends Phaser.Scene {
  constructor() {
    console.log('Game constructor called');
    super({ 
      key: 'GameScene',
      active: false,
    });

    this.players = new Map();
    this.bullets = new Map();
    this.bulletsToRemove = [];
    this.gameObjects = new Map(); 
  }

  preload() {
    console.log('Game preload called');
    Background.preload(this);
    Player.preload(this);
    Box.preload(this);
    Bullet.preload(this);
  }

  createPlayer(data) {
    console.log(data)
    const player = new Player(this);
    player.create(data);
    if (data.isActivePlayer) {
      this.cameras.main.startFollow(player.graphics);
    }
    this.players.set(data.id, player);
  }

  removePlayer({ id }) {
    const player = this.players.get(id);
    if (player) {
      player.destroy();
    }
    this.players.delete(id);
  }

  create(data) {
    console.log('Game create called', data);
    /* When set to true this Input Plugin will emulate DOM behavior by only emitting events from the top-most Game Objects in the Display List.*/
    this.input.topOnly = true;

    const { WORLD_WIDTH, WORLD_HEIGHT, players } = data;
    this.cameras.main.setBounds(-100, -100, WORLD_WIDTH + 200, WORLD_HEIGHT + 200);
    this.cameras.main.setZoom(1);
    this.background = new Background({ scene: this, width: WORLD_WIDTH, height: WORLD_HEIGHT});

    /* Process players that already in the game */
    players.forEach((playerData) => {
      const player = new Player(this);
      player.create(playerData);
      this.players.set(playerData.id, player);
    });

    /* Create UI */
    this.fpsCounter = new DebugLabel(this, 0, 0);
    this.worldLabels = new DebugLabel(this, 0, 15);
    this.btnGroup = new ButtonGroup({
      scene: this,
      x: 0,
      y: 70,
      title: 'controls',
    });

    this.btnGroup.addButton('add box', () =>  ws.emit(DebugMessages.DEBUG_BOX_ADD));
    this.btnGroup.addButton('add 10 boxes', () => {
      for (let i = 0; i < 10; i++) {
        ws.emit(DebugMessages.DEBUG_BOX_ADD)
      }
    });

    this.btnGroup.addButton('add 25 boxes', () => {
      for (let i = 0; i < 25; i++) {
        ws.emit(DebugMessages.DEBUG_BOX_ADD)
      }
    });

    this.btnGroup.addButton('drop friction/angular f', () => {
      ws.emit(DebugMessages.DEBUG_BOX_FORCE);
    });

    /* Bind events */
    ws.on(Messages.WORLD_UPDATE, this.updateWorldObjects);
    /* Waiting when player will be added to the game */
    ws.on(Messages.PLAYER_JOINED, data => this.createPlayer(data));
    ws.on(Messages.PLAYER_LEFT, data => this.removePlayer(data));

    /* Emit initialize event */
    ws.emit(UserMessages.WANT_JOIN);
  }

  /* Update exists object or creates new */
  updateWorldObjects = (data) => {
    const { gameObjects } = this;
    const { 
      players,
      objects,
      bullets,
      bulletsToRemove,
    } = data;
    this.bulletsToRemove = this.bulletsToRemove.concat(bulletsToRemove);

    /* update players */
    players.map((playerData) => {
      // Is it me?
      if (playerData.isActivePlayer) {
        this.player.updateData(playerData);
      } else {
        const player = this.players.get(playerData.id);
        if (player) {
          player.updateData(playerData);
        }
      }
    });

    objects.forEach((obj) => {
      const gameObject = gameObjects.get(obj.id);
      if (!gameObject) {
        const gameObj = new Box(this);
        gameObj.create(obj);
        gameObjects.set(obj.id, gameObj);
      } else {
        gameObject.updateData(obj);
      }
    });

    bullets.forEach((data) => {
      const ray = gameObjects.get(data.id);
      if (ray) {
        ray.updateData(data);
      } else {
        const newRay = new Bullet(this, data);
        // newRay.create(data);
        gameObjects.set(data.id, newRay);
      }
    })
  }

  /* Redraw all object by its properties */
  update(time) {
    this.fpsCounter.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
    this.worldLabels.setText([
      `network(s/r): ${ws.sendedPckgPerSec}/${ws.recievedPckgPerSec}`,
      `objects: ${this.gameObjects.size + this.players.size}`,
      'screen x: ' + Math.round(this.input.x),
      'screen y: ' + Math.round(this.input.y),
      'world x: ' + Math.round(this.input.mousePointer.worldX),
      'world y: ' + Math.round(this.input.mousePointer.worldY),
    ]);

    if (this.player && this.player.isJoined) {
      this.player.update(time);
    }

    this.gameObjects.forEach(obj => obj.update());
    this.bullets.forEach(obj => obj.update());
    this.players.forEach((pl) => {
      if (pl.isActivePlayer) {
        pl.update(time)
      } else {
        pl.updateOther(time);
      }
    });

    this.bulletsToRemove.forEach(id => {
      const bullet = this.gameObjects.get(id);
      if (bullet) {
        bullet.destory();
        this.gameObjects.delete(id);
      }
    })
    this.bulletsToRemove = [];
  }
}

export default GameScene;