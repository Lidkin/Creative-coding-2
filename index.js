const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const Color = require('canvas-sketch-util/color');
const risoColors = require('riso-colors');

const settings = {
  dimensions: [1080, 1080],
};

const sketch = ({ context, width, height }) => {
  let x, y, w, h, fill, stroke;

  const num = 40;
  const degrees = -30;
  const arrows = [];
  const arrowColors = [
    random.pick(risoColors),
    random.pick(risoColors)
  ];

  const bgColor = random.pick(risoColors).hex;
  const tinyStroke = random.pick(risoColors).hex;
  const arrowStroke = random.pick(risoColors).hex;

  for (let i = 0; i < num; i++) {
    x = random.range(0, width);
    y = random.range(0, height);
    w = random.range(300, 700);
    h = random.range(50, 300);
    fill = random.pick(arrowColors).hex;
    stroke = random.pick(arrowColors).hex;

    arrows.push({ x, y, w, h, fill, stroke});
  }

  return ({ context, width, height }) => {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);
    
    arrows.forEach( arrow => {
      const { x, y, w, h, fill, stroke} = arrow;
      context.fillStyle = fill;

      context.save();
      context.translate(x, y);

      context.strokeStyle = stroke;
      context.lineWidth = 15;
  
      drawSkewedArrow({ context, w, h, degrees });
      
      context.fill();
      context.stroke();

      context.lineWidth = 3;
      context.strokeStyle = tinyStroke;
      context.stroke();

      //context.translate(x, y);
      drawTinyArrow({ context, w, h, degrees, arrowStroke});

      context.restore();
     
    })

  };
};

const drawSkewedArrow = ({ context, w, h, degrees}) => {
  const angle = math.degToRad(degrees);

  context.save();
  context.rotate(angle);
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(w, 0);
  context.lineTo(w * 0.8, h * 0.5);
  context.lineTo(w, h);
  context.lineTo(0, h);
  context.lineTo(w * -0.2, h * 0.5);
  context.closePath();
  context.restore();
  
}

const drawTinyArrow = ({ context, w, h, degrees, arrowStroke }) => {
  const angle = math.degToRad(degrees);
  context.save();
  context.lineWidth = 6;
  context.strokeStyle = arrowStroke;
  context.shadowColor = 'black';
  context.shadowBlur = 5;
  context.rotate(angle);
  context.beginPath();
  context.moveTo(w * 0.6 , h * 0.7);
  context.lineTo(w * 0.7, h * 0.5);
  context.lineTo(w * 0.6, h * 0.3);
  context.moveTo(0, h * 0.5);
  context.lineTo(w * 0.7, h * 0.5);
  context.stroke();
  context.restore();
}

canvasSketch(sketch, settings);
