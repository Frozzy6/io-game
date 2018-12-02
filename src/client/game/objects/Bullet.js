class Bullet {
  static preload(scene) {
    scene.load.image('b1', '/img/bullets/b1.png');
  }

  constructor(scene, data) {
    this.parent = scene;
    this.size = 80;

    this.id = data.id;
    this.graphics = this.parent.add.container(data.from.x, data.from.y);
    this.graphics.setDepth(2);
    this.debugGraphics = this.parent.add.graphics({ lineStyle: { width: 2, color: 0xbbbb00 }, fillStyle: { color: 0x000000 } });;
    this.debugRect = new Phaser.Geom.Rectangle(-data.width / 2, -data.height / 2, data.width, data.height);
    this.debugCircle = new Phaser.Geom.Circle(0, 0, 3);
    // this.instance = this.parent.add.sprite(0, 0, 'bullet');
    this.graphics.add(this.debugGraphics);
    // this.graphics.add(this.instance);
    this.particles = this.parent.add.particles('b1');
    this.flares = this.particles.createEmitter({
      // frame: 'red',
      x: 0,
      y: 0,
      lifespan: 100,
      speed: 0,
      angle: data.angle * 180 / Math.PI + 180,
      rotate: data.angle * 180 / Math.PI + 180 + 90,
      trackVisible: true,
      // gravityY: 300,
      scale: { start: 2, end: 0 },
      quantity: 10,
      follow: this.graphics,
      // blendMode: 'ADD'
    });
    this.updateData(data);
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
    // this.debugGraphics.fillCircleShape(this.debugCircle);
    this.graphics.x = this.position.x;
    this.graphics.y = this.position.y;
    // this.graphics.rotation = this.angle;
    // this.flares.setPosition(this.position.x, this.position.y);
    // this.flares.emitParticle(1);
  }

  destory() {
    this.particles.destroy();
    this.graphics.destroy();
  }
}

export default Bullet;