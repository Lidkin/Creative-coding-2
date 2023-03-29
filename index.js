const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
//const eases = require('eases');
const colormap = require('colormap');
//const interpolate = require('color-interpolate');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};

const triangles = [];
const circles = [];
const cursor = { x: 9999, y: 9999 };

const colors = colormap({
    colormap: 'electric',
    nshades: 20
});

const colorsCircle = colormap({
    colormap: 'viridis',
    nshades: 20,
});

let elCanvas;

const sketch = ({ width, height, canvas }) => {
    let x, y, triangle, numTriangle, circle;
    const cell = Math.floor(width / 40);
    const cols = Math.floor(width / cell);
    const rows = Math.floor(height / cell);
    const gapTriangle = cell * 0.2;
    const sideSize = cell * 0.8 * 2;
    const numCells = cols * rows;
    const radius = cell * 0.4;

    elCanvas = canvas;
    canvas.addEventListener('mousedown', onMouseDown);

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
        
        circles.forEach( circle => {
            circle.updateColor();
            circle.drawCircle(context);
        });

        triangles.sort((a, b) => a.scale - b.scale);

        triangles.forEach( triangle => {
            triangle.update();
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

canvasSketch( sketch, settings );

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

        this.minDist = 200 //random.range(100, 200);
        this.pushFactor = 0.02; // random.range(0.02, 0.06);
        this.pullFactor = 0.002; // random.range(0.002, 0.006);
        this.dampFactor = 0.95;
        this.scale = 1;
        this.color = colors[0];
    }

    update() {
        let dx, dy, dd, distDelta;
        let idxColor;

        dx = this.ix - this.x;
        dy = this.iy - this.y;
        dd = Math.hypot(dx, dy);

        this.pullFactor = math.clamp(dd, 0.004, 0.006);

        this.ax = dx * this.pullFactor;
        this.ay = dy * this.pullFactor;

        this.scale = math.mapRange(dd, 0, 200, 1, 3);

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

    updateColor() {
        let dx, dy, dd;
        let idxColor;

        dx = this.x - cursor.x;
        dy = this.y - cursor.y;
        dd = Math.sqrt(dx * dx + dy * dy);

        idxColor = Math.floor(math.mapRange(dd, 0, this.minDist, 0, colorsCircle.length));

        if (dd < this.minDist) {
            this.color = colorsCircle[idxColor];
        } else if (dd > this.maxDist) {
            this.color = 'black';
        }
    }
    
    drawCircle(context) {
        context.save();
        context.translate(this.x + this.cell * 0.5, this.y + this.cell * 0.5);
        context.fillStyle = this.color;

        context.beginPath();
        context.arc(0, 0, this.radius, 0, Math.PI * 2);
        context.fill();
        context.restore();
    
    }

}

