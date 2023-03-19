const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const colormap = require('colormap');

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

const sketch = ({ width, height }) => {
    const cols = 81;
    const rows = 27;
    const numCells = cols * rows;

    const gw = width * 0.9;
    const gh = height * 0.9;

    const cw = gw / cols;
    const ch = gh / rows;

    const mx = (width - gw) * 0.5;
    const my = (height - gh) * 0.5;

    const points = [];
    let x, y, n, lineWidth, color;
    let frequency = 0.002;
    let amplitude = 60;

    let colors = colormap({
      colormap: 'plasma',
      nshades: amplitude,
    });  

    
    const mask = {
      radius: width * 0.4,
      sides: 4,
      x: width * 0.5,
      y: height * 0.5,
    };

    for (let i = 0; i < numCells; i++) {
        x = (i % cols) * cw;
        y = Math.floor(i / cols) * ch;

        //n = random.noise2D(x, y, frequency, amplitude);
        n = random.gaussian(x, y);
        //x += n;
        //y += n; 
        
        lineWidth = math.mapRange(n, -amplitude, amplitude, 0, 10);
        color = colors[Math.floor(math.mapRange(n, -amplitude, amplitude, 0, amplitude))];

        points.push( new Point({ x, y, lineWidth, color }) );
        
    }

  return ({ context, width, height, frame }) => {
    context.fillStyle = 'darkblue';
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(mask.x, mask.y);

    drawPolygon({ context, radius: mask.radius, sides: mask.sides });

    context.clip();

    context.save();
    context.translate(-mask.x, -mask.y);
    context.translate(mx, my);
    context.translate(cw * 0.5, ch * 0.5);

    points.forEach(point => {
      n = random.noise3D(point.ix, point.iy, frame * 3, frequency, amplitude);
      point.x = point.ix + n;
      point.y = point.iy + n; 
    });

    let lastx, lasty;

    for  (let r = 0; r < rows; r++) {

      for(let c = 0; c < cols - 1; c++) {
        const curr = points[r * cols + c + 0];
        const next = points[r * cols + c + 1];

        //const mx = curr.x + (next.x - curr.x) * 0.5;
        //const my = curr.y + (next.y - curr.y) * 0.5;

        const mx = curr.x + (next.x - curr.x) * 0.5;
        const my = curr.y + (next.y - curr.y) * 5.5;
        

        if (!c){
          lastx = curr.x;
          lasty = curr.y;
        }
    
        context.beginPath();
        context.lineWidth = curr.lineWidth;
        context.lineCap = 'round';
        context.strokeStyle = curr.color;
        context.moveTo(lastx, lasty);

        context.quadraticCurveTo(curr.x, curr.y, mx, my);

        context.stroke();

        lastx = mx;
        lasty = my;

      }
    }

    context.restore();
    context.restore();

  };
};

canvasSketch(sketch, settings);

class Point {
    constructor ({x, y, lineWidth, color}) {
        this.x = x;
        this.y = y;
        this.lineWidth = lineWidth;
        this.color = color;

        this.ix = x;
        this.iy = y;
    }
}

const drawPolygon = ({ context, radius, sides }) => {
    const slice = Math.PI * 2 / sides;

    context.beginPath();
    context.moveTo(0, -radius);
    for (let i = 1; i < sides; i++) {
        const theta = i * slice - Math.PI * 0.5;
        context.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
    }
    context.closePath();
}
