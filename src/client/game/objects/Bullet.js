class Bullet {
  static preload(scene) {
    scene.load.image('bullet', '/img/bullets/bullet6.png');
  }

  constructor(scene, data) {
    this.parent = scene;
    this.size = 80;

    this.id = data.id;
    this.graphics = this.parent.add.container(data.from.x, data.from.y);
    this.graphics.setDepth(2);
    this.debugGraphics = this.parent.add.graphics({ lineStyle: { width: 2, color: 0xbbbb00 }, fillStyle: { color: 0xbbbb00 } });;
    this.debugRect = new Phaser.Geom.Rectangle(-data.width / 2, -data.height / 2, data.width, data.height);
    this.debugCircle = new Phaser.Geom.Circle(0, 0, 5);
    // this.instance = this.parent.add.sprite(0, 0, 'bullet');
    this.graphics.add(this.debugGraphics);
    // this.graphics.add(this.instance);

    // this.flares = this.parent.add.particles('flares').createEmitter({
    //   frame: 'red',
    //   x: data.position.x,
    //   y: data.position.y,
    //   lifespan: 300,
    //   speed: { min: 150, max: 600 },
    //   angle: 1.5,
    //   // gravityY: 300,
    //   scale: { start: 0.1, end: 0 },
    //   quantity: 3,
    //   // blendMode: 'ADD'
    // });

    this.updateData(data);
    this.position = data.position;
    // this.instance.setDisplaySize(data.width, data.height);
  }

  updateData(data) {
    this.position = data.position;
    this.angle = data.angle;
    // this.velocity = data.velocity;
    // this.flares.setAngle((data.angle +1.5)* 180 / Math.PI)
  }

  update(time) {
    this.debugGraphics.clear();
    // this.debugGraphics.fillRectShape(this.debugRect);
    // this.debugCircle.setPosition(this.position.x, this.position.y);
    // this.debugGraphics.fillCircleShape(this.debugCircle);
    // if (this.graphics.x != this.position.x && Math.abs(this.graphics.position.x - this.position.x) > 1) {
    //   this.graphics.x += 5;
    // }
    // // this.graphics.x = this.position.x;
    // if (this.graphics.y != this.position.y && Math.abs(this.graphics.position.y - this.position.y) > 1) {
    //   this.graphics.y += 5;
    // }
    // this.graphics.y = this.position.y;
    // this.graphics.rotation = this.angle;

    // if (Math.abs(this.velocity.x) > 3 || Math.abs(this.velocity.y) > 3) {
    //   this.flares.setPosition(this.position.x, this.position.y);
    //   this.flares.emitParticle(1);
    //   this.flares.on = true;
    // } else {
    //   this.flares.on = false;
    // }

  }
}

export default Bullet;