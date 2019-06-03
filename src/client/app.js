import Game from './game/Game';
import ws from './game/ws';

class App {
  constructor(){
    this.ws = ws;
  }

  initGame() {
    this.game = new Game();
  }
}

const app = new App();
app.initGame();

window.addEventListener('contextmenu', function (e) {
  e.preventDefault();
}, false);

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');


canvas.width = 1000;
canvas.height = 800;
canvas.style.width = '400px';
canvas.style.height = '300px';

canvas.style.border = "1px solid black";
canvas.style.margin = "5px";
canvas.style.position = "absolute";
canvas.style.right = "0px";
canvas.style.bottom = "0px";
document.getElementById('entry').appendChild(canvas);
const p = document.createElement('p');
p.style.border = "1px solid black";
p.style.margin = "5px";
p.style.position = "absolute";
p.style.right = "0px";
p.style.bottom = "0px";
p.style.background = 'white';
p.style.color = 'black';
p.style.fontWeight = 'bold';
document.getElementById('entry').append(p);


ws.on('DEBUG', ({ bodies, world }) => {
  canvas.width = world.WORLD_WIDTH;
  canvas.height = world.WORLD_HEIGHT;
  p.textContent = 'server state';
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < bodies.length; i += 1) {
    if (!bodies[i]) {
      continue;
    }
    context.fillStyle = bodies[i].render.fillStyle;
    context.beginPath();
    var vertices = bodies[i].vertices;

    context.moveTo(vertices[0].x, vertices[0].y);

    for (var j = 1; j < vertices.length; j += 1) {
      context.lineTo(vertices[j].x, vertices[j].y);
    }

    context.lineTo(vertices[0].x, vertices[0].y);
    context.closePath();
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = bodies[i].render.strokeStyle;
    context.stroke();
  }

})
