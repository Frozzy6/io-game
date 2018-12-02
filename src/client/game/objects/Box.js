class Box {
  constructor(parent) {
    this.parent = parent;
    this.size = 80;
    this.position = {
      x: 0,
      y: 0,
    };
  }

  static preload(scene) {
    scene.load.image('woodenBox', '/img/game/box3.png');
    // scene.load.image('woodenBox2', '/img/game/box2.jpg');
  }

  create(data) {
    this.id = data.id;
    this.updateData(data);


    this.graphics = this.parent.add.sprite(0, 0, "woodenBox");
    this.graphics.setDisplaySize(this.size, this.size);
  }

  updateData(data) {
    this.position.x = data.x;
    this.position.y = data.y;
    this.angle = data.angle;
  }

  update(time) {
    this.graphics.x = this.position.x.toFixed(2);
    this.graphics.y = this.position.y.toFixed(2);
    this.graphics.rotation = this.angle.toFixed(2);
  }
}

export default Box;