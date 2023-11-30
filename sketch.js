
// canvas
let width = 590;
let height = 570;
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

    // create unglitched liftplan
    drawdown.createLiftPlan();
    // glitch liftplan
    drawdown.glitchLiftPlan();
    // generate drawdown from liftplan
    drawdown.createDrawdown();
    // display draft
    drawdown.printDraft();

    noLoop()
}

function keyPressed() {
    if (key === 'g') {
        glitchMod++;
        console.log("glitchMod: ", glitchMod);
        loop();
    } else if (key === 'd') {
        glitchMod--;
        console.log("glitchMod: ", glitchMod);
        loop();
    } else if (key === 'r') {
        showLines = !showLines;
        loop();
    } else if (keyCode === UP_ARROW) {
        pZoom += cellSize;
        console.log("pZoom: ", pZoom);
        loop();
    } else if (keyCode === DOWN_ARROW) {
        pZoom -= cellSize;
        console.log("pZoom: ", pZoom);
        loop();
    } else if (keyCode === LEFT_ARROW) {
        pan -= cellSize;
        console.log("pan: ", pan);
        loop();
    } else if (keyCode === RIGHT_ARROW) {
        pan += cellSize;
        console.log("pan: ", pan);
        loop();
    }
}
