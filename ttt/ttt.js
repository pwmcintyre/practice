
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
    X: "X",
    O: "O",
    BLANK: "-"
  } }
  static get BOARD_SIZE() { return 3 }
  static get MAX_MOVES() { return TTT.BOARD_SIZE * TTT.BOARD_SIZE }

  // lets begin
  constructor() {
    this.X = [0x000000000];
    this.O = [0x000000000];
    this.turn = true; // true = X false = 0
  }

  getX(withHistory) { return withHistory ? this.X : this.X[0]}
  getO(withHistory) { return withHistory ? this.O : this.O[0]}

  isValidMove (move) {
    // ensure move is a power of 2 (only 1 bit set)
    if ((move & -move) !== move) return false;

    // move is valid if there's no overlap with X or O's pieces
    return ( (this.X[0] | this.O[0]) & move ) === 0;
  }

  static makeMove (board, move) {
    board.unshift( board[0] |= move);
  }

  takeTurn (move) {
    // validate
    if ( !this.isValidMove(move) )
      throw new Error ("Invalide Move");

    // add the move to the current players board
    if (this.turn)
      TTT.makeMove( this.X, move);
    else
      TTT.makeMove( this.O, move);

    // swap turns
    this.turn = !this.turn;
    console.log("it's %s turn", this.turn ? TTT.DRAW.X : TTT.DRAW.O )

  }

  // returns the winning match if any
  static hasWon (board) {

    console.log("Checking board for winners", board.toString(2));

    return TTT.WIN.find( function( el ){
      console.log("checking", el.toString(2));
      // AND each scenario, all pieces must match
      return (board & el) === el
    })
  }

  getAvailableMoves () {
    var available = [];
    var move = 1;
    for (var i = 0; i < TTT.MAX_MOVES; i++) {
      if ( isValidMove(move) )
        available.push( move );
      move <<= 1;
    }
    return available;
  }

  toString (history) {

    // check history is at least 1, at most the size of our history
    history = Math.max( Math.min(history || 1, this.X.length - 1), 1);
    var temp = "";

    // go back through the plays
    for (var h = 0; h < history; h++) {

      var x = this.X[h];
      var o = this.O[h];
      var p = 1; // bit position

      console.log(x.toString(2));
      console.log(o.toString(2));

      // easiest to just loop through a grid
      for(var r = 0; r < TTT.BOARD_SIZE; r++) {
        for(var c = 0; c < TTT.BOARD_SIZE; c++) {
          
          // check who is at this position
          if (x & p) 
            temp = temp + TTT.DRAW.X;
          else if (o & p)
            temp = temp + TTT.DRAW.O;
          else
            temp = temp + TTT.DRAW.BLANK;

          // shift left 1 and start again
          p <<= 1;

        }
        temp = temp + "\n";
      }

      temp = temp + "\n\n";
    }

    return temp;
  }

};