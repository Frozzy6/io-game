import ws from '../ws';

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // const { 
    //   centerX,
    //   centerY
    // } = this.physics.world.bounds;
    
    this.text = this.add.text(10, 10, 'loading', { font: '16px Arial', fill: '#dddddd', align: 'center' })
    this.text.setOrigin(0.5, 0.5);
    this.dotsCount = 0;
    this.lastChange = 0;
  }

  create() {
    ws.on('WORLD_INFO', (data) => {
      this.scene.stop('BootScene');
      this.scene.start('GameScene', data);
    });

    ws.emit('GET_WORLD_INFO');
  }


  update(time, delta) {
    if (time > this.lastChange) {
      this.text.setText('loading' + '.'.repeat(this.dotsCount));
      this.dotsCount += 1;
      this.lastChange = time + 150;
      if ( this.dotsCount > 6) {
        this.dotsCount = 0;
      }
    }
  }
}

export default BootScene;