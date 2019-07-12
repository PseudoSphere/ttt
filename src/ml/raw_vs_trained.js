// DESTROY THIS TRASH AND BUILD IT RIGHT. GL HF GG



let agentTrained = require('./agent.js');
const _ = require('lodash');
let gameInit = require('./ttt.js');
const game = _.cloneDeep(gameInit);

let agentRaw = _.cloneDeep(agentTrained);

let searchSize = 100;
let games = 100;


let trained_random_x = {
    Trained: 0,
    Random: 0,
    Draw: 0
}

// Trained as X vs Random
for(let i = 0; i < games; i++) {
    if(i%10 === 0) {
        console.log('Trained as X vs Random', i);
    }
    let move;
    let xMove = true;
    agentTrained.search(searchSize);
    while(!game.isDone()) {
        if(xMove) {
            move = agentTrained.pickMove(searchSize);
        } else {
            const options = game.validMoves();
            const picked = Math.floor(Math.random() * options.length);
            move = options[picked].move;
        }
        game.update(move);
        agentTrained.update(move);
        xMove = !xMove;
    }

    if(game.getWinner() === 1) {
        trained_random_x.Trained++;
    } else if(game.getWinner() === -1) {
        trained_random_x.Random++;
    } else {
        trained_random_x.Draw++;
    }

    agentTrained.newGame();
    game.newGame();
}


let trained_random_o = {
    Trained: 0,
    Random: 0,
    Draw: 0
}

// Trained as O vs Random
for(let i = 0; i < games; i++) {
    if(i%10 === 0) {
        console.log('Trained as O vs Random', i);
    }
    let move;
    let xMove = true;
    agentTrained.search(searchSize);
    while(!game.isDone()) {
        if(xMove) {
            const options = game.validMoves();
            const picked = Math.floor(Math.random() * options.length);
            move = options[picked].move;
        } else {
            move = agentTrained.pickMoveRaw(searchSize);
        }
        game.update(move);
        agentTrained.update(move);
        xMove = !xMove;
    }

    if(game.getWinner() === 1) {
        trained_random_o.Random++;
    } else if(game.getWinner() === -1) {
        trained_random_o.Trained++;
    } else {
        trained_random_o.Draw++;
    }

    agentTrained.newGame();
    game.newGame();
}

// RAW VS RANDOM
let raw_random_x = {
    Raw: 0,
    Random: 0,
    Draw: 0
}

// Raw as X vs Random
for(let i = 0; i < games; i++) {
    if(i%10 === 0) {
        console.log('Raw as X vs Random', i);
    }
    let move;
    let xMove = true;
    agentRaw.searchRaw(searchSize);
    while(!game.isDone()) {
        if(xMove) {
            move = agentRaw.pickMoveRaw(searchSize);
        } else {
            const options = game.validMoves();
            const picked = Math.floor(Math.random() * options.length);
            move = options[picked].move;
        }
        game.update(move);
        agentRaw.update(move);
        xMove = !xMove;
    }

    if(game.getWinner() === 1) {
        raw_random_x.Raw++;
    } else if(game.getWinner() === -1) {
        raw_random_x.Random++;
    } else {
        raw_random_x.Draw++;
    }

    agentRaw.newGame();
    game.newGame();
}


let raw_random_o = {
    Raw: 0,
    Random: 0,
    Draw: 0
}

// Raw as O vs Random
for(let i = 0; i < games; i++) {
    if(i%10 === 0) {
        console.log('Raw as O vs Random', i);
    }
    let move;
    let xMove = true;
    agentRaw.searchRaw(searchSize);
    while(!game.isDone()) {
        if(xMove) {
            const options = game.validMoves();
            const picked = Math.floor(Math.random() * options.length);
            move = options[picked].move;
        } else {
            move = agentRaw.pickMoveRaw(searchSize);
        }
        game.update(move);
        agentRaw.update(move);
        xMove = !xMove;
    }

    if(game.getWinner() === 1) {
        raw_random_o.Random++;
    } else if(game.getWinner() === -1) {
        raw_random_o.Raw++;
    } else {
        raw_random_o.Draw++;
    }

    agentRaw.newGame();
    game.newGame();
}

console.log('Raw as X vs Random:', raw_random_x);
console.log('Raw as O vs Random:', raw_random_o);
console.log('Trained as X vs Random:', trained_random_x);
console.log('Trained as O vs Random:', trained_random_o);