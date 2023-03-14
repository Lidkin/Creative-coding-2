const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const Color = require('canvas-sketch-util/color');
const risoColors = require('riso-colors');
const seed = '2023.03.14-16.16.06';

const settings = {
  dimensions: [1080, 1080],
  name: seed,
};

const sketch = ({ context, width, height }) => {
  let x, y, w, h, fill, stroke, blend;

  const num = 30;
  const degrees = -40;
  const arrows = [];
  const arrowColors = [random.pick(risoColors), random.pick(risoColors)];

  const mask = {
    radius: width * 0.55,
    sides: 6,
    x: width * 0.5,
    y: height * 0.5,
  };

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
   // blend = 'color-dodge';
    blend = random.value() > 0.5 ? 'source-over' : 'hard-light'; //screen, multiply, color-burn, luminosity, overlay, hard-light


    arrows.push({ x, y, w, h, fill, stroke, blend });
  };

  return ({ context, width, height }) => {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate( mask.x, mask.y );
    drawPolygon({ context, radius: mask.radius, sides: mask.sides });

    context.clip();

    arrows.forEach((arrow) => {
      const { x, y, w, h, fill, stroke, blend } = arrow;
      let shadowColor;

      context.save();
      context.translate(-mask.x, -mask.y);
      context.translate(x, y);

      context.fillStyle = fill;
      context.strokeStyle = stroke;
      context.lineWidth = 15;
      
      context.globalCompositeOperation = blend;

      drawSkewedArrow({ context, w, h, degrees });
/*
      shadowColor = Color.offsetHSL(fill, 0, 0, -30);
      shadowColor.rgba[3] = 0.5;

      context.shadowColor = Color.style(shadowColor.rgba);
      context.shadowOffsetX = -20;
      context.shadowOffsetY = 10;
*/
      context.fill();

      context.shadowColor = null;
      context.stroke();

      context.globalCompositeOperation = 'multiply';

      context.lineWidth = 3;
      context.strokeStyle = tinyStroke;
      context.stroke();

      context.globalCompositeOperation = 'source-over';
      drawTinyArrow({ context, w, h, degrees, arrowStroke });

      context.restore();
    });

    context.restore();

          //polygon outline

          context.save();
          context.translate(mask.x, mask.y);
          context.lineWidth = 40;
      
          drawPolygon({ context, radius: mask.radius - context.lineWidth, sides: mask.sides });  
      
          context.globalCompositeOperation = 'color-burn';
          context.strokeStyle = arrowColors[0].hex;
          shadowColor = Color.offsetHSL(fill, 0, 0, 20);
          shadowColor.rgba[3] = 0.5;
          context.shadowColor = Color.style(shadowColor.rgba);

          context.stroke();
          context.restore();

  };
};

const drawPolygon = ({ context, radius, sides }) => {
  const slice = Math.PI * 2 / sides;
  
  context.beginPath();
  context.moveTo(0, -radius);
  for(let i = 1; i < sides; i++) {
    const angle = i * slice - Math.PI * 0.5;
    context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  context.closePath();

};

const drawSkewedArrow = ({ context, w, h, degrees }) => {
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
};

const drawTinyArrow = ({ context, w, h, degrees, arrowStroke }) => {
  const angle = math.degToRad(degrees);

  context.save();
  context.lineWidth = h * 0.04;
  context.lineCap = 'round';
  context.strokeStyle = arrowStroke;
  context.rotate(angle);
  context.beginPath();
  context.moveTo(w * 0.6, h * 0.7);
  context.lineTo(w * 0.7, h * 0.5);
  context.lineTo(w * 0.6, h * 0.3);
  context.moveTo(0, h * 0.5);
  context.lineTo(w * 0.7, h * 0.5);
  context.stroke();
  context.restore();
};

canvasSketch(sketch, settings);
