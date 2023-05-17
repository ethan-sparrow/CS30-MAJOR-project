// project title
// Ethan Sparrow
// April 25th 2023
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

const ROWS = 20;
const COLS = 20;
let cellSize;
let grid;
let levelMaking = false;
let currentLevel = -2;
let levels = [];
let buttons = [];

class Button {
  constructor (x, y, width, height, level) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.level = level;
  }

  display() {
    rectMode(CENTER);
    fill ("grey");
    rect(this.x, this.y, this.width, this.height);
  }

  pressed() {
    if(mouseX > this.x - this.width/2 && mouseY > this.y - this.height/2 && mouseX < this.x + this.width/2 && mouseY < this.y + this.height/2) {
      currentLevel = this.level;
      loadLevel();
    }

  }
}

function preload() {
  let levelAmount = 5; //NOTE TO SELF: change when new levels are added

  for (let i = 0; i < levelAmount; i++) {
    levels.push(loadJSON(`levels/${i}.json`));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  loadLevel();

  if (width < height) {
    cellSize = width/COLS;
  }
  else {
    cellSize = height/ROWS;
  }
}

function keyPressed() {
  if (currentLevel >= 0) {
  //for editing purposes
    let x = Math.floor(mouseX/cellSize);
    let y = Math.floor(mouseY/cellSize);
    if (key === "`") {
      levelMaking = true;
    }
  
    if (levelMaking) {
      if ( key === "e") {
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

      //used to save levels ive made
      if (key === ".") {
        saveJSON(grid, "level");
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
    
  }
  if (keyCode === BACKSPACE) {
    currentLevel = -2;
    loadLevel();
  }
}

function update_grid(player_dx, player_dy) {
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
        grid[y][x].bottomLayer = "ground";
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
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (grid[y][x].bottomLayer === "ground") {
          fill("pink");
        }
        if (grid[y][x].bottomLayer === "hole") {
          fill("black");
        }
        if (grid[y][x].topLayer === "wall") {
          fill("purple");
        }
        if (grid[y][x].topLayer === "player") {
          fill("grey");
        }
        if (grid[y][x].topLayer === "box") {
          fill("blue");
        }
        rect(x*cellSize, y*cellSize, cellSize, cellSize);
      }
    }
  }
  else if (currentLevel < 0) {
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].display();
    }
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

function createEmpty2dArray(ROWS, COLS) {
  //leftover / used for level creation
  
  let newGrid = [];
  for (let y = 0; y < ROWS; y++) {
    newGrid.push([]);
    for (let x = 0; x < COLS; x++) {
      let emptyCell = {
        bottomLayer: "ground",
        topLayer: "empty",
        tempVar: "none",
      };
      newGrid[y].push(emptyCell);
    }
  }
  return newGrid;
}

function loadLevel() {
  buttons = [];
  if (currentLevel >= 0) {
    //loads the current level
    grid = structuredClone(levels[currentLevel]);
  }
  else if (currentLevel === -2) {
    let someButton = new Button(width/2, height/2, 200, 50, -1);
    buttons.push(someButton);
  }
  else if (currentLevel === -1) {
    let buttonLevel = 0;
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 5; x++) {
        let someButton = new Button(width/4 + x * width/8, height/4 + y * height/4, 50, 50, buttonLevel);
        buttons.push(someButton);
        buttonLevel++;
      }
    }
  }
}