const nodeFactory = require('./mctsNode.js');
const _ = require('lodash');

// Monte Carlo Tree Search
const mcts = {};
mcts.init = function(game, network) {
    this.game = game;
    this.root = nodeFactory.newNode(null, null, game.getState(), game.validMoves());
    this.net = network;
}

// Generate the tree from the current root
mcts.runSearch = function(totalIterations = 1000, exploration = 1.4) {
    let iterations = 0;
    // build the tree
    do {
        let currentNode = this.root;
        let newNode = false;
        let game = _.cloneDeep(this.game);
        // phase 1: traverse the tree to an endpoint 
        // and phase 2: add a new node
        do {
            if(game.isDone()) {
                break;
            }
            // choose next child
            let confidence = -1;
            let chosen;
            currentNode.children.forEach(child => {
                if(newNode) {return;}
                // ultimate search condition
                if(child.node == null) {
                    // create new node
                    game.update(child.move);
                    child.node = nodeFactory.newNode(currentNode, child.move, game.getState(), game.validMoves());
                    newNode = true;
                    chosen = child.node;
                } else { 
                    // UCB1 selection function. Basically balances best moves with exploration
                    let newConfidence = child.node.wins / child.node.plays + 
                        exploration * Math.sqrt(Math.log(currentNode.plays) / child.node.plays)
                    if(newConfidence > confidence) {
                        chosen = child.node;
                        confidence = newConfidence;
                    }
                }
            });
            currentNode = chosen;
            if(!newNode) {
                game.update(chosen.move);
            }
        } while(!newNode);

        // needed for phase 4
        let nodePlayer = game.getPlayer();

        // phase 3: simulate a game
        while(!game.isDone()) {
            // return value of each state
            let moves = game.validMoves();
            let moveValue = moves.map(move => {
                let input = _.concat(move.state.x, move.state.o);
                let output = this.net.run(input);
                // Covers loaded nets returning objects
                if(typeof output != 'number') { 
                    output = output[0];
                }
                // flip probs for o
                if(game.getPlayer() != 1) {
                    output = 1 - output;
                }
                return output;
            });
            let bestMove = 0;
            for(let i = 1; i < moveValue.length; i++) {
                if (moveValue[i] > moveValue[bestMove]) {
                    bestMove = i;
                }
            }
            game.update(moves[bestMove].move);
        }

        // phase 4: backpropagation
        if(game.getWinner() == 0.5) {
            do {
                currentNode.plays += 1;
                currentNode.wins += 0.5;
                currentNode = currentNode.parent;
            } while(currentNode != null) 
        } else {
            let reward = game.getWinner() == nodePlayer ? 0 : 1;
            do {
                currentNode.plays += 1;
                currentNode.wins += reward;
                reward = Math.abs(reward - 1); // alternates between 0 and 1
                currentNode = currentNode.parent;
            } while(currentNode != null);
        }

    } while(++iterations < totalIterations);
};

// Generate the tree from the current root (but simulates with random moves)
mcts.rawSearch = function(totalIterations = 1000, exploration = 1.4) {
    let iterations = 0;
    // build the tree
    do {
        let currentNode = this.root;
        let newNode = false;
        let game = _.cloneDeep(this.game);
        // phase 1: traverse the tree to an endpoint 
        // and phase 2: add a new node
        do {
            if(game.isDone()) {
                break;
            }
            // choose next child
            let confidence = -1;
            let chosen;
            currentNode.children.forEach(child => {
                if(newNode) {return;}
                // ultimate search condition
                if(child.node == null) {
                    // create new node
                    game.update(child.move);
                    child.node = nodeFactory.newNode(currentNode, child.move, game.getState(), game.validMoves());
                    newNode = true;
                    chosen = child.node;
                } else { 
                    // UCB1 selection function. Basically balances best moves with exploration
                    let newConfidence = child.node.wins / child.node.plays + 
                        exploration * Math.sqrt(Math.log(currentNode.plays) / child.node.plays)
                    if(newConfidence > confidence) {
                        chosen = child.node;
                        confidence = newConfidence;
                    }
                }
            });
            currentNode = chosen;
            if(!newNode) {
                game.update(chosen.move);
            }
        } while(!newNode);

        // needed for phase 4
        let nodePlayer = game.getPlayer();

        // phase 3: simulate a game
        while(!game.isDone()) {
            // return value of each state
            const moves = game.validMoves();
            const picked = Math.floor(Math.random() * moves.length)
            game.update(moves[picked].move);
        }

        // phase 4: backpropagation
        if(game.getWinner() == 0.5) {
            do {
                currentNode.plays += 1;
                currentNode.wins += 0.5;
                currentNode = currentNode.parent;
            } while(currentNode != null) 
        } else {
            let reward = game.getWinner() == nodePlayer ? 0 : 1;
            do {
                currentNode.plays += 1;
                currentNode.wins += reward;
                reward = Math.abs(reward - 1); // alternates between 0 and 1
                currentNode = currentNode.parent;
            } while(currentNode != null);
        }

    } while(++iterations < totalIterations);
};

function _bestChild(node) {
    let best = node.children[0];
    let score = 0;
    node.children.forEach(child => {
        let childScore = child.node.wins / child.node.plays
        if(childScore > score) {
            best = child;
            score = childScore;
        }
    });
    return best;
}

// retun the current winningest child
mcts.bestPlay = function() {
    return _bestChild(this.root).move;
};

// returns scores of all children
mcts.scores = function() {
    return this.root.children.map((child, index) => {
        return {
            value: child.node.wins / child.node.plays,
            index,
            move: child.move
        }
    })
}

// Set the root to be the winningest child
mcts.updateRoot = function(child = -1) {
    // update root
    if(child < 0) {
        this.root = _bestChild(this.root).node;
    } else {
        this.root = this.root.children[child].node;
    }
    
    // update game
    this.game.update(this.root.move);

    // remove parent (to save on backprop)
    this.root.parent = null;
};

mcts.rootMove = function() {
    return this.root.move;
}

module.exports = mcts;