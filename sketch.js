
// canvas
let width = 590;
let height = 590;
let drawdown_width = 500;
let drawdown_height = 500;
let cellSize = 10;
let drawdown;

// controls
let pan = 0;
let pZoom = 10; // Perlin noise zoom level
let glitchMod = 0;
let showLines = false;

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
    textFont('Arial', 10);
    textAlign(RIGHT);

    let seed = int(random(1, 100));
    noiseSeed(seed);

    drawdown = new Drawdown(wefts, warps);
    drawdown.loadPattern("twoByTwoTwill");
    // create draft data
    drawdown.createThreading();
    drawdown.createTieup();
}

function draw() {
    background(255);

    // create liftplan
    drawdown.createLiftPlan();
    // glitch liftplan
    drawdown.glitchLiftPlan();
    // generate drawdown from liftplan
    drawdown.createDrawdown();
    // display draft
    drawdown.printDraft();

    noLoop()
}
