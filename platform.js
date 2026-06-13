export default class Platform {
  // x, y = top-left corner; w, h = width and height
  constructor(x, y, w, h, imageFile = null, fallbackColor = [190, 190, 210]) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.imageFile = imageFile;
    this.fallbackColor = fallbackColor;
  }

  // draw a planet platform with image first, fallback to a simple planet
  draw() {
    let centerX = this.x + this.w / 2;
    let centerY = this.y + this.h / 2;

    if (this.imageFile && this.imageFile.width > 1) {
      imageMode(CENTER);
      image(this.imageFile, centerX, centerY, this.w + 14, this.w + 14);
      return;
    }

    noStroke(); // no outline
    fill(this.fallbackColor[0], this.fallbackColor[1], this.fallbackColor[2]);
    ellipse(centerX, centerY, this.w, this.w);

    stroke(255, 255, 255, 120); // planet ring
    strokeWeight(2);
    noFill();
    ellipse(centerX, centerY, this.w + 14, this.h + 5);
    noStroke();
  }

  // returns true if character landed on top of this platform
  landsOn(character) {
    return (
      character.vy > 0 && // falling down, not jumping up through
      character.y + character.h > this.y && // feet at or below platform top
      character.y + character.h < this.y + this.h + 5 && // feet near top (+5 tolerance)
      character.x + character.w > this.x && // horizontal overlap — left side
      character.x < this.x + this.w // horizontal overlap — right side
    );
  }
}
