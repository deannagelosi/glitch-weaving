/* 
  Basic Grid Setup
*/

// canvas
let width = 500; 
let height = 500;
let drawdown_width = 500;
let drawdown_height = 500;
let cellSize = 10;
let drawdown;

// draft
let wefts = Math.floor(drawdown_height / cellSize); // Rows
let warps = Math.floor(drawdown_width / cellSize);  // Columns

// structures
let jsonData;

function preload() {
  jsonData = loadJSON('structures.json');
}

function setup() {
  createCanvas(width, height);
  let seed = int(random(1, 100));
  noiseSeed(seed);
  
  drawdown = new Drawdown(wefts, warps);
  drawdown.loadPattern("twoByTwoTwill");
  drawdown.createThreading();
  console.log(drawdown.threadingData);
}

function draw() {
  background(255);
  drawdown.display();  
  noLoop()
}
