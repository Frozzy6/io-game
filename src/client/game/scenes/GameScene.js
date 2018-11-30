import DebugLabel from '../ui/DebugLabel';
import ButtonGroup from '../ui/ButtonGroup';
import Background from '../objects/Background';
import Player from '../objects/Player';
import ws from '../ws';
import Box from '../objects/Box';
import Bullet from '../objects/Bullet';
import Line from '../objects/Line';


class GameScene extends Phaser.Scene {
  constructor() {
    console.log('Game constructor called');
    super({ 
      key: 'GameScene',
      active: false,
    });

    this.players = new Map();
    this.bullets = new Map();
    this.gameObjects = new Map(); 
  }

  preload() {
    console.log('Game preload called');
    Background.preload(this);
    Player.preload(this);
    Box.preload(this);
    Bullet.preload(this);
  }

  createUser(playerData) {
    this.player = new Player(this);
    this.player.create(playerData);
    this.cameras.main.startFollow(this.player.graphics);
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

    this.btnGroup.addButton('add box', () => {
      ws.emit('DEBUG_BOX_ADD');
    });

    this.btnGroup.addButton('add 10 boxes', () => {
      for (let i = 0; i < 10; i++) {
        ws.emit('DEBUG_BOX_ADD');
      }
    });

    this.btnGroup.addButton('add 100 boxes', () => {
      for (let i = 0; i < 100; i++) {
        ws.emit('DEBUG_BOX_ADD');
      }
    });

    this.btnGroup.addButton('drop friction/angular f', () => {
      ws.emit('DEBUG_BOX_FORCE');
    });

    /* Bind events */
    ws.on('WORLD_UPDATE', this.updateWorldObjects);
    /* Waiting when player will be added to the game */
    ws.on('ADD_ME_SUCCESS', (playerData) => {
      this.createUser(playerData);
    });

    /* Emit initialize event */
    ws.emit('ADD_ME');
  }

  /* Update exists object or creates new */
  updateWorldObjects = (data) => {
    const { gameObjects } = this;
    const { 
      players,
      objects,
      bullets,
      rayBullets,
    } = data;

    /* update players */
    if (this.player && this.player.isJoined && players.length > 0) {
      players.map((playerData) => {
        // Is it me?
        if (playerData.id === this.player.id) {
          this.player.updateData(playerData);
        } else {
          const player = this.players.get(playerData.id);
          if (player) {
            player.updateData(playerData);
          } else {
            const newPlayer = new Player(this);
            newPlayer.create(playerData);
            this.players.set(playerData.id, newPlayer);
          }
        }
      });
    }

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

    bullets.forEach((bulletData) => {
      const bullet = gameObjects.get(bulletData.id);
      if (bullet) {
        bullet.updateData(bulletData)
      } else {
        gameObjects.set(bulletData.id, new Bullet(this, bulletData ));
      }
    });

    rayBullets.forEach((data) => {
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
      pl.updateOther(time);
    });
  }
}

export default GameScene;