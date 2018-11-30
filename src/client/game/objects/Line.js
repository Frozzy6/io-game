class Line {
  constructor(parent) {
    this.parent = parent;
  }

  create(data) {
    this.id = data.id;
    this.updateData(data);
    this.debugGraphics = this.parent.add.graphics({ lineStyle: { width: 2, color: 0xbbbb00 }, fillStyle: { color: 0xbbbb00 } });;
    this.debugRed = this.parent.add.graphics({ lineStyle: { width: 2, color: 0xff0000 }, fillStyle: { color: 0xff0000 } });;
    this.debugLine = new Phaser.Geom.Line(this.from.x, this.from.y, this.to.x, this.to.y);
    this.debugVec = new Phaser.Geom.Line(this.from.x, this.from.y, this.to.x, this.to.y);
    this.debugCircle = new Phaser.Geom.Circle(this.from.x, this.from.y, 5);
    this.debugAxis = new Phaser.Geom.Circle(this.from.x, this.from.y, 5);
  }

  updateData({ from, to, point, move, axis, pen }) {
    this.from = from;
    this.to = to;
    this.pen = pen;
    if (point) {
      this.point = point;
    }
    if (move) {
      this.move = move;
      console.log(move);
    }
  }

  update() {
    this.debugGraphics.clear();
    this.debugRed.clear();
    this.debugLine.setTo(this.from.x, this.from.y, this.to.x, this.to.y)
    this.debugGraphics.strokeLineShape(this.debugLine);
    if (this.point) {
      this.debugCircle.setPosition(this.point.x, this.point.y);
      this.debugGraphics.fillCircleShape(this.debugCircle);
    }
    if (this.move) {
      this.debugVec.setTo(this.point.x, this.point.y, this.point.x + this.move.x * 100, this.point.y + this.move.y * 100);
      this.debugGraphics.strokeLineShape(this.debugVec);
    }
  }


  destroy() {
    this.debugGraphics.destroy();
  }
}

export default Line;