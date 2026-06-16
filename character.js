export default class Character {
  // x, y = top-left position; w, h = player size
  constructor(x, y, w, h, imageFile) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = 0; // horizontal speed
    this.vy = 0; // vertical speed
    this.imageFile = imageFile; // optional image file
  }

  // reset player position and velocity for a new game
  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
  }

  // apply stronger gravity, move player, and keep inside left/right bounds
  move() {
    this.vy += 0.38; // gravity
    this.x += this.vx; // horizontal movement
    this.y += this.vy; // vertical movement
    this.x = constrain(this.x, 0, width - this.w); // clamp to canvas width
  }

  // jump by giving an upward velocity
  jump(power = -10.8) {
    this.vy = power;
  }

  // draw player with image first, fallback to simple space hero
  draw() {
    if (this.imageFile && this.imageFile.width > 1) {
      imageMode(CORNER);
      image(this.imageFile, this.x - 8, this.y - 14, this.w + 16, this.h + 22);
      return;
    }

    let centerX = this.x + this.w / 2;

    noStroke(); // no outline

    fill(80, 45, 90); // hair
    ellipse(centerX, this.y + 11, this.w * 0.9, this.h * 0.8);

    fill(200, 190, 170); // hood
    arc(centerX, this.y + 12, this.w, this.h, Math.PI, 0);

    fill(255, 220, 200); // face
    ellipse(centerX, this.y + 12, this.w * 0.65, this.h * 0.6);

    fill(230, 220, 190); // robe
    triangle(centerX, this.y + 22, this.x + 2, this.y + this.h, this.x + this.w - 2, this.y + this.h);

    fill(0); // eyes
    ellipse(centerX - 5, this.y + 11, 3, 3);
    ellipse(centerX + 5, this.y + 11, 3, 3);

    fill(255, 120, 160); // small smile
    arc(centerX, this.y + 16, 9, 5, 0, Math.PI);

    stroke(90, 230, 255); // lightsaber
    strokeWeight(3);
    line(this.x + this.w - 3, this.y + 13, this.x + this.w + 10, this.y + 2);
    noStroke();

  }

  // loop through a platform array and return the first landed platform
  collides(platformList) {
    for (let i = 0; i < platformList.length; i++) { // loop through each platform in the array
      if (platformList[i].landsOn(this)) { // check if the player is on the platform
        return platformList[i]; // return the platform
      }
    }
    // no collision this frame (no platform was hit)
    return null;
  }
}
