import Matter from 'matter-js/src/module/main.js';
import PhysicsObject from './objects/PhysicsObject';
import Player from "./objects/Player";

class World {
  constructor({ sm, tickRate }) {
    this.sm = sm;
    this.tickRate = tickRate || 144;
    this.tickCounter = 0;

    this.WORLD_WIDTH = 800;
    this.WORLD_HEIGHT = 600;
    this.config = {
      defaultPlayer: {
        size: 30,
      },
    }

    this.physicsEngine = Matter.Engine.create({ enableSleeping: false });
    this.physicsEngine.world.gravity.x = 0;
    this.physicsEngine.world.gravity.y = 0;

    this.players = new Map();
    this.worldState = {
      objects: [],
    }
    
    this.generate();
    
    let prevDate = Date.now();
    setInterval(() => {
      const delta = Date.now() - prevDate;
      prevDate = Date.now();
      this.update(delta);
    }, 1000 / this.tickRate);
  }

  generate(){
    this.addGameObject(10, 10);
    this.addGameObject(100, 100);
    this.addGameObject(150, 150);
    this.addGameObject(250, 250);
    this.addGameObject(400, 400);
    this.addGameObject(450, 450);
    this.addGameObject(600, 400);

    this.topB = Matter.Bodies.rectangle(400, 0, 800, 10, { isStatic: true });
    this.bottomB = Matter.Bodies.rectangle(400, 600, 800, 10, { isStatic: true });
    this.leftB = Matter.Bodies.rectangle(0, 300, 10, 600, { isStatic: true });
    this.rightB = Matter.Bodies.rectangle(800, 300, 10, 600, { isStatic: true });

    Matter.World.add(this.physicsEngine.world, [this.topB, this.leftB, this.rightB, this.bottomB]);
  }

  addGameObject(x, y) {
    const box = Matter.Bodies.rectangle(x, y, 80, 80);
    box.slop = 0.01;
    box.frictionAir = 0.3;
    Matter.World.add(this.physicsEngine.world, [box]);
    const phObj = new PhysicsObject({body: box, mass: 40});

    this.worldState.objects.push(phObj);
  }

  collectWorldInfo() {
    const players = [];
    const playersIter = this.players.entries();
    for (let [key, p] of playersIter) {
      players.push(p.toMessage());
    }

    return {
      WORLD_WIDTH: this.WORLD_WIDTH,
      WORLD_HEIGHT: this.WORLD_HEIGHT,
      players,
    }
  }

  updatePlayer = (data, socket) => {
    const player = this.players.get(socket);
    //todo: remove socket if cant find player
    if (!player) {
      return false;
    }
    //TODO: change to up/down/left/right
    const { directions, angle } = data;
    const force = {
      x: directions[0],
      y: directions[1],
    };

    // normalize
    let len = force.x * force.x + force.y * force.y;
    let x, y;
    if (len > 0) {
      len = 1 / Math.sqrt(len);
      x = force.x * len * player.movementSpeed;
      y = force.y * len * player.movementSpeed;
      force.x = x;
      force.y = y;
    }


    // Matter.Body.setVelocity(player.body, force)
    // player.body.setVelocity(x,y);
    Matter.Body.applyForce(player.body, {
      x: player.body.position.x,
      y: player.body.position.y
    }, force);
    // Matter.Body.applyForce(this.boxA, { x: this.boxA.position.x, y: this.boxA.position.y }, { x: 0.01, y: 0.01 });
    // player.setPosition(position.x, position.y);
    Matter.Body.setAngle(player.body, angle);
  }

  addPlayer = (socket) => {
    const { WORLD_WIDTH, WORLD_HEIGHT } = this;
    const { defaultPlayer } = this.config;
    // Generate random position on the world
    const x = Math.floor(Math.random() * WORLD_WIDTH) + 1;
    const y = Math.floor(Math.random() * WORLD_HEIGHT) + 1;

    const player = new Player(socket, { x, y }, defaultPlayer.size);
    Matter.World.addBody(this.physicsEngine.world, player.body);
    this.players.set(socket, player);

    socket.emit('message', {
      type: 'ADD_ME_SUCCESS',
      data: player.toMessagePrivate(),
    });

    socket.broadcast.emit('message', {
      type: 'USER_JOINED',
      data: player.toMessage(),
    });

    return player;
  }

  removePlayer = (socket) => {
    const player = this.players.get(socket);
    if (!player) {
      console.log('user didn\'t join and left');
      return false;
    }
    console.log('user removed');
    Matter.World.remove(this.physicsEngine.world, player.body);
    this.players.delete(socket);

    this.sm.broadcast('USER_LEAVED', { id: player.id });
  }

  update(delta) {
    this.tickCounter++;
    Matter.Events.trigger(this.physicsEngine, 'tick', { timestamp: this.physicsEngine.timing.timestamp });
    Matter.Engine.update(this.physicsEngine, 1000 / 60);
    Matter.Events.trigger(this.physicsEngine, 'afterTick', { timestamp: this.physicsEngine.timing.timestamp });

    const players = [];
    const playersIter = this.players.entries();
    for (let [key, p] of playersIter) {
      players.push(p.toMessage());
    }

    this.sm.broadcast('WORLD_UPDATE', {
      players,
      objects: this.worldState.objects.map(o => o.toMessage()),
    });
    this.sendDebugMessage(delta);
  }

  sendDebugMessage(delta) {
    /* forming debug data */
    var bodies = Matter.Composite.allBodies(this.physicsEngine.world);
    var cache = [];
    const b = JSON.stringify(bodies, function (key, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Duplicate reference found
          try {
            // If this value does not reference a parent it can be deduped
            return JSON.parse(JSON.stringify(value));
          } catch (error) {
            // discard key if value cannot be deduped
            return;
          }
        }
        // Store value in our collection
        cache.push(value);
      }
      return value;
    });
    this.sm.broadcast('DEBUG', { bodies: JSON.parse(b), delta });
  }
}

export default World;