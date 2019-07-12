// node factory for mcts
// thought this would be bigger, could probably reside in mtcs.js
const nodeFactory = {};
nodeFactory.newNode = (parent, move, state, childMoves) => {
    const node = {
        move,
        state,
        plays: 0,
        wins: 0,
        parent
    }

    // move comes with move and state
    node.children = childMoves.map((move) => {
        return {move: move.move, node: null};
    })

    return node;
};

module.exports = nodeFactory;