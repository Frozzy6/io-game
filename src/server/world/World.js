import Matter, { 
  Events,
  Engine,
  Query,
  Composite,
  Vector,
} from 'matter-js/src/module/main.js';
import getID from '../../common/ids';
import { Messages, DebugMessages } from '../../common/dictionary';
import Box from './objects/Box';
import Player from './objects/Player';
import Bullet from './objects/Bullet';

class World {
  constructor({ sm, tickRate }) {
    this.sm = sm;
    this.tickRate = tickRate || 144;
    this.tickCounter = 0;
    this.updatesPerSec = 0;
    this.WORLD_WIDTH = 1200;
    this.WORLD_HEIGHT = 800;

    this.physicsEngine = Matter.Engine.create({ enableSleeping: false });
    this.physicsEngine.world.gravity.x = 0;
    this.physicsEngine.world.gravity.y = 0;

    this.players = new Map();
    this.worldState = {
      objects: [],
      bullets: new Map(),
    }
    
    this.generate();
    
    let prevDate = Date.now();
    setInterval(() => {
      const delta = Date.now() - prevDate;
      prevDate = Date.now();
      this.update(delta);
    }, 1000 / this.tickRate);

    /* DEBUG ONLY MESSAGES */
    setInterval(() => {
      this.sendDebugMessage();
    }, 100);

    this.sm.on(DebugMessages.DEBUG_BOX_FORCE, () => {
      this.worldState.objects.forEach(({ body }) => {
        body.slop = 0.05;
        body.friction = 0.0001;
        body.frictionStatic = 0.0001;
        body.frictionAir = 0.0001;
        Matter.Body.setAngularVelocity(body, 1)
      });
    });

    this.sm.on(DebugMessages.DEBUG_BOX_ADD, () => {
      const x = Math.round(Math.random() * this.WORLD_WIDTH);
      const y = Math.round(Math.random() * this.WORLD_HEIGHT);
      this.addGameObject(x, y);
    });

    setInterval(() => {
      console.log('ticks/sec: ', this.updatesPerSec, '[o]: ', this.worldState.objects.length);
      this.updatesPerSec = 0;
    }, 1000)
  }

  generate(){
    const { 
      WORLD_WIDTH,
      WORLD_HEIGHT,
    } = this;

    this.addGameObject(100, 100);
    this.addGameObject(150, 150);
    this.addGameObject(250, 250);
    this.addGameObject(350, 350);
    this.addGameObject(450, 450);


    // Create edges of the world
    const topB = Matter.Bodies.rectangle(WORLD_WIDTH / 2, 0, WORLD_WIDTH, 10, { isStatic: true });
    const bottomB = Matter.Bodies.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT, WORLD_WIDTH, 10, { isStatic: true });
    const leftB = Matter.Bodies.rectangle(0, WORLD_HEIGHT / 2, 10, WORLD_HEIGHT, { isStatic: true });
    const rightB = Matter.Bodies.rectangle(WORLD_WIDTH, WORLD_WIDTH / 2, 10, WORLD_WIDTH, { isStatic: true });

    Matter.World.add(this.physicsEngine.world, [topB, leftB, rightB, bottomB]);
  }

  addGameObject(x, y) {
    const box = new Box({x, y});
    box.appendTo(this.physicsEngine.world);
    this.worldState.objects.push(box);
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
    const { move, angle, shotStart, inputSequenceNumber } = data;
    player.lastProcessedInput = inputSequenceNumber;
    player.shotStart = shotStart;

    const force = {
      x: (move.left ? -1 : (move.right ? 1 : 0)),
      y: (move.up ? -1 : (move.down ? 1 : 0)),
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

    // Apply a force to change user position
    Matter.Body.applyForce(player.body, {
      x: player.body.position.x,
      y: player.body.position.y
    }, force);

    // That an angle from user to mouse cursor
    Matter.Body.setAngle(player.body, angle);
  }

  addPlayer = (socket) => {
    const { WORLD_WIDTH, WORLD_HEIGHT } = this;

    // Generate random position on the world
    const x = Math.floor(Math.random() * WORLD_WIDTH) + 1;
    const y = Math.floor(Math.random() * WORLD_HEIGHT) + 1;

    const player = new Player(socket, { x, y });
    Matter.World.addBody(this.physicsEngine.world, player.body);
    this.players.set(socket, player);

    this.sm.broadcast(Messages.PLAYER_JOINED, player.toMessage(), socket);
    this.sm.sendTo(socket, {
      type: Messages.PLAYER_JOINED,
      data: player.toPersonalMessage(),
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

    this.sm.broadcast(Messages.PLAYER_LEFT, { id: player.id });
  }

  playerShoot = (socket) => {
    const player = this.players.get(socket);
    if (!player || !player.isAlive) {
      console.log('player didnt finded')
      return false;
    }

    const {
      angle,
      position: { x, y },
    } = player.body;

    const bullet = new Bullet({
      playerX: x,
      playerY: y,
      playerAngle: angle,
      world: this.physicsEngine.world,
    });

    this.worldState.bullets.push(bullet);
  }

  playerShootRay = (socket) => {
    const player = this.players.get(socket);
    const { bullets } = this.worldState;
    const { 
      angle,
      position: {
        x, 
        y
      } 
    } = player.body;
    const length = 50;
    
    const id = getID();
    bullets.set(id, {
      id,
      own: player.id,
      angle,
      from: {
        x: x + 70 * Math.cos(angle),
        y: y + 70 * Math.sin(angle),
      },
      to: {
        x: x + (70 + length) * Math.cos(angle),
        y: y + (70 + length) * Math.sin(angle),
      },
    });
  }

  update(delta) {
    const { physicsEngine } = this;
    const { timestamp } = physicsEngine.timing;
    /* Update physics */
    this.updatesPerSec++;
    this.tickCounter++;
    Events.trigger(physicsEngine, 'tick', { timestamp });
    Engine.update(physicsEngine, 1000 / 60);
    Events.trigger(physicsEngine, 'afterTick', { timestamp });

    /* Process shooting */
    const players = [];
    this.players.forEach((player) => {
      if (player.shotStart && timestamp > player.lastShootTime + player.fireGap) {
        this.playerShootRay(player.socket);
        player.lastShootTime = timestamp;
      }
      players.push(player.toMessage());
    });

    const bodies = Composite.allBodies(physicsEngine.world);

    const { bullets } = this.worldState;
    const bulletsToRemove = [];
    bullets.forEach((ray) => {
      if (ray.stop) {
        return;
      }
      /*
        Query ray create new rectangle object with from between points
        with "rayWidth" width and check collisions between new rect and objects
       */
      const collisions = Query.ray(bodies, ray.from, ray.to).filter(c => c.body);
      
      if (collisions.length === 0) {
        return;
      } 
      let withClosestObject = null;
      /* Detect closest object to player was hitted */
      if (collisions.length > 1) {

      } else {
        withClosestObject = collisions[0];
      }

      const fcol = collisions[0];
      ray.stop = true;
      // for (let i = 0; i <= 1; i++ ) {
      //   const stepX = (ray.to.x - ray.from.x) / 1 * i;
      //   const stepY = (ray.to.y - ray.from.y) / 1 * i;
      //   var r = Query.point([fcol.body], {
      //     x: ray.from.x + stepX,
      //     y: ray.from.y + stepY,
      //   });
      //   // console.log(r);
      //   if (r.length > 0) {
      //     ray.point = {
      //       x: ray.from.x + stepX,
      //       y: ray.from.y + stepY,
      //     }
      //     ray.position = ray.point;
      //     break;
      //   }
      // }

      ray.position = {
        x: ray.from.x + (ray.to.x - ray.from.x) / 2,
        y: ray.from.y + (ray.to.y - ray.from.y) / 2,
      }
      const v = Matter.Vector.normalise({
        x: ray.to.x - ray.from.x,
        y: ray.to.y - ray.from.y,
      });
      Matter.Body.applyForce(fcol.body, {
          x: ray.position.x,
          y: ray.position.y,
        }, {
          x: v.x * 0.1,
          y: v.y * 0.1,
        });
      bulletsToRemove.push(ray.id);
      bullets.delete(ray.id);
    });

    bullets.forEach((ray) => {
      if (ray.stop) {
        return;
      }
      const { from, to } = ray;
      const delta = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
      ray.from.x += delta * Math.cos(ray.angle);
      ray.from.y += delta * Math.sin(ray.angle);
      ray.to.x += delta * Math.cos(ray.angle);
      ray.to.y += delta * Math.sin(ray.angle);
      ray.position = {
        x: ray.from.x + (ray.to.x - ray.from.x) / 2,
        y: ray.from.y + (ray.to.y - ray.from.y) / 2,
      }
    });

    this.sm.broadcast(Messages.WORLD_UPDATE, {
      /* Players state */
      players,
      /* Game Object */
      objects: this.worldState.objects.map(o => o.toMessage()),
      newObjects: [],
      /* Bullets */
      bullets: Array.from(bullets).reduce((acc, item) => (acc.push(item[1]), acc), []),
      bulletsToRemove,
    });
    /*
      Thoughts about world update message
      it should be like: 
      1. array of items to remove
      2. array with information of objects update
      3. array players update
      4. array of new bullets
      5. etc
    */
  }

  sendDebugMessage(delta) {
    /* forming debug data */
    var bodies = Composite.allBodies(this.physicsEngine.world);
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
    this.sm.broadcast('DEBUG', {
      world: {
        WORLD_WIDTH: this.WORLD_WIDTH, 
        WORLD_HEIGHT: this.WORLD_HEIGHT,
      },
      bodies: JSON.parse(b), 
    });
  }
}

export default World;
