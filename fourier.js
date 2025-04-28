let x = []; // Signal array for X-coordinates
let y = []; // Signal array for Y-coordinates
let fourierX; // DFT of x[]
let fourierY; // DFT of y[]

let time = 0;
let path = [];

function setup() {
  createCanvas(800, 600);
  colorMode(HSB, 255); // Rainbow colors
  
  // Generating a heart-shaped signal
  for (let i = 0; i < 500; i++) {
    let t = map(i, 0, 500, 0, TWO_PI);
    x[i] = 100 * pow(sin(t), 3); // Heart X
    y[i] = -100 * (13 * cos(t) - 5 * cos(2*t) - 2 * cos(3*t) - cos(4*t)) / 16; // Heart Y
  }
  
  fourierX = dft(x); // Computing DFT for X
  fourierY = dft(y); // Computing DFT for Y
}

function dft(x) {
  let X = [];
  const N = x.length;

  for (let k = 0; k < N; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n++) {
      let phi = (2 * Math.PI * k * n) / N;
      re += x[n] * Math.cos(phi);
      im -= x[n] * Math.sin(phi);
    }
    re /= N;
    im /= N;
    X[k] = { 
      re, 
      im, 
      freq: k, 
      amp: Math.sqrt(re * re + im * im), 
      phase: Math.atan2(im, re) 
    };
  }
  return X;
}

function epicycles(x, y, rotation, fourier) {
  for (let i = 0; i < fourier.length; i++) {
    let prevx = x;
    let prevy = y;
    
    let freq = fourier[i].freq;
    let radius = fourier[i].amp;
    let phase = fourier[i].phase;
    
    x += radius * cos(freq * time + phase + rotation);
    y += radius * sin(freq * time + phase + rotation);
    
    stroke((i * 10) % 255, 255, 255, 100); // Rainbow epicycles
    noFill();
    ellipse(prevx, prevy, radius * 2);
    stroke(255);
    line(prevx, prevy, x, y);
  }
  return createVector(x, y);
}

function draw() {
  background(0);
  
  // Centre the drawing
  translate(width / 2 - 100, height / 2);
  
  // X and Y epicycles
  let vx = epicycles(0, 0, 0, fourierX);
  let vy = epicycles(0, 0, HALF_PI, fourierY);
  let v = createVector(vx.x, vy.y);
  
  // Storing the path
  path.unshift(v);
  if (path.length > 500) {
    path.pop();
  }
  
  // Drawing connecting lines
  stroke(255, 150);
  line(vx.x, vx.y, v.x, v.y);
  line(vy.x, vy.y, v.x, v.y);
  
  // Drawing the traced path
  beginShape();
  noFill();
  stroke(255, 0, 255); // Purple trace
  for (let i = 0; i < path.length; i++) {
    vertex(path[i].x, path[i].y);
  }
  endShape();
  
  // Animatings
  let dt = TWO_PI / fourierY.length;
  time += dt * 0.5; // Slows down animation
}