/**
 * Created by koushikkrishnan on 2/15/15.
 */
/*
 * Class Board
 *
 * Board will store all the information for the game of Minesweeper. This
 * includes all the rules, flags, bombs, and the information in the grid.
 *
 * Board will have three 2D arrays that will act as layers:
 *
 *  bombs - the locations of all the bombs
 *  buttons - the places the user has clicked
 *  flags - the places a flag has been placed
 *  bombNums - the the number of bomb neighbors for each location
 *
 * Board will handle all the logic of the minesweeper game using these layers
 * and it will update thse layers everytime a user buttons on a location on the
 * game board.
 *
 */
function Board () {

    // set the difficulty to intermedite
    this.numRows = 16;
    this.numCols = 16;

    this.numBombs = 99;
    this.numFlags = this.numBombs;

    // set up the layers
    this.bombs = new Array();
    this.buttons = new Array(this.numRows);
    this.flags = new Array(this.numRows);
    this.bombNums = new Array(this.numRows);

    // properties of the game
    this.firstClick = true;
    this.endGame = false;
    this.win = true;

    /**
     * init() will initialize a Minesweeper game given no information at all
     * The function will fill the flag and button layers as these layers do
     * not need any prior information to be filled. The bombs layer cannot
     * be filled because it requires the first click of the user.
     */
    this.init = function() {
        this.fillButtons();
        this.fillFlags();
        this.fillBombsEmpty();
    }

    this.fillButtons = function() {
        for(var i = 0; i < this.numRows; i++) {
            var subArray = new Array();
            for (var j = 0; j < this.numCols; j++) {
                subArray.push(false);
            }
            this.buttons.push(subArray);
        }
    }

    this.fillBombsEmpty = function() {
        console.log("called");
        for(var i = 0; i < this.numRows; i++) {
            var subArray = new Array();
            for (var j = 0; j < this.numCols; j++) {
                subArray.push(false);
            }
            this.bombs.push(subArray);
        }
    }

    this.fillFlags = function() {
        for(var i = 0; i < this.numRows; i++) {
            var subArray = new Array();
            for (var j = 0; j < this.numCols; j++) {
                subArray.push(false);
            }
            this.flags.push(subArray);
        }
    }

    this.fillBombs = function(x, y) {
        var bombsPlaced = 0;
        while (bombsPlaced < this.numBombs) {
            var r = Math.floor(Math.random() * this.numRows);
            var c = Math.floor(Math.random() * this.numCols);
            if (r != x && c != y && this.bombs[r][c] == false) {
                this.bombs[r][c] = true;
                bombsPlaced++;
            }
        }
    }

    this.isLegal = function(x, y) {
        return x < numRows && y < this.numCols && x >= 0 && y >= 0;
    }

    this.expand = function(x, y) {
        var empty = [[]]
        if (!isLegal(x,y)) {
            return empty;
        }
        if (bombs[x][y] == true) {
            return empty;
        }
        if (flags[x][y] == true) {
            return empty;
        }
        if (bombNums[x][y] != 0) {
            buttons[x][y] = true;
            return empty;
        }
        if (bombs[x][y] == true) {
            buttons[x][y] = true;
            endGame = true;
            win = false;
        }
        else if (bombNums[x][y] == 0) {
            buttons[x][y] = true;

            var points = getNeighbors(x,y);

            for ( var p in points )
                if (p[0] != x && p[1] != y)
                    expand(p[0],p[1]);
        }

    }

    this.getNeighbors = function(x, y) {
        var points = [[]];
        var count = 0;
        for (var i = -1; i < 1; i++) {
            for (var j = -1; j < 1; i++) {
                if (isLegal(x + i, y + j)) {
                    points[count][0] = x + i;
                    points[count][1] = y + j;
                    count++;
                }
            }
        }
        return points;
    }

    this.showAllBombs = function() {
        // iterate through the buttons with bombs
        // under them and click them
        for (var i = 0; i < this.buttons.length; i++) {
            for (var j = 0; j < this.buttons[0].length; j++) {
                // check if there is a bomb there
                if (this.bombs[i][j] == true) {
                    // click the button here
                    this.buttons[i][j] = true;
                }
            }
        }
    }

    this.click = function(row, col) {
        // handle cases
        // is there a bomb there?
        if (bombs[row][col] == true) {
            this.endGame = true;
            this.win = false;
            this.showAllBombs();
        }
        // is
    }
}
