'use strict'

class TicTacToe {

  // All possible win scenarios
  static get WIN() { return [
    0b111000000,
    0b000111000,
    0b000000111,
    0b100100100,
    0b010010010,
    0b001001001,
    0b100010001,
    0b001010100
  ] }

  static get DRAW() { return {
    PLAYERS: ["X","O"],
    BLANK: "-"
  } }
  static get PLAYER_COUNT() { return 2 }
  static get BOARD_SIZE() { return 3 }
  static get MAX_MOVES() { return TicTacToe.BOARD_SIZE * TicTacToe.BOARD_SIZE }

  // lets begin
  constructor() {

    // array of player moves (keeps history)
    this.players = new Array(TicTacToe.PLAYER_COUNT);
    for (var i = 0; i < this.players.length; i++){
      this.players[i] = [0]
    }

    // overall board bits
    this.board = 0;

    // track whos turn
    this.turn = 0;
    this.history = [];
    this.winner;
  }

  // this collapses all players pieces
  updateBoard () {
    this.board = this.players.reduce( function(accumulator, currentValue) {
      return accumulator | currentValue[0];
    }, 0);
  }

  isValidMove (move) {
    // ensure move is a power of 2 (only 1 bit set)
    if ((move & -move) !== move) return false;

    // move is valid if there's no overlap with any current pieces
    return ( this.board & move ) === 0;
  }

  // push the new move
  static makeMove (board, move) {
    board.unshift( board[0] | move);
  }

  // rotate players
  nextPlayer () {
    this.turn = (this.turn + 1) % TicTacToe.PLAYER_COUNT;
  }

  // returns true if current player has won
  takeTurn (move) {

    // validate
    if ( !this.isValidMove(move) )
      throw new Error ("Invalide Move");

    // add the move to the current players board
    TicTacToe.makeMove( this.players[this.turn], move);

    // update board
    this.updateBoard();

    // add history
    this.history.push( this.board );
    
    // check win
    if ( TicTacToe.hasWon( this.players[this.turn][0] ) ) {
      this.winner = this.turn;
      return true;
    }

    // check tie
    if ( this.history.length >= TicTacToe.MAX_MOVES )
      return true;

    // swap turns
    this.nextPlayer();

    return false;
  }

  // returns the winning match if any
  static hasWon (board) {

    return TicTacToe.WIN.find( function( el ){
      // AND each scenario, all pieces must match
      return (board & el) === el
    })
  }

  // return array of all valid moves
  getAvailableMoves () {

    var available = [];
    var move = 1;

    for (var i = 0; i < TicTacToe.MAX_MOVES; i++) {
      if ( this.isValidMove(move) )
        available.push( move );
      move <<= 1;
    }
    return available;
  }

  // stringify the board to 2D ascii
  toString () {

    var temp = '';

    for (var i = 0; i < TicTacToe.MAX_MOVES; i++) {

      if (i > 0 && i % TicTacToe.BOARD_SIZE === 0)
        temp += "\n";

      var bitpos = 1 << i;

      if ( (this.board & bitpos) === 0 ) {

        // if empty
        temp += TicTacToe.DRAW.BLANK;

      } else {

        // loop through to find who
        for(var p = 0; p < this.players.length; p++) {
          if (this.players[p][0] & bitpos) {
            temp += TicTacToe.DRAW.PLAYERS[p];
            break;
          }
        }

      }
    }

    return temp;
  }

  playerBoardToString() {
    return this.playerBoardToArray.join('');
  }

  // return 1D array of current board pieces
  playerBoardToArray() {

    var a = [];
    for (var i = 0; i < this.players.length; i++) {
      var board = this.players[(i + this.turn) % this.players.length][0];
      while (a.length < TicTacToe.MAX_MOVES*(i+1)) {
        a.push( board & 1 === 1 );
        board >>= 1;
      }
    }
    return a;
  }

};