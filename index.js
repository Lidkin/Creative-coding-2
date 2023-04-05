const canvasSketch = require('canvas-sketch');
//const math = require('canvas-sketch-util/math');
//const random = require('canvas-sketch-util/random');
//const colormap = require('colormap');

const settings = {
  dimensions: [ 1080, 1080 ],
};


const sketch = () => {


    return ({ context, width, height }) => {
        context.fillStyle = 'black';
        context.fillRect(0, 0, width, height);
        

    };
};

canvasSketch(sketch, settings);

