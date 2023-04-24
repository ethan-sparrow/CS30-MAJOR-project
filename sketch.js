// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

const ROWS = 40;
const COLS = 40;
let x = 100;
let y = 100;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  let dx = 0;
  let dy = 0;
  if (key === "w") {
    dy -= 5;
  }
  if (key === "s") {
    dy += 5;
  }
  if (key === "a") {
    dx -= 5;
  }
  if (key === "d") {
    dx += 5;
  }
  x += dx;
  y += dy;
}

function draw() {
  
  background ("lightpink");
  rect (x, y, 100, 150);
}
