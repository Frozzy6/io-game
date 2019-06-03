import ws from '../ws';
import { UserMessages } from '../../../common/dictionary';

const getAngleBetween = (a, b, c, d) => Phaser.Math.Angle.Between(a, b, c, d);

class Player {
  constructor(parent) {
    this.parent = parent;
    this.isJoined = false;
    this.lastUpdateMovement = -1;

    /* last timestamp of pricessed input */
    this.lastUpdateTS = 0;
    /* collection of user input for creating prediction */
    this.pendingInputs = [];
    this.movementGap = 50;
    /* TODO: need to recieve this param from server */
    this.movementSpeed = 0.8;
    /* data for reconciliation */
    this.inputSequenceNumber = 0;
    this.velocity = { x: 0, y: 0 };
    this.position = { x: 0, y: 0 };
    this.shootStart = false;
    this.shootHold = false;
    this.reload = false;
    // Weapon
    this.lastFireTime = 0;
    this.fireGap = 200;
    this.locked = false;
  }

  static preload(scene) {
    scene.load.image('whiteSmoke', '/img/particles/white-smoke.png');
    scene.load.atlas('flares', '/img/bullets/flares.png', '/img/bullets/flares.json');
    scene.load.image('fire', '/img/bullets/fire.png');
    scene.load.image('pl', '/img/game/user/pl.png');
    scene.load.image('hand', '/img/game/user/hand.png');
    scene.load.image('pistol', '/img/game/user/pistol.png');
  }

  create(data) {
    const addKey = key => this.parent.input.keyboard.addKey(key);
    this.isJoined = true;
    this.id = data.id;
    this.position = {
      x: data.x,
      y: data.y,
    };
    this.angle = data.angle;
    this.size = data.size;
    this.speed = 5;
    this.isActivePlayer = data.isActivePlayer;

    this.instance = this.parent.add.sprite(0, 0, 'pl');
    // this.instance.setDisplaySize(this.size * 3.8, this.instance.height / this.instance.width * this.size * 3.8);
    this.instance.setOrigin(0.5,0.5);

    /* for weapon */
    this.leftHand = this.parent.add.image(23, 6, 'hand');
    this.rightHand = this.parent.add.image(23, -6, 'hand');
    this.weapon = this.parent.add.image(35, 0, 'pistol');
    this.weapon.rotation = 1.5;

    this.graphics = this.parent.add.container(this.position.x, this.position.y);


    // this.physicsContainer = this.parent.matter.add.image(this.position.x, this.position.y, 'pl');
    // console.log(this.graphics.rotation);
    this.graphics.setDepth(3);

    // this.leftHand = this.parent.add.sprite(25, 20, 'hand');
    // this.rightHand = this.parent.add.sprite(25, -20, 'hand');
    // this.graphics.add(this.debugGraphics);
    this.graphics.add(this.leftHand);
    this.graphics.add(this.rightHand);
    this.graphics.add(this.weapon);
    this.graphics.setSize(50,50);
    this.graphics.add(this.instance);
    
    this.physicsContainer = this.parent.matter.add.gameObject(this.graphics);
    this.physicsContainer.setFrictionAir(0.3);
    this.physicsContainer.setMass(15);
    //dummy weapon
    // this.weapon = {
    //   name: 'machine gun',
    //   bullet: {
    //     sprite: 'bullet',
    //     size: { w: 15, h: 5 },
    //     velocity: {
    //       min: 10,
    //       max: 20
    //     },
    //     lifetime: 1000,
    //   },
    //   delay: { 
    //     min: 50, 
    //     max: 100,
    //     nextDelay: 0,
    //   },
    //   lastFired: 0,
    //   damage: 10,
    // };

    // Controls
    const { 
      W: keyW,
      S: keyS,
      A: keyA,
      D: keyD,
    } = Phaser.Input.Keyboard.KeyCodes;

    this.controls = {
      keyW: addKey(keyW),
      keyS: addKey(keyS),
      keyA: addKey(keyA),
      keyD: addKey(keyD),
      lbMouseDown: false,
    };

    this.parent.input.on('pointerdown', () => {
      this.controls.lbMouseDown = true
    });

    this.parent.input.on('pointerup', () => {
      this.controls.lbMouseDown = false
    });
    

    this.whiteSmoke = this.parent.add.particles('whiteSmoke').createEmitter({
      x: 0,
      y: 0,
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0.2 },
      blendMode: 'ADD',
      lifespan: 800,
      on: false
    });

    this.fireGap = 50;
    this.lastShootingtime = 0;
  }

  createBullet = (time) => {
    const { worldX, worldY } = this.parent.input.mousePointer;

    const { x: pX, y: pY } = this.player;

    const angle = getAngleBetween(pX, pY, worldX, worldY);

    const {
      size: { w: bulletWidth, h: bulletHeight},
      velocity: { min: minBV, max: maxBV}
    } = this.weapon.bullet;

    const bVel = Math.random() * (maxBV - minBV) + minBV;
    const bullet = this.parent.matter.add
      .sprite(pX + 35 * Math.cos(angle), pY + 35 * Math.sin(angle), "bullet")
      .setDisplaySize(bulletWidth, bulletHeight)

    this.whiteSmoke.setPosition(pX + 35 * Math.cos(angle), pY + 35 * Math.sin(angle));
    this.whiteSmoke.emitParticle(1);

    bullet.setVelocity(bVel * Math.cos(angle), bVel * Math.sin(angle));
    bullet.rotation = angle;
    bullet.timeCreated = time;
    bullet.lifetime = this.weapon.bullet.lifetime;
    this.bullets.push(bullet);
  }

  updateData(data) {
    this.position.x = data.x;
    this.position.y = data.y;
    this.velocity.x = data.vx;
    this.velocity.y = data.vy;
    this.angle = data.angle;

    this.physicsContainer.setPosition(this.position.x, this.position.y);
    this.physicsContainer.setVelocity(this.velocity.x, this.velocity.y);
  }

  updateOther() {
    if (this.graphics.rotation !== this.angle) {
      this.graphics.rotation = Phaser.Math.Angle.RotateTo(this.graphics.rotation, this.angle, 0.2)
    }
    // this.graphics.setPosition(this.position.x, this.position.y);
  }

  update(time) {
    // this.physicsContainer.setPosition(this.position.x, this.position.y);
    // this.physicsContainer.setVelocity(this.velocity.x, this.velocity.y);
    const { x: mouseX, y: mouseY } = this.parent.game.input.mousePointer;
    const { scrollX: camScrollX, scrollY: camScrollY } = this.parent.cameras.main;
    // Keys state 
    const {
      keyW,
      keyS,
      keyA,
      keyD,
      lbMouseDown,
    } = this.controls;

    this.shootStart = lbMouseDown;
    // if (lbMouseDown && time > this.fireGap + this.lastFireTime && !this.locked) {
    //   this.locked = true;
    //   this.parent.tweens.add({
    //     targets: this.weapon,
    //     x: 30,
    //     duration: this.fireGap * 2,
    //     yoyo: true,
    //     onComplete: () => { this.locked = false; },
    //   });
    //   this.parent.tweens.add({
    //     targets: [this.rightHand, this.leftHand],
    //     x: 21,
    //     duration: this.fireGap * 2,
    //     yoyo: true,
    //     delay: 10,
    //   });

    //   this.lastFireTime = time;
    // }

    if (time > this.lastUpdateMovement + this.movementGap) {
      /* Update timestamp */
      const currentTS = +new Date();
      const lastUpdateTS = this.lastUpdateTS || currentTS;
      const deltaSec = (currentTS - lastUpdateTS) / 1000;
      this.lastUpdateTS = currentTS;
      this.lastUpdateMovement = time;

      const message = {
        move: {
          up: keyW.isDown,
          down: keyS.isDown,
          left: keyA.isDown,
          right: keyD.isDown,
        },
        // angle: this.graphics.rotation,
        angle: 0,
        shotStart: this.shootStart,
        /* for server validation */
        press_time: deltaSec,
        inputSequenceNumber: this.inputSequenceNumber++,
      };

      this.pendingInputs.push(message);
      ws.emit(UserMessages.INPUT, message);
    }

    // this.graphics.x = this.position.x;
    // this.graphics.y = this.position.y;

    this.nextAngle = getAngleBetween(this.graphics.x, this.graphics.y, mouseX + camScrollX, mouseY + camScrollY);

    if (this.nextAngle !== this.angle) {
      this.graphics.setRotation(Phaser.Math.Angle.RotateTo(this.graphics.rotation, this.nextAngle, 0.3))
    }

    /* Debug line to cursor */
    // this.debugGraphics.lineStyle(2, 0x000);
    // this.debugGraphics.beginPath();
    // this.debugGraphics.moveTo(0, 0);
    // this.debugGraphics.lineTo(mouseX + camScrollX - this.position.x, mouseY + camScrollY - this.position.y);
    // this.debugGraphics.closePath();
    // this.debugGraphics.strokePath();

    // // Fire system
    // if (LBMouseDown && this.weapon.delay.nextDelay < time - this.weapon.lastFired) {

    
    // // Remove bullets 
    // for (var i = this.bullets.length - 1; i >= 0; i--) {
    //   const bullet = this.bullets[i];
    //   if (bullet.timeCreated + bullet.lifetime < time) {
    //     bullet.destroy();
    //     this.bullets.splice(i, 1);
    //   } else {
    //     if (Math.random() > .3) {
    //       this.flares.setPosition(bullet.x, bullet.y);
    //       this.flares.emitParticle(1);
    //     }
    //   }
    // }

    
    // this.flares.setSpeed(500)
  }


  destroy() {
    this.graphics.destroy();
  }
}

export default Player;