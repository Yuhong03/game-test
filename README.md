# Cissi jump game

A simple space adventure **Doodle Jump**–style game starring **Cissi**, built with **p5.js** for our final project.

## How to Play

- **Move:** Arrow keys or **A** / **D**
- **Start / Restart:** Click the screen, **SPACE**, or **ENTER**
- Jump on platforms to climb higher and increase your score
- Reach **15000 points** to unlock the mission ending
- **Moon** = normal jump platform  
- **Mars** = falls away after Cissi lands on it  
- **Jupiter** = moves fast and gives a higher jump
- Don’t fall off the bottom of the screen!

## Run Locally

1. Clone or download this repository  
2. Open `index.html` in a browser (Chrome, Firefox, Safari, etc.)

> **Note:** Because we use ES modules (`import` / `export`), open the project through a local server or GitHub Pages—not by double-clicking the file in some browsers.

**Optional — local server:**

```bash
# Python 3
python3 -m http.server 8000
```

Then visit `http://localhost:8000`

## GitHub Pages

1. Push the project to GitHub  
2. Go to **Settings → Pages**  
3. Set source to your main branch and `/ (root)`  
4. Your game will be live at `https://<username>.github.io/<repo-name>/`

## Project Structure

| File | Purpose |
|------|---------|
| `index.html` | Loads p5.js and `game.js` |
| `style.css` | Centers the canvas on the page |
| `game.js` | Main game logic, animated p5 backgrounds, platform arrays, subclasses |
| `character.js` | `Character` class (player movement, jump, collision) |
| `platform.js` | `Platform` class (planet image drawing, landing detection) |

## Assets

The game uses these files from the `images` folder:

- `cissi.png` — player character
- `logo.png` — start screen logo
- `poster.jpeg` — start screen background
- `1.png`, `2.png`, `3.png` — characters on the starting land
- `月球.png` — moon platform
- `火星.png` — Mars platform
- `木星.png` — Jupiter platform

The gameplay background is drawn with p5.js code, so no video files are needed.

## Course Requirements

| Requirement | How we meet it |
|-------------|----------------|
| **p5.js & canvas** | `createCanvas()` in `setup()`; drawing with p5 functions |
| **OOP (2+ classes)** | `Character`, `Platform`, plus `MarsPlatform` and `JupiterPlatform` (inheritance) |
| **Arrays** | `moonPlatforms`, `marsPlatforms`, `jupiterPlatforms` |
| **Loops** | `for` loops to draw platforms, scroll, respawn, and check collisions in `collides()` |

## Technologies

- [p5.js](https://p5js.org/) 2.1.1 (CDN)
- HTML5 Canvas (created by p5)
- JavaScript (ES modules)

## Team

<!-- Add your names and GitHub usernames -->
- Name 1 — @Yuhong03
