class Box {
  constructor(parent) {
    this.parent = parent;
    this.size = 80;
  }

  preload() {
    const { parent } = this;
  }

  create(data) {
    this.id = data.id;
    this.updateData(data);


    this.graphics = this.parent.add.sprite(0, 0, "woodenBox");
    this.graphics.setDisplaySize(this.size, this.size);
  }

  updateData(data) {
    this.position = data.position;
    this.angle = data.angle;
  }

  update(time) {
    this.graphics.x = this.position.x.toFixed(2);
    this.graphics.y = this.position.y.toFixed(2);
    this.graphics.rotation = this.angle.toFixed(2);
  }
}

export default Box;