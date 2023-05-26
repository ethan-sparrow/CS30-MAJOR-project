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
let currentLevel = 0;
let levels = [];
let buttons = [];
let player, ground, boxi, wall, hole, filledHole, title;
let imageMap = new Map();

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
  let levelAmount = 2; //NOTE TO SELF: change when new levels are added

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

  title = loadImage("images/title.png");

  imageMap.set("player", player);
  imageMap.set("ground", ground);
  imageMap.set("box", boxi);
  imageMap.set("wall", wall);
  imageMap.set("hole", hole);
  imageMap.set("filledHole", filledHole);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  loadLevel();

  cellSize = height/ROWS;
}

function keyPressed() {
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

    if (key === "x") {
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
  gridMemory.push(structuredClone(grid));

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {

      //player updates
      if (grid[y][x].topLayer === "player") {
        //NOTE TO SELF: consider making this a function, espesially if more boxes are added

        //a system to stop players from moving into other players or boxes when against eachother
        let lookingAhead = true;
        let lastSeenIsBox = false;
        for (let i = 1; lookingAhead; i++) {
            
          //dont move if theres a wall down the line
          if (grid[y + player_dy * i][x + player_dx * i].topLayer === "wall") {
            lookingAhead = false;
          }

          //move if theres an empty space
          if (grid[y + player_dy * i][x + player_dx * i].topLayer === "empty") {
            lookingAhead = false;
            cell_movement(x, y, player_dx, player_dy, "player");
          }

          if (grid[y + player_dy * i][x + player_dx * i].topLayer === "box") {
            if (lastSeenIsBox) {
              lookingAhead = false;
            }

            lastSeenIsBox = true;
          }

          else {
            lastSeenIsBox = false;
          }

          // if theres no wall or empty on topLayer, it must be a player or box, repeat looking one more cell ahead. 
          // DONT ADD MORE TOP LAYER STUFF WITHOUT UPDATING THIS
        }
        

        if (grid[y + player_dy][x + player_dx].topLayer === "box") {
          let lookingAhead = true;
          for (let i = 2; lookingAhead; i++) {
              
            //dont move if theres a wall down the line
            if (grid[y + player_dy * i ][x + player_dx * i ].topLayer === "wall" || grid[y + player_dy * i ][x + player_dx * i ].topLayer === "box") {
              lookingAhead = false;
            }
  
            //move if theres an empty space
            if (grid[y + player_dy * i ][x + player_dx * i ].topLayer === "empty") {
              lookingAhead = false;
              cell_movement(x + player_dx, y + player_dy, player_dx, player_dy, "box");
            }
  
              
            // if theres no wall, box or empty on topLayer, it must be a player, repeat looking one more cell ahead.
            // NOTE TO SELF: DONT ADD MORE TOP LAYER STUFF WITHOUT UPDATING THIS
          } 
        }
        if (grid[y + player_dy][x + player_dx].topLayer === "empty") {
          cell_movement(x, y, player_dx, player_dy, "player"); 
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
    currentLevel++;
    loadLevel();
    console.log("no holes");
  }
}

function cell_movement(x, y, dx, dy, cellType) {
  //move the cell by updating the tempVars
  if (grid[y + dy][x + dx].bottomLayer === "hole") {
    grid[y + dy][x + dx].tempVar = "filledHole";
  }
  else {
    grid[y + dy][x + dx].tempVar = cellType;
  }

  //if a cell is going to move into this space, it wont overwrite the tempVar
  if (grid[y][x].tempVar === "none") {
    grid[y][x].tempVar = "empty";
  }
}

function draw() {
  background("pink");
  //colours every cell
  if (currentLevel >= 0) {
    imageMode(CORNER);
    if (!levelMaking) {
      translate(width/2 - ROWS*cellSize/2, 0);
    }
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        cellDisplay(grid[y][x].bottomLayer, x, y);
        cellDisplay(grid[y][x].topLayer, x, y);
      }
    }
  }
  else if (currentLevel < 0) {
    for (let i = 0; i < buttons.length; i++) {
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

function createEmpty2dArray(ROWS, COLS) {
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