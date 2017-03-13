var game;

var drawBoard = new DrawBoard('canvasboard');
var drawNet = new DrawNet('canvasnet');

var player1 = new Human();
var player2 = new Neuro().init();

game = (new Game())
.with(player2, player1)
.onUpdate( function(move){
  console.log( 'game updated', move );
  drawNet.setNeuralNet( player2.network ).init();
  drawBoard.update();
}).done( function( winner ){
  console.log( "winner", winner );
  var a = document.getElementById( "winner" ).innerHTML = 
    winner ? (winner.toString() + " wins") : "tie";
});

drawBoard.withGame( game )
.onClick(function(game, move){
  console.log( move );
  game.players[game.board.turn].makeMove( move );
});

reset();

function reset () {
  drawBoard.reset();
  game.reset().play();
}