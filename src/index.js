import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const agent = require('./ml/agent.js');

function Square(props) {
    return (
        <button className="square"
            onClick={() => { props.onClick() }}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return <Square 
            value={this.props.squares[i]} 
            onClick = {() => this.props.onClick(i)} />;
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: Array(9).fill(null),
            xIsNext: true,
            searchSize: 1000
        };
        agent.search();
        this.playerX = true;
    }

    handleClick(i) {
        // WHOMANZ
        const squares = this.state.squares.slice();
        let xIsNext = this.state.xIsNext;
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = xIsNext ? 'X' : 'O';
        xIsNext = !xIsNext;

        // COMPUTER
        // converts single location to 2 coordinates [0-2][0-2]
        function _to2D(location) {
            let x = location % 3;
            let y = (location - x) / 3;
            return [x, y];
        }
        let move = _to2D(i);
        agent.update(move);
        this.computerMove(squares, xIsNext);
    }

    computerMove(squares, xIsNext) {
        let draw = true;
        for(let i = 0; i < 9; i++) {
            if(!squares[i]) {
                draw = false;
                break;
            }
        }
        if(calculateWinner(squares) || draw) {
            this.setState({
                squares
            });
            return;
        }
        // converts 2 coordinates to single location (0-8)
        function _to1D(move) {
            return move[0] + move[1] * 3;
        }

        let move = agent.pickMove(this.state.searchSize);
        agent.update(move);
        squares[_to1D(move)] = xIsNext ? 'X' : 'O';
        this.setState({
            squares,
            xIsNext: !xIsNext
        });
    }

    newGame() {
        agent.newGame();
        const newState = Array(9).fill(null)
        this.setState({
            squares: newState,
            xIsNext: true
        });
        agent.search(); // initial search of 100 so it can update root without error
        if(!this.playerX) {
            this.computerMove(newState, true);
        }
    }

    playAsX() {
        this.playerX = true;
        this.newGame();
    }

    playAsO() {
        this.playerX = false;
        this.newGame();
    }

    updateSearchSize(event) {
        this.setState({
            searchSize: event.target.value
        });
    }

    render() {
        const winner = calculateWinner(this.state.squares);
        let status;
        if (winner) {
          status = 'Winner: ' + winner;
        } else {
          status = 'You are playing as ' + (this.state.xIsNext ? 'X' : 'O');
        }
        return (
            <div className="game">
                <h1>Tic Tac Toe Using MCTS</h1>
                <div className="game-board">
                    <Board squares={this.state.squares}
                    onClick={(i) => this.handleClick(i)}/>
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div><button onClick={() => this.newGame()}>New Game</button></div>
                    <div><button onClick={() => this.playAsX()}>Play As X</button></div>
                    <div><button onClick={() => this.playAsO()}>Play As O</button></div>
                    <div>Search Size: <input type="text" value={this.state.searchSize} onChange={(event) => this.updateSearchSize(event)}/></div>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }