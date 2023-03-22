const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const colormap = require('colormap');

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

let radius, eyeRadius, n, color;
let manager;
let audio;
let audioContext, audioData, sourceNode, analyserNode;
let minDb, maxDb, bin;

const sketch = ({ width, height }) => {
  const eyelidW = width * 0.8;
  const eyelidH = height * 0.8;
  const diff = (width - eyelidW) * 0.5;
  eyeRadius = eyelidH * 0.5;
  const startPX = diff;
  const startPY = height * 0.5;
  const bins = [];

  for (let i = 0; i < diff; i++) {
    bin = random.rangeFloor(4, 64);
    bins.push(bin);
  }

  let colors = colormap({
    colormap: 'electric',
    nshades: diff,
  });

  return ({ context, width, height }) => {
    context.fillStyle = '#FFEBAD';
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(startPX, startPY);
    drawEye(context, eyelidW, diff, 0, 0);
    context.restore();

    if (!audioContext) return;

    analyserNode.getFloatFrequencyData(audioData);

    context.save();
    context.translate(startPX, startPY);

    for (let i = 0; i < bins.length - 5; i++) {
      bin = bins[i];
      n = math.mapRange(audioData[bin], minDb, maxDb, 0, 1, true);
      radius = math.mapRange(audioData[bin], minDb, maxDb, 150, 10, true);
      let rad = math.mapRange(audioData[bin], minDb, maxDb, 0, 50, true);
      color =
        colors[
          Math.floor(
            math.mapRange(audioData[bin], minDb, maxDb, 0, colors.length)
          )
        ];

      context.save();
      context.translate(-startPX, -startPY);
      context.translate(width * 0.5, height * 0.5);
      context.fillStyle = '#EEEAE0';
      drawCircle(context, 0, 0, eyelidW * 0.5);
      context.fillStyle = color;
      drawCircle(context, 0, 0, width * 0.2);
      context.lineWidth = 10;
      context.stroke();
      context.fillStyle = '#2D2424';
      drawCircle(context, 0, 0, radius);
      context.fillStyle = 'white';
      drawCircle(context, 55, -50, rad);
      context.restore();
    }
    drawEye(context, eyelidW, diff, n * 1.2, n);

    context.restore();
  };
};

const drawCircle = (context, x, y, radiusC) => {
  context.beginPath();
  context.arc(x, y, radiusC, 0, Math.PI * 2);
  context.fill();
}

const drawEye = (context, eyelidW, diff, n1, n2) => {

  context.fillStyle = '#FFF6BF';
  context.strokeStyle = '#483434';
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(0, 0);
  drawArc(context, eyelidW, diff, n1);
  context.rotate(Math.PI);
  drawArc(context, -eyelidW, -diff, n2);
  context.fill();
  context.stroke();

}

const drawArc = (context, eyelidW, diff, n) => {
  context.bezierCurveTo(
    0,
    eyeRadius * 1.32,
    eyelidW,
    eyeRadius * 1.32,
    eyelidW,
    0
  );
  context.bezierCurveTo(
    eyelidW - diff,
    eyeRadius * n,
    diff,
    eyeRadius * n,
    0,
    0
  );
};

const addListeners = () => {
  window.addEventListener('mouseup', () => {
    if (!audioContext) createAudio();

    if (audio.paused) {
      audio.play();
      manager.play();
    } else {
      audio.pause();
      manager.pause();
    }
  });
};

const createAudio = () => {
  audio = document.createElement('audio');

  audio.crossOrigin = 'anonymous';
  audio.src =
    'https://cdn.pixabay.com/download/audio/2022/03/05/audio_f1012306c6.mp3?filename=terra-incognita-22068.mp3';
  // audio.src = 'audio/Sémø - Fractured Timeline.mp3';

  audioContext = new AudioContext();

  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(audioContext.destination);

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 512;
  analyserNode.smoothingTimeConstant = 0.7;
  sourceNode.connect(analyserNode);

  minDb = analyserNode.minDecibels;
  maxDb = analyserNode.maxDecibels;

  console.log(minDb, maxDb);

  audioData = new Float32Array(analyserNode.frequencyBinCount);
};

const start = async () => {
  addListeners();
  manager = await canvasSketch(sketch, settings);
  manager.pause();
};

start();