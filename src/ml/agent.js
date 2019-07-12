// Agent
const game = require('./ttt.js');
const mctsInit = require('./mcts.js');
const _ = require('lodash');
const brain = require('brain.js');
const save = require('./save.json');
const Heap = require('heap');
const fs = require('fs');

const net = new brain.NeuralNetwork();
net.fromJSON(save);

const mcts = _.cloneDeep(mctsInit);
mcts.init(_.cloneDeep(game), net);

// main object
const agent = {};

function _flipVert(state) {
    const inverted = _.cloneDeep(state);
    // state.x and state.o
    for (const rep in inverted) {
        let temp = inverted[rep];
        for(let i = 0; i < 3; i++) {
            [temp[i], temp[i+6]] = [temp[i+6], temp[i]];
        }
    }
    return inverted;
}

function _flipHorz(state) {
    const inverted = _.cloneDeep(state);
    // state.x and state.o
    for (const rep in inverted) {
        let temp = inverted[rep];
        for(let i = 0; i < 3; i++) {
            const start = i*3;
            [temp[start], temp[start+2]] = [temp[start+2], temp[start]];
        }
    }
    return inverted;
}

function _flipFull(state) {
    const inverted = _.cloneDeep(state);
    // state.x and state.o
    for (const rep in inverted) {
        let temp = inverted[rep];
        // mirror
        for(let i = 0; i < temp.length/2; i++) {
            const mirror = temp.length - i - 1;
            [temp[i], temp[mirror]] = [temp[mirror], temp[i]];
        }
    }
    return inverted;
}

agent.train = function() {
    let dataSize = 100;
    let allData = [];
    // generate data
    do {
        let gameData = [];
        // play game
        while(!game.isDone()) {
            mcts.runSearch(500);
            let moves = mcts.scores();
            if(moves.length < 3 || Math.random() < .5) {
                mcts.updateRoot();
            } else {
                // pick from top 3
                let top = Heap.nlargest(moves, 3, (a, b) => {
                    return a.value - b.value;
                })
                let picked = top[Math.floor(Math.random() * 3)].index;
                
                mcts.updateRoot(picked);
            }
            game.update(mcts.rootMove());
            const state = game.getState();
            let  gameSymmetries = [state, _flipHorz(state), _flipVert(state), _flipFull(state)];
            gameSymmetries.forEach(value => {
                gameData.push(value);
            });
            
        }
        // allData = [[example, example, ...], ...]
        allData.push(gameData.map(moveState => {
            return {
                input: _.concat(moveState.x, moveState.o),
                output: [(game.getWinner() + 1) / 2] // [-1, 0, 1] -> [0, 0.5, 1]
            }
        }));
        game.newGame();
        mcts.init(_.cloneDeep(game), net);
    } while(--dataSize > 0);

    let trainingData = _.flatten(allData);

    // train
    net.train(trainingData, {
        iterations: 10
    });
}

agent.save = function() {
    // save
    let save = net.toJSON()

    // stringify and save JSON Object
    save = JSON.stringify(save);
    fs.writeFile("./save.json", save, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
    
        console.log("Agent Updated");
    });
}

// plays a game and displays to the console
agent.play = function() {
    while(!game.isDone()) {
        mcts.runSearch(100);
        mcts.updateRoot();
        game.update(mcts.rootMove());
        console.log(game.displayState());
    }
}

/* Stuff for playing with whomanz */
agent.update = function(move) {
    if(game.isDone()) {
        return;
    }
    let moves = mcts.scores();
    let index = -1;
    for(let i = 0; i < moves.length; i++) {
        if (moves[i].move[0] == move[0] && moves[i].move[1] == move[1]) {
            index = moves[i].index;
            break;
        }
    }
    mcts.updateRoot(index);
    game.update(move);
}

agent.search = function(size = 100) {
    mcts.runSearch(size);
}

agent.searchRaw = function(size = 100) {
    mcts.rawSearch(size);
}

agent.pickMove = function(size = 100) {
    if(game.isDone()) {
        return;
    }
    this.search(size)
    return mcts.bestPlay();
}

agent.pickMoveRaw = function(size = 100) {
    if(game.isDone()) {
        return;
    }
    this.searchRaw(size)
    return mcts.bestPlay();
}

agent.newGame = function() {
    game.newGame();
    mcts.init(_.cloneDeep(game), net);
}

module.exports = agent;