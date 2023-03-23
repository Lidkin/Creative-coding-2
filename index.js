const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

let radius = 235, eyeRadius, n;
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

  return ({ context, width, height }) => {
    context.fillStyle = '#F7F5EB';
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(width * 0.5, height * 0.5);
    context.fillStyle = 'black';
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.fill();
    context.restore();

    context.save();
    context.translate(startPX, startPY);
    drawEye(context, eyelidW, diff, 0.82);
    context.transform(1, 0, 0, 1, eyelidW, 0);
    context.rotate(Math.PI);
    drawEye(context, eyelidW, diff, 0.82);
    context.restore();

    if (!audioContext) return;

    analyserNode.getFloatFrequencyData(audioData);

    context.save();
    context.translate(startPX, startPY);

    for (let i = 0; i < bins.length; i++) {
      bin = bins[i];
      n = math.mapRange(audioData[bin], minDb, maxDb, 0, 1, true);
      radius = math.mapRange(audioData[bin], minDb, maxDb, 100, 250, true);

      context.save();
      context.translate(-startPX, -startPY);
      context.translate(width * 0.5, height * 0.5);
      context.fillStyle = 'black';
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    drawEye(context, eyelidW, diff, n);
    context.transform(1, 0, 0, 1, eyelidW, 0);
    context.rotate(Math.PI);
    drawEye(context, eyelidW, diff, n);
    context.restore();

  };
};

const drawEye = (context, eyelidW, diff, n) => {
  context.strokeStyle = 'black';
  context.fillStyle = 'black';

  context.beginPath();
  context.arc(eyelidW * 0.5, 0, eyelidW * 0.55, 0, Math.PI);
  context.stroke();
  context.moveTo(0, 0);
  context.bezierCurveTo(
    diff * 0.9,
    eyeRadius * n,
    eyelidW - diff * 1.1,
    eyeRadius * n,
    eyelidW,
    0
  );
  context.closePath();
  context.fill();
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
  audio.src = 'https://cdn.pixabay.com/download/audio/2022/03/05/audio_f1012306c6.mp3?filename=terra-incognita-22068.mp3';
  //audio.src = 'audio/Wild Tulip - Behind That Days - Short Version B.mp3';

  audioContext = new AudioContext();

  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(audioContext.destination);

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 512;
  analyserNode.smoothingTimeConstant = 0.85;
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
