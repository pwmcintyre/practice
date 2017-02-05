'use strict'

class TTT {

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
  static get MAX_MOVES() { return TTT.BOARD_SIZE * TTT.BOARD_SIZE }

  // lets begin
  constructor() {
    this.players = new Array(TTT.PLAYER_COUNT);
    for (var i = 0; i < this.players.length; i++){
      this.players[i] = [0]
    }
    this.board = 0;
    this.turn = 0;
    this.history = [];
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
    this.turn = (this.turn + 1) % TTT.PLAYER_COUNT;
  }

  // returns true if current player has won
  takeTurn (move) {

    // validate
    if ( !this.isValidMove(move) )
      throw new Error ("Invalide Move");

    // add the move to the current players board
    TTT.makeMove( this.players[this.turn], move);

    // update board
    this.updateBoard();

    // add history
    this.history.push( this.board );
    
    // check win
    if ( TTT.hasWon( this.players[this.turn][0] ) )
      return true;

    // swap turns
    this.nextPlayer();

    return false;
  }

  // returns the winning match if any
  static hasWon (board) {

    // console.log("Checking board for winners", board.toString(2));

    return TTT.WIN.find( function( el ){
      // console.log("checking", el.toString(2));
      // AND each scenario, all pieces must match
      return (board & el) === el
    })
  }

  // return array of all valid moves
  getAvailableMoves () {

    var available = [];
    var move = 1;

    for (var i = 0; i < TTT.MAX_MOVES; i++) {
      if ( this.isValidMove(move) )
        available.push( move );
      move <<= 1;
    }
    return available;
  }

  // stringify the board to 2D ascii
  toString (history) {

    // check history is at least 1, at most the size of our history
    history = Math.max( Math.min(history || 1, this.players[0].length - 1), 1);
    var temp = "";

    // go back through the plays
    for (var h = 0; h < history; h++) {

      var bitpos = 1; // bit position

      // easiest to just loop through a grid
      for(var r = 0; r < TTT.BOARD_SIZE; r++) {
        for(var c = 0; c < TTT.BOARD_SIZE; c++) {
          
          if ( (this.board & bitpos) === 0 ) {
            // if empty
            temp = temp + TTT.DRAW.BLANK;
          } else {
            // loop through to find who
            for(var p = 0; p < this.players.length; p++) {
              if (this.players[p][0] & bitpos)
                temp = temp + TTT.DRAW.PLAYERS[p];
            }
          }

          // shift left 1 and start again
          bitpos <<= 1;

        }
        temp = temp + "\n";
      }

      temp = temp + "\n\n";
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
      while (a.length < TTT.MAX_MOVES*(i+1)) {
        a.push( board & 1 === 1 );
        board >>= 1;
      }
    }
    return a;
  }

};