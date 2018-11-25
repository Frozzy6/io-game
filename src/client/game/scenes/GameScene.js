import DebugLabel from '../objects/DebugLabel';
import Button from '../objects/Button';
import ButtonGroup from '../objects/ButtonGroup';
import Background from '../objects/Background';
import Player from '../objects/Player';
import ws from '../ws';
import Box from '../objects/Box';

class GameScene extends Phaser.Scene {
  constructor() {
    console.log('Game constructor called');
    super({ 
      key: 'GameScene',
      active: false,
    });
    this.players = new Map();
    this.gameObjects = new Map();
    this.playersToDestroy = [];
    this.lastUpdateTime = 0;
    ws.on('ADD_ME_SUCCESS', (playerData) => {
      this.createUser(playerData);
    });
  }

  createUser(playerData) {
    console.log(playerData);
    this.player.create(playerData);
    this.cameras.main.startFollow(this.player.graphics);
  }

  preload() {
    console.log('Game preload called');
    this.load.image('woodenBox', '/img/game/box.png');
    this.background = new Background(this);
    this.background.preload();

    this.player = new Player(this);
    this.player.preload();
  }

  create(data) {
    ws.emit('ADD_ME');
    console.log('Game create called', data);
    this.input.topOnly = true;
    this.boundsGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0x0000aa }, fillStyle: { color: 0xaa0000 } });
    this.boundsRect = new Phaser.Geom.Rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    const { WORLD_WIDTH, WORLD_HEIGHT, user, players } = data;
    this.cameras.main.setBounds(-100, -100, WORLD_WIDTH + 200, WORLD_HEIGHT + 200);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cameras.main.setZoom(1);
    this.background.create(WORLD_WIDTH, WORLD_HEIGHT);

    /* Process players that already in the game */
    players.forEach((playerData) => {
      const player = new Player(this);
      player.create(playerData);
      this.players.set(playerData.id, player);
    });

    ws.on('USER_JOINED', (playerData) => {
      console.log(playerData)
      const player = new Player(this);
      player.create(playerData);
      this.players.set(playerData.id, player);
    });


    ws.on('USER_LEAVED', ({ id }) => {
      console.log('player leaved', id);
      this.playersToDestroy.push(id);
    })


    ws.on('WORLD_UPDATE', this.updateWorldObjects);
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
  }

  updateWorldObjects = (data) => {
    const { gameObjects } = this;
    const { players } = data;

    /* update players */
    if (this.player.isJoined && players.length > 0) {
      players.map((playerData) => {
        // Is it me?
        if (playerData.id === this.player.id) {
          this.player.updateData(playerData);
        } else {
          const player = this.players.get(playerData.id);
          player.updateData(playerData);
        }
      });
    }

    data.objects.forEach((obj) => {
      const gameObject = gameObjects.get(obj.id);
      if (!gameObject) {
        const gameObj = new Box(this);
        gameObj.create(obj);
        gameObjects.set(obj.id, gameObj);
      } else {
        gameObject.updateData(obj);
      }
    });

    const stopDate = +(new Date());
    // console.log('updates per sec', Math.floor(1000 / ( stopDate - this.lastUpdateTime)));
    this.lastUpdateTime = stopDate;
  }


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

    this.boundsGraphics.clear();
    this.boundsGraphics.strokeRectShape(this.boundsRect);

    if (this.player.isJoined) {
      this.player.update(time);
    }

    this.gameObjects.forEach(obj => obj.update());

    this.players.forEach((pl) => {
      pl.updateOther(time);
    });

    if (this.playersToDestroy.length > 0) {
      this.playersToDestroy.map((id) => {
        const player = this.players.get(id);
        player.destroy();
        this.players.delete(id);
      })
      this.playersToDestroy = []; 
    }
  }
}

export default GameScene;