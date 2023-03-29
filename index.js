const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const colormap = require('colormap');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
  fps: 2
};

const triangles = [];
const circles = [];
const cursor = { x: 9999, y: 9999 };

const colors = colormap({
    colormap: 'blackbody',
    nshades: 30,
});

const colorsCircle = colormap({
    colormap: 'copper',
    nshades: 30,
});

let elCanvas;

let manager;
let audio;
let audioContext, audioData, sourceNode, analyserNode;
let minDb, maxDb;

const sketch = ({ width, height, canvas }) => {
    const bins = [];
    let bin;

    for (let i = 0; i < width * height; i++) {
      bin = random.rangeFloor(4, 64);
      bins.push(bin);
    }

    let x, y, triangle, numTriangle, circle;
    const cell = Math.floor(width / 40);
    const cols = Math.floor(width / cell);
    const rows = Math.floor(height / cell);
    const gapTriangle = cell * 0.2;
    const sideSize = cell * 0.8 * 2;
    const numCells = cols * rows;
    const radius = cell * 0.4;

    elCanvas = canvas;
    canvas.addEventListener('mousedown', onMouseDown)
    
    for (let i = 0; i < numCells; i++) {
            let col = i % cols;
            let row = Math.floor(i / cols);
            x = col * cell;
            y = row * cell;
            if (col % 2 == 0 && row % 2 == 0) numTriangle = 1;
            if (col % 2 == 0 && row % 2 != 0) numTriangle = 2;
            if (col % 2 != 0 && row % 2 == 0) numTriangle = 3;
            if (col % 2 != 0 && row % 2 != 0) numTriangle = 4; 

            triangle = new Triangle({ x, y, sideSize, gapTriangle, numTriangle });
            circle = new Circle({ x, y, radius, cell });
            triangles.push(triangle);
            circles.push(circle);

    }

    return ({ context, width, height }) => {
        context.fillStyle = 'black';
        context.fillRect(0, 0, width, height);

        if (!audioContext) return;

        analyserNode.getFloatFrequencyData(audioData);
        
        circles.forEach( circle => {
            const ind = circles.indexOf(circle);
            bin = bins[ind];
            circle.updateColor(audioData[bin]);
            circle.drawCircle(context, audioData[bin]);
        });

        triangles.sort((a, b) => a.scale - b.scale);
        
        triangles.forEach( triangle => {
            const ind = triangles.indexOf(triangle);
            bin = bins[ind];
            triangle.update(audioData[bin]);
            triangle.draw(context);
        });
    

        

    };
};

const onMouseDown = (e) => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    onMouseMove(e);
};

const onMouseMove = (e) => {
    const x = e.offsetX / elCanvas.offsetWidth * elCanvas.width;
    const y = e.offsetY / elCanvas.offsetHeight * elCanvas.height;

    cursor.x = x;
    cursor.y = y;
};

const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);

    cursor.x = 9999;
    cursor.y = 9999;
}

class Triangle {
    constructor ({ x, y, sideSize = 15, gapTriangle, numTriangle}) {

        this.x = x;
        this.y = y;

        this.ax = 0;
        this.ay = 0;

        this.vx = 0;
        this.vy = 0;

        this.ix = x;
        this.iy = y;

        this.sideSize = sideSize;
        this.gapTriangle = gapTriangle;
        this.numTriangle = numTriangle;
        this.time = 0;

        this.minDist = random.range(50, 150);
        this.pushFactor = random.range(0.02, 0.06);
        this.pullFactor = random.range(0.002, 0.006);
        this.dampFactor = 0.95;
        this.scale = 1;
        this.color = 'black'//colors[0];
    }

    update() {
        let dx, dy, dd, distDelta;
        let idxColor;

        dx = this.ix - this.x;
        dy = this.iy - this.y;
        dd = Math.sqrt(dx * dx + dy * dy);

        this.pullFactor = math.clamp(dd, 0.004, 0.006);

        this.ax = dx * this.pullFactor;
        this.ay = dy * this.pullFactor;

        this.scale = math.mapRange(dd, 0, 200, 1, 2);

        idxColor = Math.floor(math.mapRange(dd, 0, 200, 0, colors.length - 1, true));
        this.color = colors[idxColor];

        dx = this.x - cursor.x;
        dy = this.y - cursor.y;
    
        dd = Math.sqrt(dx * dx + dy * dy);

        distDelta = this.minDist - dd;
        
        this.pushFactor = math.clamp(dd, 0.04, 0.06);

        if (dd < this.minDist) {
            this.ax += dx / dd * distDelta * this.pushFactor;
            this.ay += dy / dd * distDelta * this.pushFactor;
        }

        this.vx += this.ax;
        this.vy += this.ay;

        this.vx *= this.dampFactor;
        this.vy *= this.dampFactor;

        this.x += this.vx;
        this.y += this.vy;
    }

    draw(context) {
        let side = this.sideSize * this.scale;
        context.save();
        context.translate(this.x, this.y);
        context.fillStyle = this.color; 

        switch(this.numTriangle) {
            case 1:             
                context.translate(this.gapTriangle, this.gapTriangle / 2);
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(side, 0);
                context.lineTo(side/2, side/2);
                context.closePath();
                break;
            case 2:
                context.translate(this.gapTriangle / 2, -side / 2);
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(0, side);
                context.lineTo(side/2, side/2);
                context.closePath();
                break;
            case 3:
                context.translate(side / 2 + this.gapTriangle / 2, this.gapTriangle);
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(0, side);
                context.lineTo(-side/2, side/2);
                context.closePath();
                break;
            case 4:
                context.translate(side / 2, side / 2 + this.gapTriangle / 2);
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(-side, 0);
                context.lineTo(-side/2, -side/2);
                context.closePath();
                break;
        }
        context.fill();
        context.restore();
    }

}

class Circle {
    constructor ({ x, y, radius, cell }) {
        this.x = x;
        this.y = y;

        this.radius = radius;
        this.cell = cell;

        this.color = 'black';
        this.minDist = radius * 20;
        this.maxDist = radius * 60;
    }

    updateColor(audio) {
        let dx, dy, dd;
        let idxColor;

        dx = this.x - cursor.x;
        dy = this.y - cursor.y;
        dd = Math.sqrt(dx * dx + dy * dy);

        idxColor = Math.floor(math.mapRange(dd, 0, this.minDist, 0, colorsCircle.length));
        let mapped = math.mapRange(audio, minDb, maxDb, 0, 1, true);
        
        if (dd < this.minDist) {
            this.color = colorsCircle[idxColor];
        } else if (dd > this.maxDist) {
            if (mapped > 0.5) this.color = 'white';
            if (mapped < 0.5) this.color = 'black';
        }        
    }
    
    drawCircle(context, audio) {
        context.save();
        context.translate(this.x + this.cell * 0.5, this.y + this.cell * 0.5);
        context.fillStyle = this.color;

        let mapped = this.color === 'white' ? 0.9 : math.mapRange(audio, minDb, maxDb, 2, 0, true).toFixed(1);

        context.beginPath();
        context.arc(0, 0, this.radius * mapped, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }

}

const createAudio = () => {
    audio = document.createElement('audio');
    //audio.src = 'audio/Max H. - Preparing the Cannons.mp3';
    audio.crossOrigin = 'anonymous';
    audio.src ='https://cdn.pixabay.com/download/audio/2022/03/05/audio_f1012306c6.mp3?filename=terra-incognita-22068.mp3';
  
    audioContext = new AudioContext();
    
    sourceNode = audioContext.createMediaElementSource(audio);
    sourceNode.connect(audioContext.destination);
  
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 512;
    analyserNode.smoothingTimeConstant = 0.9;
    sourceNode.connect(analyserNode);
  
    minDb = analyserNode.minDecibels;
    maxDb = analyserNode.maxDecibels;
  
    audioData = new Float32Array(analyserNode.frequencyBinCount);
  
  }
  
const addListeners = () => {
	window.addEventListener('mouseup', () => {
		if (!audioContext) createAudio();
			audio.play();
			manager.play();
	});
};

const start = async () => {
	addListeners();
	manager = await canvasSketch(sketch, settings);
};

start();