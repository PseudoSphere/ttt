// Tic Tac Toe Game Functionality
const _ = require('lodash');

const game = {
    player: 1,
    over: false,
    winner: 0,
    moveCount: 0,
    state: {
        x: Array(9).fill(0),
        o: Array(9).fill(0)
    }
};

game.newGame = function() {
    this.state.x = Array(9).fill(0);
    this.state.o = Array(9).fill(0);
    this.player = 1;
    this.over = false;
    this.winner = 0;
    this.moveCount = 0;
};

game.getState = function() {
    return this.state;
}

game.getPlayer = function() {
    return this.player;
}

game.isDone = function() {
    return this.over;
}
game.getWinner = function() {
    return this.winner;
}

// converts 2 coordinates to single location (0-8)
function _to1D(move) {
    return move[0] + move[1] * 3;
}

// converts single location to 2 coordinates [0-2][0-2]
function _to2D(location) {
    let x = location % 3;
    let y = (location - x)/3;
    return [x,y];
}

// visual representation
game.displayState = function() {
    let verbose = "";
    this.state.x.forEach((space, i) => {
        // map 0:o, 1:x, 0.5:_
        let xo = (space === 1 ? 'x' : (this.state.o[i] === 1 ? 'o' : '_'));
        // bottom row?
        verbose += i < 6 ? '_' + xo + '_' : ' ' + xo + ' ';
        // next line or barrier?
        verbose += i%3 == 2 ? '\n' : '|';
    });

    return verbose;
};

// Returns all valid moves from current state
game.validMoves = function() {
    //return all {move, state} from current state
    let moves = [];

    // loop through each space
    for(let i = 0; i < 9; i++) {
        // check empty
        if(this.state.x[i] == 0 && this.state.o[i] == 0) {
            // copy state and update to next
            let nextState = _.cloneDeep(this.state);
            if(this.player === 1) {
                nextState.x[i] = 1;
            } else {
                nextState.o[i] = 1;
            }

            // get move location
            let move = _to2D(i);

            // return both move and state
            moves.push({
                move: move,
                state: nextState
            })
        }
    }
    return moves;
}

// Update the board to the next position
game.update = function(move) {
    // Update state
    let position = _to1D(move);
    let focusState;
    if(this.player == 1) {
        focusState = this.state.x;
    } else {
        focusState = this.state.o;
    }
    focusState[position] = 1;

    // Update isDone
    // Row Check
    this.over = focusState[_to1D([(move[0] + 1)%3, move[1]])] == 1 && focusState[_to1D([(move[0] + 2)%3, move[1]])] == 1;
    // Column Check
    if (!this.over) {
        this.over = focusState[_to1D([move[0], (move[1] + 1)%3])] == 1 && focusState[_to1D([move[0], (move[1] + 2)%3])] == 1;
    }
    // Diagonals
    if(!this.over && position%2 == 0) {
        this.over = (focusState[0] == 1 && focusState[4] == 1 && focusState[8] == 1) || (focusState[2] == 1 && focusState[4] == 1 && focusState[6] == 1);
    }
    // Draw
    if(!this.over) {
        this.over = this.moveCount == 8;
    } else {
        // Set winner if one
        this.winner = this.player;
    }
    
    this.player = -this.player;
    this.moveCount++;
    return this.over;
}

module.exports = game;