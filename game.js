import Character from "./character.js";
import Platform from "./platform.js";

// canvas size
let canvasWidth = 400;
let canvasHeight = 600;
let scrollLine = 200; // y line — scroll when player goes above it
let character1;         // player object
let moonPlatforms = [];    // most common normal platforms
let marsPlatforms = [];    // disappears after landing
let jupiterPlatforms = []; // gives a higher jump
let score = 0;
let winScore = 15000; // score needed to finish the game
let state = "start"; // "start" | "play" | "over" | "win"
let cissiImage = null;
let logoImage = null;
let posterImage = null;
let landImages = [];
let planetImages = {};

// --- Subclasses (extend Platform) ---

// Mars disappears and falls after Cissi lands on it
class MarsPlatform extends Platform {
  constructor(x, y, w, h, imageFile) {
    super(x, y, w, h, imageFile, [230, 85, 55]);
    this.broken = false;
    this.fallSpeed = 0;
  }

  landsOn(character) {
    if (this.broken) return false;
    return super.landsOn(character); // use parent collision check
  }

  onLand() {
    this.broken = true; // start falling after landing
    this.fallSpeed = 7;
  }

  draw() {
    if (this.broken) {
      this.y += this.fallSpeed;
      this.fallSpeed += 0.4;
    }
    super.draw();
  }
}

// Jupiter gives a stronger jump
class JupiterPlatform extends Platform {
  constructor(x, y, w, h, imageFile, speedX) {
    super(x, y, w, h, imageFile, [220, 150, 80]);
    this.jumpPower = -15.5;
    this.speedX = speedX;
  }

  update() {
    this.x += this.speedX;
    if (this.x <= 0 || this.x + this.w >= width) {
      this.speedX *= -1;
    }
  }

  draw() {
    super.draw();
    this.update();
  }
}

// --- p5.js setup (runs once) ---

function loadAssets() {
  cissiImage = loadImage("images/cissi.png", (img) => {
    cissiImage = img;
    if (character1) character1.imageFile = img;
  });

  logoImage = loadImage("images/logo.png", (img) => {
    logoImage = img;
  });

  posterImage = loadImage("images/poster.jpeg", (img) => {
    posterImage = img;
  });

  landImages = [];
  loadImage("images/1.png", (img) => landImages[0] = img);
  loadImage("images/2.png", (img) => landImages[1] = img);
  loadImage("images/3.png", (img) => landImages[2] = img);

  planetImages.moon = loadImage("images/月球.png", (img) => {
    planetImages.moon = img;
    refreshPlatformImages();
  });
  planetImages.mars = loadImage("images/火星.png", (img) => {
    planetImages.mars = img;
    refreshPlatformImages();
  });
  planetImages.jupiter = loadImage("images/木星.png", (img) => {
    planetImages.jupiter = img;
    refreshPlatformImages();
  });
}

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  frameRate(60);
  character1 = new Character(185, 450, 30, 30, cissiImage);
  loadAssets();
}

// --- p5.js draw (runs every frame) ---

function draw() {
  if (state === "start") {
    drawStartBackground();
  } else {
    drawGameBackground();
  }

  if (state === "start") {
    showStartScreen();
    return;
  }

  if (state === "play") {
    runGame();
    return;
  }

  if (state === "over") {
    showGameOverScreen();
    return;
  }

  showWinScreen();
}

// animated cover background, drawn with p5 instead of video
function drawStartBackground() {
  if (posterImage) {
    imageMode(CORNER);
    image(posterImage, 0, 0, width, height);
    fill(0, 0, 0, 70);
    noStroke();
    rect(0, 0, width, height);
  } else {
    background(8, 5, 28);
    drawNebula(width / 2, height / 2 - 90, frameCount * 0.01);
    drawStars(55, 0.18);
  }

  noStroke();
  fill(255, 230, 120, 35);
  ellipse(width / 2, height / 2 - 120, 280, 150);
  fill(100, 170, 255, 35);
  ellipse(width / 2 + 80, height / 2 + 120, 220, 220);
}

// animated gameplay background, drawn with p5 instead of video
function drawGameBackground() {
  background(4, 7, 26);
  drawStars(85, 0.55);
  drawFarPlanet(80, 520, 150, [88, 55, 145]);
  drawFarPlanet(330, 90, 120, [35, 95, 180]);
  drawSpeedLines();
}

function drawStars(count, speed) {
  noStroke();
  for (let i = 0; i < count; i++) {
    let x = (i * 47 + 31) % width;
    let y = (i * 83 + frameCount * speed) % height;
    let twinkle = 130 + sin(frameCount * 0.05 + i) * 80;
    fill(255, 245, 190, twinkle);
    ellipse(x, y, i % 4 === 0 ? 4 : 2, i % 4 === 0 ? 4 : 2);
  }
}

function drawNebula(x, y, t) {
  noStroke();
  for (let i = 0; i < 6; i++) {
    let size = 130 + i * 35 + sin(t + i) * 10;
    fill(90 + i * 18, 50 + i * 10, 180 + i * 8, 22);
    ellipse(x + sin(t + i) * 28, y + cos(t + i) * 18, size, size * 0.55);
  }
}

function drawFarPlanet(x, y, size, planetColor) {
  noStroke();
  fill(planetColor[0], planetColor[1], planetColor[2], 95);
  ellipse(x, y, size, size);
  fill(255, 255, 255, 35);
  ellipse(x - size * 0.18, y - size * 0.2, size * 0.35, size * 0.18);
}

function drawSpeedLines() {
  stroke(90, 180, 255, 65);
  strokeWeight(2);
  for (let i = 0; i < 8; i++) {
    let y = (i * 95 + frameCount * 1.3) % height;
    line(i * 53 % width, y, (i * 53 + 70) % width, y - 35);
  }
  noStroke();
}

// --- main game loop while playing ---

function runGame() {
  // set horizontal speed from keyboard (arrows or A/D)
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) character1.vx = -4.5;
  else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) character1.vx = 4.5;
  else character1.vx = 0;

  // apply gravity and update position (in Character.move)
  character1.move();

  // Moon = normal jump
  let hitMoon = character1.collides(moonPlatforms);
  if (hitMoon) character1.jump();

  // Jupiter = higher jump
  let hitJupiter = character1.collides(jupiterPlatforms);
  if (hitJupiter) character1.jump(hitJupiter.jumpPower);

  // Mars = disappears and falls
  let hitMars = character1.collides(marsPlatforms);
  if (hitMars) {
    character1.jump();
    hitMars.onLand();
  }

  // show planet land only near the beginning
  if (score < 250) {
    drawStartingPlanetLand();
  }

  // draw every platform in each array (uses for loops)
  for (let i = 0; i < moonPlatforms.length; i++) {
    moonPlatforms[i].draw(); // moon platforms
  }
  for (let i = 0; i < marsPlatforms.length; i++) {
    marsPlatforms[i].draw(); // mars platforms
  }
  for (let i = 0; i < jupiterPlatforms.length; i++) {
    jupiterPlatforms[i].draw(); // jupiter platforms
  }

  character1.draw();

  // camera scroll — player stays near scrollLine, world moves down
  if (character1.y < scrollLine) {
    let diff = scrollLine - character1.y;
    character1.y = scrollLine;
    score += floor(diff); // higher climb = more points

    // push all platforms down by the same amount
    for (let i = 0; i < moonPlatforms.length; i++) {
      moonPlatforms[i].y += diff;
    }
    for (let i = 0; i < marsPlatforms.length; i++) {
      marsPlatforms[i].y += diff;
    }
    for (let i = 0; i < jupiterPlatforms.length; i++) {
      jupiterPlatforms[i].y += diff;
    }
  }

  respawnIfOffScreen();

  // show score on screen
  fill(255, 240, 120);
  textSize(20);
  textAlign(LEFT, TOP);
  text("Score: " + score, 10, 25);
  text("Goal: " + winScore, 10, 50);

  if (score >= winScore) {
    state = "win";
  }

  // fell off bottom of screen
  if (character1.y > canvasHeight) {
    state = "over";
  }
}

// simple planet ground at the beginning of the game
function drawStartingPlanetLand() {
  noStroke();
  fill(70, 45, 100, 190);
  ellipse(width / 2, height + 55, 460, 170);

  fill(120, 90, 160, 160);
  ellipse(85, height - 5, 90, 22);
  ellipse(250, height - 25, 130, 28);

  fill(255, 255, 255, 80);
  ellipse(135, height - 48, 20, 8);
  ellipse(295, height - 62, 28, 10);

  drawLandCharacters();
}

// show extra characters standing on the starting land
function drawLandCharacters() {
  let spots = [
    { x: 85, y: height - 87, size: 54 },
    { x: 300, y: height - 102, size: 58 },
    { x: 340, y: height - 78, size: 48 }
  ];

  imageMode(CENTER);
  for (let i = 0; i < landImages.length; i++) {
    if (landImages[i]) {
      image(landImages[i], spots[i].x, spots[i].y, spots[i].size, spots[i].size);
    }
  }
}

// recycle platforms that scrolled below the screen
function respawnIfOffScreen() {
  for (let i = 0; i < moonPlatforms.length; i++) {
    if (moonPlatforms[i].y > height + 40) {
      moonPlatforms[i].y = -20; // place above visible area
      moonPlatforms[i].x = random(0, width - moonPlatforms[i].w);
    }
  }

  for (let i = 0; i < marsPlatforms.length; i++) {
    if (marsPlatforms[i].y > height + 40) {
      marsPlatforms[i].y = -20;
      marsPlatforms[i].x = random(0, width - marsPlatforms[i].w);
      marsPlatforms[i].broken = false;
      marsPlatforms[i].fallSpeed = 0;
    }
  }

  for (let i = 0; i < jupiterPlatforms.length; i++) {
    if (jupiterPlatforms[i].y > height + 40) {
      jupiterPlatforms[i].y = -20;
      jupiterPlatforms[i].x = random(0, width - jupiterPlatforms[i].w);
    }
  }
}

// update platforms if images finish loading after a game starts
function refreshPlatformImages() {
  for (let i = 0; i < moonPlatforms.length; i++) {
    moonPlatforms[i].imageFile = planetImages.moon;
  }
  for (let i = 0; i < marsPlatforms.length; i++) {
    marsPlatforms[i].imageFile = planetImages.mars;
  }
  for (let i = 0; i < jupiterPlatforms.length; i++) {
    jupiterPlatforms[i].imageFile = planetImages.jupiter;
  }
}

// set up a new game — clear arrays and spawn platforms
function resetGame() {
  score = 0;
  character1 = new Character(185, 450, 30, 30, cissiImage);
  character1.jump(); // small bounce at start

  moonPlatforms = [];
  marsPlatforms = [];
  jupiterPlatforms = [];

  // starting platform under the player
  moonPlatforms.push(new Platform(165, 500, 60, 14, planetImages.moon, [190, 190, 210]));

  // Moon is the most common normal platform, with larger gaps
  for (let i = 0; i < 6; i++) {
    moonPlatforms.push(
      new Platform(random(width - 70), 390 - i * 160, 60, 14, planetImages.moon, [190, 190, 210])
    );
  }

  // Mars appears more often and falls when stepped on
  marsPlatforms.push(
    new MarsPlatform(random(width - 70), 310, 60, 14, planetImages.mars)
  );
  marsPlatforms.push(
    new MarsPlatform(random(width - 70), -10, 60, 14, planetImages.mars)
  );
  marsPlatforms.push(
    new MarsPlatform(random(width - 70), -330, 60, 14, planetImages.mars)
  );

  // Jupiter gives a stronger jump and moves fast
  jupiterPlatforms.push(
    new JupiterPlatform(random(width - 80), 150, 72, 16, planetImages.jupiter, 2.6)
  );
  jupiterPlatforms.push(
    new JupiterPlatform(random(width - 80), -170, 72, 16, planetImages.jupiter, -2.8)
  );
  jupiterPlatforms.push(
    new JupiterPlatform(random(width - 80), -490, 72, 16, planetImages.jupiter, 3)
  );
}

// title screen before game starts
function showStartScreen() {
  textAlign(CENTER, CENTER);
  if (logoImage) {
    imageMode(CENTER);
    image(logoImage, width / 2, height / 2 - 125, 250, 130);
  } else {
    fill(255);
    textSize(34);
    text("Cissi jump game", width / 2, height / 2 - 105);
  }
  fill(255);
  textSize(26);
  text("Cissi jump game", width / 2, height / 2 - 35);
  textSize(16);
  text("Moon = normal   Mars = falls   Jupiter = high jump", width / 2, height / 2 + 5);
  text("Reach 15000 points to escape the Empire", width / 2, height / 2 + 35);
  text("Click or SPACE to start", width / 2, height / 2 + 75);
}

// game over — draw scene then dark overlay
function showGameOverScreen() {
  for (let i = 0; i < moonPlatforms.length; i++) moonPlatforms[i].draw();
  for (let i = 0; i < marsPlatforms.length; i++) marsPlatforms[i].draw();
  for (let i = 0; i < jupiterPlatforms.length; i++) jupiterPlatforms[i].draw();
  character1.draw();

  fill(0, 150); // semi-transparent overlay
  noStroke();
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("Lost in Space", width / 2, height / 2 - 30);
  textSize(18);
  text("Score: " + score, width / 2, height / 2 + 10);
  text("Click or SPACE to restart", width / 2, height / 2 + 50);
}

// win ending after reaching the goal score
function showWinScreen() {
  fill(20, 20, 55, 210);
  noStroke();
  rect(0, 0, width, height);

  drawSpaceship(width / 2, height / 2 + 35);
  drawCissiOnShip(width / 2, height / 2 - 35);

  fill(255, 230, 80);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("Mission Complete!", width / 2, height / 2 - 115);
  textSize(17);
  text("Cissi reached the spaceship.", width / 2, height / 2 - 82);
  text("Final Score: " + score, width / 2, height / 2 + 105);
  text("Click or SPACE to play again", width / 2, height / 2 + 140);
}

// draw the spaceship ending without using an image
function drawSpaceship(x, y) {
  noStroke();

  fill(210, 220, 235);
  ellipse(x, y, 210, 58);

  fill(130, 180, 255);
  ellipse(x, y - 25, 78, 42);

  fill(90, 110, 140);
  triangle(x - 70, y + 5, x - 125, y + 35, x - 45, y + 23);
  triangle(x + 70, y + 5, x + 125, y + 35, x + 45, y + 23);

  fill(255, 150, 60);
  ellipse(x - 55, y + 25, 22, 12);
  ellipse(x + 55, y + 25, 22, 12);

  fill(255, 240, 130);
  ellipse(x, y + 7, 18, 18);
  ellipse(x - 35, y + 8, 14, 14);
  ellipse(x + 35, y + 8, 14, 14);
}

// place Cissi on top of the spaceship for the ending
function drawCissiOnShip(x, y) {
  if (cissiImage) {
    imageMode(CENTER);
    image(cissiImage, x, y, 58, 70);
  } else {
    fill(255, 220, 200);
    ellipse(x, y - 12, 28, 28);
    fill(230, 220, 190);
    triangle(x, y + 3, x - 22, y + 42, x + 22, y + 42);
  }
}

function startGame() {
  state = "play";
  resetGame();
}

// space or enter to start / restart
function keyPressed() {
  if (state !== "play" && (key === " " || keyCode === ENTER)) {
    startGame();
  }
}

// click anywhere to start / restart
function mousePressed() {
  if (state !== "play") {
    startGame();
  }
}

// ES modules hide functions from global scope — p5 looks for these on window
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
window.mousePressed = mousePressed;
