const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [1080, 1080],
};

const sketch = ({ width, height }) => {
  const cols = 12;
  const rows = 6;
  const numCells = cols * rows;

  const gw = width * 0.8;
  const gh = height * 0.8;

  const cw = gw / cols;
  const ch = gh / rows;

  const mx = (width - gw) * 0.5;
  const my = (height - gh) * 0.5;

  const points = [];
  let x, y;

  for (let i = 0; i < numCells; i++) {
      x = (i % cols) * cw;
      y = Math.floor(i / cols) * ch;
      points.push( new Point({ x, y }));
  }
    
  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(mx, my);
    points.forEach(point => {
      point.draw(context);
    })
    context.require();

  };
};


canvasSketch(sketch, settings);

class Point {
    constructor ({x, y}) {
        this.x = x;
        this.y = y;
    }

    draw(context) {
        context.save();
        context.translate(this.x, this.y);
        context.fillStyle = 'red';

        context.beginPath();
        context.arc(0, 0, 10, 0, Math.PI);
        context.fill();
        context.restore();
    }
}