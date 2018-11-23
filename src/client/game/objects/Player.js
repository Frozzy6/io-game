import ws from '../ws';

const getAngleBetween = (a, b, c, d) => Phaser.Math.Angle.Between(a, b, c, d);

class Player {
  constructor(parent) {
    this.parent = parent;
    this.isJoined = false;
    this.lastUpdateMovement = -1;
    this.movementGap = 50;
    this.velocity = { x: 0, y: 0 };
    // this.clock = new Phaser.Time.Clock(this.parent);
    // this.bullets = [];
  }

  preload() {
    const parent = this.parent;
    parent.load.image('bullet', '/img/bullets/bullet6.png');
    // particles 
    parent.load.image('whiteSmoke', '/img/particles/white-smoke.png');
    parent.load.image('flares', '/img/particles/yellow.png');
    parent.load.spritesheet('player', '/img/game/user/player.png', {frameWidth: 262, frameHeight: 157});
    parent.load.spritesheet('player_move', '/img/game/user/player_move.png', { frameWidth: 259, frameHeight: 180 });
  }

  create(data) {
    const addKey = key => this.parent.input.keyboard.addKey(key);
    this.isJoined = true;
    this.id = data.id;
    this.position = data.position;
    this.angle = data.angle;
    this.size = data.size;
    this.speed = 5;

    this.graphics = this.parent.add.container(this.position.x, this.position.y);
    this.graphics.setDepth(3);
    this.debugGraphics = this.parent.add.graphics({ lineStyle: { width: 2, color: 0xbbbb00 }, fillStyle: { color: 0xbbbb00 } });;
    this.debugCircle = new Phaser.Geom.Circle(0, 0, this.size);

    this.parent.anims.create({ 
      key: 'idle',
      frames: this.parent.anims.generateFrameNames('player'), 
      repeat: -1,
      frameRate: 11
    });

    this.parent.anims.create({
      key: 'move',
      frames: this.parent.anims.generateFrameNames('player_move'),
      repeat: -1,
      frameRate: 11
    });

    this.instance = this.parent.add.sprite(0, 0, 'player').play('idle');
    this.instance.setDisplaySize(this.size * 3.8, this.instance.height / this.instance.width * this.size * 3.8);
    this.instance.setOrigin(0.25,0.5);
    //dummy weapon
    this.weapon = {
      name: 'machine gun',
      bullet: {
        sprite: 'bullet',
        size: { w: 15, h: 5 },
        velocity: {
          min: 10,
          max: 20
        },
        lifetime: 1000,
      },
      delay: { 
        min: 50, 
        max: 100,
        nextDelay: 0,
      },
      lastFired: 0,
      damage: 10,
    };

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
    };
    

    // this.parent.input.on('pointerdown', this.createBullet);
    // for (var i = 0; i < frames.length; i++) {
    //   var x = Phaser.Math.Between(0, 800);
    //   var y = Phaser.Math.Between(0, 600);
    //   console.log(frames);
    //   this.parent.add.image(x, y, 'round', frames[i]);
    // }
    // this.game.input.on('pointermove', (pointer) => {
    //   console.log('locked', this.game.input.mouse.locked);
    //   if (this.game.input.mouse.locked) {
    //     console.log(pointer);
    //     this.cross.setPosition(
    //       this.cross.x + pointer.movementX,
    //       this.cross.y + pointer.movementY,
    //     )
    //   }
    // });

    this.graphics.add(this.debugGraphics);
    this.graphics.add(this.instance);

    this.flares = this.parent.add.particles('flares').createEmitter({
      x: 1600,
      y: 200,
      angle: { min: 0, max: 360 },
      scale: { start: 0.4, end: 0.2 },
      blendMode: 'SCREEN',
      lifespan: 500,
      on: false
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
    this.position.x = data.position.x;
    this.position.y = data.position.y;
    this.velocity.x = data.velocity.x;
    this.velocity.y = data.velocity.y;
    this.angle = data.angle;
  }

  updateOther() {
    if (this.graphics.rotation !== this.angle) {
      this.graphics.rotation = Phaser.Math.Angle.RotateTo(this.graphics.rotation, this.angle, 0.2)
      console.log(this.graphics.rotation, this.angle);
    }
    this.graphics.setPosition(this.position.x, this.position.y);
  }

  update(time) {
    this.debugGraphics.clear();
    this.debugGraphics.fillCircleShape(this.debugCircle);

    const { worldX, worldY, x: mouseX, y: mouseY } = this.parent.game.input.mousePointer;
    const { scrollX: camScrollX, scrollY: camScrollY } = this.parent.cameras.main;
  
    // // Keys state 
    const {
      keyW,
      keyS,
      keyA,
      keyD,
    } = this.controls;
    // const { primaryDown: LBMouseDown } = this.parent.input.activePointer;

    
    if (time > this.lastUpdateMovement + this.movementGap) {
      const directions = [0, 0];
      // // Horizontal movement
      if (keyA.isDown) {
        directions[0] = -1;
      } else if (keyD.isDown) {
        directions[0] = 1;
      }

      // Vertical movement
      if (keyW.isDown) {
        directions[1] = -1;
      } else if (keyS.isDown) {
        directions[1] = 1;
      }

      this.lastUpdateMovement = time;
      ws.emit('UPDATE_ME', {
        directions,
        angle: this.graphics.rotation,
      });
    }

    this.graphics.x = this.position.x;
    this.graphics.y = this.position.y;

    this.nextAngle = getAngleBetween(this.position.x, this.position.y, mouseX + camScrollX, mouseY + camScrollY) - 0.05;
    
    if (this.nextAngle !== this.angle) {
      this.graphics.rotation = Phaser.Math.Angle.RotateTo(this.graphics.rotation, this.nextAngle, 0.2)
    }

    if (Math.abs(this.velocity.x) > 1 || Math.abs(this.velocity.y) > 1) {
      this.instance.play('move', true);
    } else {
      this.instance.play('idle', true);
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
    //   this.createBullet(time);
    //   this.weapon.lastFired = time;
    //   this.weapon.delay.nextDelay = Math.floor(Math.random() * (this.weapon.delay.max - this.weapon.delay.min) + this.weapon.delay.min);
    // }
    
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

    // this.flares.setPosition(this.player.x, this.player.y);
    // this.flares.setSpeed(500)
    // this.flares.emitParticle(1);

  }


  destroy() {
    this.graphics.destroy();
  }
}

export default Player;