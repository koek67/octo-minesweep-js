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
    this.numFlags = numBombs;

    // set up the layers
    this.bombs = [[]];
    this.buttons = [[]];
    this.flags = [[]];
    this.bombNums =[[]];

    // properties of the game
    this.endGame = false;
    this.win = true;

    /**
     * init() will initialize a Minesweeper game given no information at all
     * The function will fill the flag and button layers as these layers do
     * not need any prior information to be filled. The bombs layer cannot
     * be filled because it requires the first click of the user.
     */
    this.init = function() {
        fillButtons();
        fillFlags();
    }

    this.fillbuttons = function() {
        for (var i = 0; i < numRows; i++) {
            for (var j = 0; j < numCols; j++) {
                buttons[i][j] = false;
            }
        }
    }

    this.fillFlags = function() {
        for(var i = 0; i < numRows; i++) {
            for (var j = 0; j < numCols; j++) {
                flags[i][j] = false;
            }
        }
    }

    this.fillBombs = function(var x, var y) {
        var bombsPlaced = 0;
        while (bombsPlaced < numBombs) {
            var r = Math.random() * numRows;
            var c = Math.random() * numCols;
            if (r != x && c != y && bombs[i][j] == false) {
                bombs[i][j] = true;
                bombsPlaced++;
            }
        }
    }

    this.isLegal = function(var x, var y) {
        return x < numRows && y < numCols && x >= 0 && y >= 0;
    }

    this.expand = function(var x, var y) {
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

    this.getNeighbors = function(var x, var y) {
        var points = [[]];
        var count = 0;
        for (var i = -1; i < 1; i++) {
            for (var j = -1; j < 1; i++) {
                if (isLegal(x + i, y + j)) {
                    points[count][0] = x + i;
                    points[count][1] = y + j;
                }
            }
        }
        return points;
        }

}
