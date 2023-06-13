// project title
// Ethan Sparrow
// April 25th 2023
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

const ROWS = 15;
const COLS = 15;
let cellSize;
let grid;
let gridMemory = [];
let levelMaking = false;
let currentLevel = -2;
let levels = [];
let buttons = [];
let player, ground, boxi, wall, hole, filledHole, vRail, hRail, playerOnRailUp, playerOnRailDown, playerOnRailLeft, playerOnRailRight, title, winScreen;
let imageMap = new Map();
let levelComplete = false;
let music, winSound;

class Button {
  constructor (x, y, width, height, level, text) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.level = level;
    this.text = text;
  }

  display() {
    rectMode(CENTER);
    textAlign(CENTER, CENTER);
    textSize(this.height/2);
    fill ("grey");
    rect(this.x, this.y, this.width, this.height);
    fill("black");
    text(this.text, this.x, this.y);
  }

  pressed() {
    if(mouseX > this.x - this.width/2 && mouseY > this.y - this.height/2 && mouseX < this.x + this.width/2 && mouseY < this.y + this.height/2) {
      currentLevel = this.level;
      loadLevel();
    }

  }
}

function preload() {
  let levelAmount = 12; //NOTE TO SELF: change when new levels are added

  for (let i = 0; i < levelAmount; i++) {
    levels.push(loadJSON(`levels/${i}.json`));
  }

  //there HAS to be a better way to do this...
  player = loadImage("images/player.png");
  ground = loadImage("images/ground.png");
  boxi = loadImage("images/box.png");
  wall = loadImage("images/wall.png");
  hole = loadImage("images/hole.png");
  filledHole = loadImage("images/filledHole.png");
  vRail = loadImage("images/vRail.png");
  hRail = loadImage("images/hRail.png");
  playerOnRailUp = loadImage("images/playerOnRailUp.png");
  playerOnRailDown = loadImage("images/playerOnRailDown.png");
  playerOnRailLeft = loadImage("images/playerOnRailLeft.png");
  playerOnRailRight = loadImage("images/playerOnRailRight.png");

  title = loadImage("images/title.png");
  winScreen = loadImage("images/winScreen.png");

  imageMap.set("player", player);
  imageMap.set("ground", ground);
  imageMap.set("box", boxi);
  imageMap.set("wall", wall);
  imageMap.set("hole", hole);
  imageMap.set("filledHole", filledHole);
  imageMap.set("vRail", vRail);
  imageMap.set("hRail", hRail);
  imageMap.set("playerOnRailUp", playerOnRailUp);
  imageMap.set("playerOnRailDown", playerOnRailDown);
  imageMap.set("playerOnRailLeft", playerOnRailLeft);
  imageMap.set("playerOnRailRight", playerOnRailRight);

  music = loadSound("sound/music.mp3");
  winSound = loadSound("sound/winSound.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  loadLevel();

  cellSize = height/ROWS;
}

function keyPressed() {
  if (!music.isPlaying()) {
    music.play();
    music.setLoop(true);
  }
  if (currentLevel >= 0) {
  //for editing purposes
    
    if (key === "`") {
      levelMaking = true;
    }
  
    if (levelMaking) {
      let x = Math.floor(mouseX/cellSize);
      let y = Math.floor(mouseY/cellSize);

      if ( key === "g") {
        grid[y][x].bottomLayer = "ground";
        grid[y][x].topLayer = "empty"; 
      }
      if ( key === "l") {
        grid[y][x].bottomLayer = "ground";
        grid[y][x].topLayer = "wall";
      }
      if ( key === "p") {
        grid[y][x].bottomLayer = "ground";
        grid[y][x].topLayer = "player";
      }
      if ( key === "b") {
        grid[y][x].bottomLayer = "ground";
        grid[y][x].topLayer = "box";
      }
      if ( key === "h") {
        grid[y][x].bottomLayer = "hole";
        grid[y][x].topLayer = "empty";
      }
      if ( key === "e") {
        grid[y][x].bottomLayer = "empty";
        grid[y][x].topLayer = "empty";
      }
      if ( key === "v") {
        grid[y][x].bottomLayer = "vRail";
        grid[y][x].topLayer = "empty";
      }
      if ( key === "c") {
        grid[y][x].bottomLayer = "hRail";
        grid[y][x].topLayer = "empty";
      }

      //used to save levels ive made
      if (key === ".") {
        saveJSON(grid, "level");
      }
      if (key === ",") {
        grid = createEmpty2dArray(ROWS, COLS);
      }
    }

    //player input

    let dx = 0;
    let dy = 0;

    if (key === "w") {
      dy--;
    }
    if (key === "s") {
      dy++; 
    }
    if (key === "a") {
      dx--;
    }
    if (key === "d") {
      dx++;
    }

    if (dx !== 0 || dy !== 0) {
      update_grid(dx, dy);
    }

    if (key === "r") {
      loadLevel();
    }

    if (key === "x" && !levelComplete) {
      if (gridMemory.length > 0) {
        grid = structuredClone(gridMemory[gridMemory.length - 1]);
        gridMemory.pop();
      }
      
    }
    
  }
  if (keyCode === BACKSPACE) {
    currentLevel = -2;
    loadLevel();
  }
}

function update_grid(player_dx, player_dy) {
  //this will hapen once a key is pressed after the end of level
  if (levelComplete) {
    currentLevel++;
    loadLevel();
    levelComplete = false;
  }

  else {
    gridMemory.push(structuredClone(grid));

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {

        //player updates
        if (grid[y][x].topLayer === "player") {
          can_I_Move(x, y, player_dx, player_dy, "player");
          if (grid[y + player_dy][x + player_dx].topLayer === "box") {
            can_I_Move(x + player_dx, y + player_dy, player_dx, player_dy, "box");
          }
        }
      }
    }
  
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (grid[y][x].topLayer === "playerOnRailUp") {
          can_I_Move(x, y, 0, -1, "playerOnRailUp");
          if (grid[y - 1][x].topLayer === "box") {
            can_I_Move(x, y - 1, 0, -1, "boxFromRail");
          }
        }
        if (grid[y][x].topLayer === "playerOnRailDown") {
          can_I_Move(x, y, 0, 1, "playerOnRailDown");
          if (grid[y + 1][x].topLayer === "box") {
            can_I_Move(x, y + 1, 0, 1, "boxFromRail");
          }
        }
        if (grid[y][x].topLayer === "playerOnRailLeft") {
          can_I_Move(x, y, -1, 0, "playerOnRailLeft");
          if (grid[y][x - 1].topLayer === "box") {
            can_I_Move(x - 1, y, -1, 0, "boxFromRail");
          }
        }
        if (grid[y][x].topLayer === "playerOnRailRight") {
          can_I_Move(x, y, 1, 0, "playerOnRailRight");
          if (grid[y][x + 1].topLayer === "box") {
            can_I_Move(x + 1, y, 1, 0, "boxFromRail");
          }
        }
      }
    }
    let remainingHoles = 0;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (grid[y][x].tempVar === "filledHole") {
          grid[y][x].bottomLayer = "filledHole";
          grid[y][x].topLayer = "empty";
          grid[y][x].tempVar = "none";
        }
        else if (grid[y][x].tempVar !== "none") {
          grid[y][x].topLayer = grid[y][x].tempVar;
          grid[y][x].tempVar = "none";
        }

        //tracks the holes left in the level and finishes the level when its done
        if (grid[y][x].bottomLayer === "hole") {
          remainingHoles++;
        }
      }
    }
    if (remainingHoles === 0 && !levelMaking) {
      levelComplete = true;
      winSound.play();
    }
  }
}

function can_I_Move(x, y, dx, dy, cellType) {
  let lookingAhead = true;
  let lastSeenIsBox = false;
  for (let i = 1; lookingAhead; i++) {
    //collision of on rail players with other players 
    //NOTE TO SELF: this should stay at the top or else it gets confused because it makes its own tempVar player when it moves
    if (cellType !== "player" && cellType !== "box") {
      if (grid[y + dy * i][x + dx * i].topLayer !== "empty" || grid[y + dy * i][x + dx * i].tempVar !== "none") {
        turnAround(x, y, cellType);
        lookingAhead = false;
        break;
      }
    }
            
    //dont move if theres a wall down the line
    if (grid[y + dy * i][x + dx * i].topLayer === "wall") {
      turnAround(x, y, cellType);
      lookingAhead = false;
    }

    if (grid[y + dy * i][x + dx * i].bottomLayer === "vRail" && (dx !== 0 || cellType === "box" || lastSeenIsBox)) {
      turnAround(x, y, cellType);
      lookingAhead = false;
    }

    else if (grid[y + dy * i][x + dx * i].bottomLayer === "hRail" && (dy !== 0 || cellType === "box" || lastSeenIsBox)) {
      turnAround(x, y, cellType);
      lookingAhead = false;
    }

    //move if theres an empty space
    else if (grid[y + dy * i][x + dx * i].topLayer === "empty") {
      lookingAhead = false;
      cellMovement(x, y, dx, dy, cellType);
    }

    //dont move if there are 2 boxes in a row
    if (grid[y + dy * i][x + dx * i].topLayer === "box") {
      if (lastSeenIsBox || cellType === "box") {
        turnAround(x, y, cellType);
        lookingAhead = false;
      }

      lastSeenIsBox = true;
    }

    else {
      lastSeenIsBox = false;
    }

    if (grid[y + dy * i][x + dx * i].topLayer === "playerOnRailUp" && dy === 1) {
      turnAround(x, y, cellType);
      lookingAhead = false;
    }

    if (grid[y + dy * i][x + dx * i].topLayer === "playerOnRailDown" && dy === -1) {
      turnAround(x, y, cellType);
      lookingAhead = false;
    }

    if (grid[y + dy * i][x + dx * i].topLayer === "playerOnRailLeft" && dx === 1) {
      turnAround(x, y, cellType);
      lookingAhead = false;
    }

    if (grid[y + dy * i][x + dx * i].topLayer === "playerOnRailRight" && dx === -1) {
      turnAround(x, y, cellType);
      lookingAhead = false;
    }

    

    // if theres no wall or empty on topLayer, it must be a player or box, repeat looking one more cell ahead. 
    // NOTE TO SELF: DONT ADD MORE TOP LAYER STUFF WITHOUT UPDATING THIS
  }
}

function turnAround(x,y,cellType) {
  if (cellType === "playerOnRailUp") {
    grid[y][x].tempVar = "playerOnRailDown";
  }
  if (cellType === "playerOnRailDown") {
    grid[y][x].tempVar = "playerOnRailUp";
  }
  if (cellType === "playerOnRailLeft") {
    grid[y][x].tempVar = "playerOnRailRight";
  }
  if (cellType === "playerOnRailRight") {
    grid[y][x].tempVar = "playerOnRailLeft";
  }
}

function cellMovement(x, y, dx, dy, cellType) {
  //move the cell by updating the tempVars
  if (grid[y + dy][x + dx].bottomLayer === "hole") {
    grid[y + dy][x + dx].tempVar = "filledHole";
    console.log(grid[y + dy][x + dx].tempVar);
  }

  //turns players on rails into correct on rail directions
  if (grid[y + dy][x].bottomLayer === "vRail") {
    if (dy === 1) {
      grid[y + dy][x].tempVar = "playerOnRailDown";
    }
    if (dy === -1){
      grid[y + dy][x].tempVar = "playerOnRailUp";
    }
  }
  if (grid[y][x + dx].bottomLayer === "hRail") {
    if (dx === 1) {
      grid[y][x + dx].tempVar = "playerOnRailRight";
    }
    if (dx === -1){
      grid[y][x + dx].tempVar = "playerOnRailLeft";
    }
  }

  //turns on rails back into players when off of rails
  if (cellType !== "player" && cellType !== "box" && cellType !== "boxFromRail" && (grid[y + dy][x + dx].bottomLayer === "ground" || grid[y + dy][x + dx].bottomLayer === "filledHole")) {
    grid[y + dy][x + dx].tempVar = "player";
  }
  else if (grid[y + dy][x + dx].tempVar === "none" || grid[y + dy][x + dx].tempVar === "empty") {
    if (cellType === "boxFromRail") {
      grid[y + dy][x + dx].tempVar = "box";
    } 
    else {
      grid[y + dy][x + dx].tempVar = cellType;
    }
  }

  //if a cell is going to move into this space, it wont overwrite the tempVar
  if (grid[y][x].tempVar === "none") {
    grid[y][x].tempVar = "empty";
  }
}

function draw() {
  background("pink");
  if (currentLevel >= 0) {
    imageMode(CORNER);
    textAlign(CENTER, CENTER);
    textSize(cellSize);
    push();
    if (!levelMaking) {
      translate(width/2 - ROWS*cellSize/2, 0);
    }
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        cellDisplay(grid[y][x].bottomLayer, x, y);
        cellDisplay(grid[y][x].topLayer, x, y);
      }
    }
    pop();
    imageMode(CENTER);
    if (levelComplete) {
      image(winScreen, width/2, height/2, 400, 400);
    }

    if (currentLevel === 0) {
      text("Use WASD to move", width/2, height/4);
      text("Fill all holes to win", width/2, height/1.25);
    }

    if (currentLevel === 1) {
      text("Use R to reset", width/4, height/4);
      text("And X to undo", width/1.35, height/1.7);
    }
  }
  else if (currentLevel < 0) {
    for (let i = 0; i < buttons.length; i++) {
      // NOTE TO SELF: this causes an error to happen when staring a level, but the program keeps going so its fine??????
      buttons[i].display();
    }
    if (currentLevel === -2) {
      imageMode(CENTER);
      image(title, width/2, height/2.5, 800, 400);
    }
  }
}

function cellDisplay(cellType, gridX, gridY) {
  if (cellType !== "empty") {
    let x = gridX * cellSize;
    let y = gridY * cellSize;
    image(imageMap.get(cellType), x, y, cellSize, cellSize);
  }
}

function mousePressed() {
  if (currentLevel < 0) {
    let tempLength = buttons.length;
    for (let i = 0; i < tempLength; i++) {
      buttons[i].pressed();
    }
  }
}

function loadLevel() {
  buttons = [];
  if (currentLevel >= 0) {
    //loads the current level
    gridMemory = [];
    grid = structuredClone(levels[currentLevel]);
  }
  else if (currentLevel === -2) {
    let someButton = new Button(width/2, height/1.25, 200, 50, -1, "Start");
    buttons.push(someButton);
  }
  else if (currentLevel === -1) {
    let buttonLevel = 0;
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 5; x++) {
        let someButton = new Button(width/4 + x * width/8, height/4 + y * height/4, 50, 50, buttonLevel, buttonLevel + 1);
        buttons.push(someButton);
        buttonLevel++;
      }
    }
  }
}

function createEmpty2dArray(ROWS,COLS) {
  //leftover / used for level creation
  
  let newGrid = [];
  for (let y = 0; y < ROWS; y++) {
    newGrid.push([]);
    for (let x = 0; x < COLS; x++) {
      let emptyCell = {
        bottomLayer: "empty",
        topLayer: "empty",
        tempVar: "none",
      };
      newGrid[y].push(emptyCell);
    }
  }
  return newGrid;
}