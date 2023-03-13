const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const Color = require('canvas-sketch-util/color');
const risoColors = require('riso-colors');

const settings = {
  dimensions: [ 1080, 1080 ],
};

const sketch = ({ context, width, height }) => {
  let x, y, w, h;

  const degrees = -25;

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    x = width  * 0.5;
    y = height * 0.5;
    w = 300;
    h = 50;


    
    context.save();
    context.translate(x, y);
    context.strokeStyle = 'red';
    context.lineWidth = 10;

    drawSkewedRect({ context, w, h, degrees });
    
    context.stroke();
    context.restore();

  };
};  

  const drawSkewedRect = ({ context, w, h, degrees }) => {
    const angle = math.degToRad(degrees);
    const rx = Math.cos(angle) * w * 1.05;
    const ry = Math.sin(angle) * h * 1.05;
    const rh = Math.sin(math.degToRad(180) - angle) * h * 1.4;
    const x = 0;
    const y = 0;

    console.log(rh)

    context.save();
    context.translate(rx * -0.5, (ry + h) * -0.5);
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(rx, ry);
    context.lineTo(rx - rx * 0.1, ry - rh);
    context.lineTo(rx * 1.1, ry + h);
    context.lineTo(rx * 0.1, h);
    context.lineTo(rx * -0.1, -rh);
    context.closePath();
    context.restore();
  
  }

  canvasSketch(sketch, settings);