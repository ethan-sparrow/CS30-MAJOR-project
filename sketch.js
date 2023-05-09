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
let currentLevel = 0;
let levels = [];

function preload() {
  //NOTE TO SELF: consider using `${}` to turn this into a for loop

  levels.push(loadJSON("levels/0.json"));
  levels.push(loadJSON("levels/1.json"));
//   levels.push(loadJSON("level2.json"));
//   levels.push(loadJSON("level3.json"));
//   levels.push(loadJSON("level4.json"));
//   levels.push(loadJSON("level5.json"));
//   levels.push(loadJSON("level6.json"));
//   levels.push(loadJSON("level7.json"));
//   levels.push(loadJSON("level8.json"));
//   levels.push(loadJSON("level9.json"));
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // grid = createEmpty2dArray(ROWS, COLS);
  loadLevel();

  if (width < height) {
    cellSize = width/COLS;
  }
  else {
    cellSize = height/ROWS;
  }
}

function keyPressed() {
  //for editing purposes
  let x = Math.floor(mouseX/cellSize);
  let y = Math.floor(mouseY/cellSize);
  if (key === "`") {
    levelMaking = true;
  }

  if (key === "r") {
    let resetLevel = `levels/${currentLevel}.json`;
    levels.splice(currentLevel, 1, loadJSON(resetLevel));
    loadLevel();
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
  //colours every cell
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
  //loads the current level
  grid = levels[currentLevel];
}


// const ROWS = 30;
// const COLS = 30;
// let grid;
// let cellSize;
// let movingY = 0;
// let movingX = 0;
// let currentLevel = 0;
// let levels = [];
// let levelMaking = false;

// function preload() {
//   levels.push(loadJSON("level0.json"));
//   levels.push(loadJSON("level1.json"));
//   levels.push(loadJSON("level2.json"));
//   levels.push(loadJSON("level3.json"));
//   levels.push(loadJSON("level4.json"));
//   levels.push(loadJSON("level5.json"));
//   levels.push(loadJSON("level6.json"));
//   levels.push(loadJSON("level7.json"));
//   levels.push(loadJSON("level8.json"));
//   levels.push(loadJSON("level9.json"));
// }

// function setup() {
//   createCanvas(windowWidth, windowHeight);
//   loadLevel();

//   if (width < height) {
//     cellSize = width/COLS;
//   }
//   else {
//     cellSize = height/ROWS;
//   }
// }

// function draw() {
//   keyboardInput();
//   moveThings(grid);
//   displayGrid(grid);
// }

// function keyboardInput() {
//   //for editing purposes
//   let x = Math.floor(mouseX/cellSize);
//   let y = Math.floor(mouseY/cellSize);
//   if (key === "`" && keyIsPressed) {
//     levelMaking = true;
//   }
  
//   if (levelMaking) {
//     if ( key === "e" && keyIsPressed) {
//       grid[y][x].bottomLayer = "ground";
//       grid[y][x].topLayer = "empty"; 
//     }
//     if (mouseIsPressed) {
//       grid[y][x].topLayer = "wall";
//     }
//     if ( key === "p" && keyIsPressed) {
//       grid[y][x].topLayer = "player";
//     }
//     if ( key === "b" && keyIsPressed) {
//       grid[y][x].topLayer = "box";
//     }
//     if ( key === "h" && keyIsPressed) {
//       grid[y][x].bottomLayer = "hole";
//     }
//   }
  
  
//   //player input
  

//   if ( key === "w"  && keyIsPressed) {
//     movingY = -1;
//   } 
//   else if (key === "s" && keyIsPressed) {
//     movingY = 1;
//   }
//   else {
//     movingY = 0;
//   }

//   if ( key === "a"  && keyIsPressed) {
//     movingX = -1;
//   } 
//   else if (key === "d" && keyIsPressed) {
//     movingX = 1;
//   }
//   else {
//     movingX = 0;
//   }
// }

// function moveThings(grid) {
//   //determine where everything moves using temporary variables
//   for (let y = 0; y < ROWS; y++) {
//     for (let x = 0; x < COLS; x++) {
//       //player movement, framecount restriction because otherwise theyd move too fast
//       if (grid[y][x].topLayer === "player" && frameCount % 5 === 0 && (movingY !== 0 || movingX !== 0)) {
//         if (grid[y + movingY][x + movingX].topLayer !== "wall" && grid[y + movingY][x + movingX].topLayer !== "player") {

//           //box pushing movement
//           if (grid[y + movingY][x + movingX].topLayer === "box" && grid[y + movingY * 2][x + movingX * 2].topLayer === "empty") {
//             if (grid[y][tempVar === "none"){
//               grid[y][tempVar tempVarEmpty";
//             }
//             grid[y + movingY][x + movingtempVar tempVarPlayer";
//             if (grid[y + movingY * 2][x + movingX * 2].bottomLayer === "ground") {
//               grid[y + movingY * 2][x + movingX * tempVar tempVarBox";
//             }
//             if (grid[y + movingY * 2][x + movingX * 2].bottomLayer === "hole") {
//               grid[y + movingY * 2][x + movingX * tempVar tempVarGround";
//             }
//           }
          
//           //empty space movemnt
//           if (grid[y + movingY][x + movingX].bottomLayer === "ground" && grid[y + movingY][x + movingX].topLayer === "empty") {
//             if (grid[y][tempVar === "none"){
//               grid[y][tempVar tempVarEmpty";
//             }
//             grid[y + movingY][x + movingtempVar tempVarPlayer";
//           }
//           if (grid[y + movingY][x + movingX].bottomLayer === "hole") {
//             if (grid[y][tempVar === "none"){
//               grid[y][tempVar tempVarEmpty";
//             }
//             grid[y + movingY][x + movingtempVar tempVarGround";
//           }
//         }
//       }
//     }
//   }
//   let remainingHoles = 0;

//   //changes temorary variables to real ones
//   for (let y = 0; y < ROWS; y++) {
//     for (let x = 0; x < COLS; x++) {
//       if (grid[y][tempVar ==tempVarPlayer") {
//         grid[y][x].topLayer = "player";
//         grid[y][tempVar = "none";
//       }
//       if (grid[y][tempVar ==tempVarBox") {
//         grid[y][x].topLayer = "box";
//         grid[y][tempVar = "none";
//       }
//       if (grid[y][tempVar ==tempVarEmpty") {
//         grid[y][x].topLayer = "empty";
//         grid[y][tempVar = "none";
//       }
//       if (grid[y][tempVar ==tempVarGround") {
//         grid[y][x].bottomLayer = "ground";
//         grid[y][tempVar = "none";
//       }
      
//       //tracks the holes left in the level and finishes the level when its done
//       if (grid[y][x].bottomLayer === "hole") {
//         remainingHoles++;
//       }
//     }
//   }
//   if (remainingHoles === 0 && levelMaking === false) {
//     currentLevel++;
//     loadLevel();
//   }
// }

// function displayGrid(grid) {
//   //colours every cell
//   for (let y = 0; y < ROWS; y++) {
//     for (let x = 0; x < COLS; x++) {
//       if (grid[y][x].bottomLayer === "ground") {
//         fill("pink");
//       }
//       if (grid[y][x].bottomLayer === "hole") {
//         fill("black");
//       }
//       if (grid[y][x].topLayer === "wall") {
//         fill("purple");
//       }
//       if (grid[y][x].topLayer === "player") {
//         fill("grey");
//       }
//       if (grid[y][x].topLayer === "box") {
//         fill("blue");
//       }
//       rect(x*cellSize, y*cellSize, cellSize, cellSize);
//     }
//   }
// }

// function createEmpty2dArray(ROWS, COLS) {
//   //leftover / used for level creation
  
//   let newGrid = [];
//   for (let y = 0; y < ROWS; y++) {
//     newGrid.push([]);
//     for (let x = 0; x < COLS; x++) {
//       let emptyCell = {
//         bottomLayer: "ground",
//         topLayer: "empty",
//      tempVar: "none",
//       };
//       newGrid[y].push(emptyCell);
//     }
//   }
//   return newGrid;
// }

// function keyPressed() {
//   //used to save levels ive made
//   if (key === ".") {
//     saveJSON(grid, "level");
//   }

//   // used to move between levels quickly
//   if (key === "0") {
//     currentLevel = 0;
//     loadLevel();
//   }
//   if (key === "1") {
//     currentLevel = 1;
//     loadLevel();
//   }
//   if (key === "2") {
//     currentLevel = 2;
//     loadLevel();
//   }
//   if (key === "3") {
//     currentLevel = 3;
//     loadLevel();
//   }
//   if (key === "4") {
//     currentLevel = 4;
//     loadLevel();
//   }
//   if (key === "5") {
//     currentLevel = 5;
//     loadLevel();
//   }
//   if (key === "6") {
//     currentLevel = 6;
//     loadLevel();
//   }
//   if (key === "7") {
//     currentLevel = 7;
//     loadLevel();
//   }
//   if (key === "8") {
//     currentLevel = 8;
//     loadLevel();
//   }
//   if (key === "9") {
//     currentLevel = 9;
//     loadLevel();
//   }
// }

// function loadLevel() {
//   //loads the next level
//   grid = levels[currentLevel];
// }

