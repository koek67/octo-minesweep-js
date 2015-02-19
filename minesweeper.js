/** @jsx React.DOM */

var SCALE = 60;
/*
The MineSweeper component is the overarching component. It holds all
the Tiles and stores information about the game itself. This includes the
number of mines, number of bombs etc.

The minesweeper component also has functions specific to the minesweeper game
like methods that modify grid every time a user clicks on the board.
 */
var MineSweeper = React.createClass({
    timer: null,
    getInitialState: function(customState){
        clearInterval(this.timer);

        var state; // state will hold all the data of a minesweeper board
            state = {
                gridWidth: 10,
                gridHeight: 10,
                mineCount: 10,
                bestTime: 999,
                hue: Math.floor(Math.random()*360)};

        state.time = null;
        /*
        fill in the grid with mine objects with default status
         */
        var grid = [];
        for (var i = 0; i < state.gridHeight; i++){
            var tileRow = [];
            for (var j = 0; j < state.gridWidth; j++){
                tileRow.push({ mine: false, status: 'default' });
            }
            grid.push(tileRow);
        }
        state.grid = grid;

        return state;
    },
    /*
    the render function will draw each tile using the data in grid[][]

     */
    render: function() {
        var self = this;
        var tiles = this.state.grid.map(function(tileRow, i){
            var tileRow = tileRow.map(function(tile, j){
                var displayCode = '';
                if (tile.status == 'revealed'){
                    if (tile.mine){
                        displayCode = 'X';
                    } else {
                        displayCode = self.nearbyMineCount({y:i, x:j});
                        var nearbyFlaggedCount = self.nearbyFlaggedCount({y:i, x:j});
                        if (nearbyFlaggedCount > displayCode){
                            displayCode += '!';
                        }
                    }
                } else if (self.checkLoss() && tile.mine){
                    displayCode = '*';
                } else if (self.checkWin()){
                    displayCode = '$';
                } else if (tile.status == 'flagged'){
                    displayCode = '!';
                } else if (tile.status == 'maybe'){
                    displayCode = '?';
                } else {
                    displayCode = '';
                }
                return <Tile mine={tile.mine} displayCode={displayCode} x={j} y={i} key={i+'.'+j}
                    onTileClick={self.handleTileClick} onTileRightClick={self.handleTileRightClick} onTileShiftClick={self.handleTileShiftClick}/>;
            });
            return <g key={i}>{tileRow}</g>;
        });

        var concealedTileCount = _.chain(this.state.grid).flatten().filter(function(tile){ return tile.status !='revealed'; }).value().length;

        return <div>
            <div>Time: {this.state.time || '0'} seconds&nbsp;&nbsp;</div>
            <div>Mines Remaining: {this.unflaggedMineCount()}&nbsp;&nbsp;</div>
            <div>Best Time: {this.state.bestTime} seconds&nbsp;&nbsp;</div>
            <br/>
            <svg height={this.state.grid.length*SCALE} width={this.state.grid[0].length*SCALE}>
    {tiles}
            </svg>
            <br/>
            <div>Right-Click to mark as mine. Shift-Click to clear adjacent unmarked tiles.</div>
        </div>;
    },
    handleTileClick: function(e){
        if (this.checkLoss() || this.checkWin() || this.state.grid[e.y][e.x].status == 'flagged'){
            return;
        }

        // if first click of the game (no revealed tiles yet), randomly generate mines, excluding a 3x3 section around the clicked tile (to avoid a crappy start)
        if (!_.chain(this.state.grid).flatten().pluck('status').contains('revealed').value()){
            for (var i = 0; i < this.state.mineCount; i ++){
                var randY = e.y;
                var randX = e.x;
                while ((e.y - 1 <= randY && randY <= e.y + 1 && e.x - 1 <= randX && randX <= e.x + 1) || this.state.grid[randY][randX].mine){
                    randY = Math.floor(Math.random() * this.state.grid.length);
                    randX = Math.floor(Math.random() * this.state.grid[0].length);
                }
                this.state.grid[randY][randX].mine = true;
            }
        }

        this.clearNearbyTiles(e);
    },
    handleTileRightClick: function(e){
        if (this.state.grid[e.y][e.x].status == 'revealed' || this.checkLoss() || this.checkWin()){
            return;
        }
        var status = this.state.grid[e.y][e.x].status;
        if (status == 'flagged'){
            if (this.refs.maybeEnabled.getDOMNode().checked){
                this.state.grid[e.y][e.x].status = 'maybe';
            } else {
                this.state.grid[e.y][e.x].status = 'default';
            }
        } else if (status == 'maybe'){
            this.state.grid[e.y][e.x].status = 'default';
        } else {
            this.state.grid[e.y][e.x].status = 'flagged';
        }
        this.forceUpdate();
    },
    handleTileShiftClick: function(coord){
        if (this.state.grid[coord.y][coord.x].status != 'revealed' || this.checkLoss() || this.checkWin()){
            return;
        }

        var flaggedCount = 0;
        for(var i = coord.y - 1; i <= coord.y + 1; i ++){
            for(var j = coord.x - 1; j <= coord.x + 1; j++){
                if (i >= 0 && j >= 0 && i < this.state.grid.length && j < this.state.grid[0].length && this.state.grid[i][j].status == 'flagged'){
                    flaggedCount++;
                }
            }
        }
        if (this.nearbyMineCount(coord) == flaggedCount){
            for(var i = coord.y - 1; i <= coord.y + 1; i ++){
                for(var j = coord.x - 1; j <= coord.x + 1; j++){
                    if (i >= 0 && j >= 0 && i < this.state.grid.length && j < this.state.grid[0].length && this.state.grid[i][j].status != 'flagged'){
                        this.clearNearbyTiles({y:i, x:j});
                    }
                }
            }
        }
        this.forceUpdate();
    },
    mineCount: function(){
        return _.chain(this.state.grid).flatten().where({ mine: true }).value().length;
    },
    unflaggedMineCount: function(){
        if (this.checkWin()){
            return 0;
        }
        var flaggedTiles = _.chain(this.state.grid).flatten().where({ status: 'flagged' }).value().length;
        return this.mineCount() - flaggedTiles;
    },
    nearbyMineCount: function(coord){
        var mineCount = 0;
        for(var i = coord.y - 1; i <= coord.y + 1; i ++){
            for(var j = coord.x - 1; j <= coord.x + 1; j++){
                if (i >= 0 && j >= 0 && i < this.state.grid.length && j < this.state.grid[0].length && this.state.grid[i][j].mine){
                    mineCount++;
                }
            }
        }
        return mineCount;
    },
    nearbyFlaggedCount: function(coord){
        var flaggedCount = 0;
        for(var i = coord.y - 1; i <= coord.y + 1; i ++){
            for(var j = coord.x - 1; j <= coord.x + 1; j++){
                if (i >= 0 && j >= 0 && i < this.state.grid.length && j < this.state.grid[0].length && this.state.grid[i][j].status == 'flagged'){
                    flaggedCount++;
                }
            }
        }
        return flaggedCount;
    },
    clearNearbyTiles: function(coord){
        this.state.grid[coord.y][coord.x].status = 'revealed';
        if (this.nearbyMineCount(coord) == 0){
            for(var i = coord.y - 1; i <= coord.y + 1; i ++){
                for(var j = coord.x - 1; j <= coord.x + 1; j++){
                    if (i >= 0 && j >= 0 && i < this.state.grid.length && j < this.state.grid[0].length && this.state.grid[i][j].status != 'revealed'){
                        this.clearNearbyTiles({y:i, x:j});
                    }
                }
            }
        }

        if (this.state.time == null){
            this.state.time = 0;
            this.timer = setInterval(function(){
                this.setState({ time: this.state.time + 1 });
            }.bind(this), 1000);
        }

        if (this.checkLoss()){
            clearInterval(this.timer);
        }
        if (this.checkWin()){
            clearInterval(this.timer);
            if (this.state.time < this.state.bestTime){
                this.state.bestTime = this.state.time;
            }
        }

        this.forceUpdate();
    },
    checkLoss: function(){
        return _.chain(this.state.grid).flatten().some(function(tile){ return (tile.mine && tile.status == 'revealed') }).value();
    },
    checkWin: function(){
        return _.chain(this.state.grid).flatten().every(function(tile){
            return (tile.status == 'revealed' && !tile.mine) || (tile.status != 'revealed' && tile.mine);
        }).value();
    },
    handleNewGameClick: function(e){
        var newGame = {};
        newGame.gridWidth = this.refs.width.getDOMNode().value;
        newGame.gridHeight = this.refs.height.getDOMNode().value;
        newGame.mineCount = this.refs.mines.getDOMNode().value;
        this.setState(this.getInitialState(newGame));
    },
    handleHueBarClick: function(hue){
        this.setState({ hue: hue });
    }
});

/*
Tile represent one element in the minesweeper board. It is rendered using the
data in the minesweeper grid and its display is customized using its properties
of color, location, and onClick functions
 */
var Tile = React.createClass({
    getDefaultProps: function(){
        return { mine: false, displayCode: '', x: 0, y: 0, hue: 180, onTileClick: function(){}, onTileRightClick: function(){}, onTileShiftClick: function(){} };
    },
    getInitialState: function(){
        return { hovering: false };
    },
    render: function(){
        var hue = 0;
        var lightness = 0;
        var anim = false;
        switch (this.props.displayCode){
            case '': case '!': case '?': case '$':
            hue = this.props.hue;
            lightness = 60;
            break;
            case 'X': case '*':
            hue = (this.props.hue + 180) % 360;
            lightness = 60;
            break;
            default:
                hue = this.props.hue;
                lightness = 40;
        }
        if (this.state.hovering){
            //lightness += 30; // deactivated...more distracting than helpful
        }

        return <g>
            <rect x={this.props.x*SCALE} y={this.props.y*SCALE} height={SCALE} width={SCALE}
                onClick={this.handleClick} onContextMenu={this.handleContextMenu}
                onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut}
                fill={'hsl(' + hue + ',50%,' + lightness + '%)'} stroke={'hsl(' + hue + ',50%,20%)'} ref='rect' />
            <text x={(this.props.x+0.5)*SCALE} y={(this.props.y+0.7)*SCALE} textAnchor='middle' fill='white'
                onClick={this.handleClick} onContextMenu={this.handleContextMenu}
                onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut}>
                {this.props.displayCode != 0? this.props.displayCode: ''}
            </text>
        </g>;
    },
    componentDidUpdate: function(){
        switch (this.props.displayCode) {
            case '$': // randomly stagger animation on win (looks more winny)
                setTimeout(function(){
                    switch (this.props.displayCode) {
                        case '$':
                            this.refs.rect.getDOMNode().classList.add('anim');
                            break;
                    }
                }.bind(this), Math.random()*1200);
                break;
            case 'X': case '*': // simultaneous animation on loss
            this.refs.rect.getDOMNode().classList.add('anim');
            break;
            default:
                this.refs.rect.getDOMNode().classList.remove('anim');
        }
    },
    componentWillUnmount: function(){
        this.refs.rect.getDOMNode().classList.remove('anim');
    },
    handleClick: function(e){
        if (e.nativeEvent.shiftKey){
            this.props.onTileShiftClick({x: this.props.x, y: this.props.y});
        } else {
            this.props.onTileClick({x: this.props.x, y: this.props.y});
        }
        return false;
    },
    handleContextMenu: function(){
        this.props.onTileRightClick({x: this.props.x, y: this.props.y});
        return false;
    },

});





React.renderComponent(<MineSweeper />, document.body);
