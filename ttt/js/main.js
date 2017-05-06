
var app = new Vue({
	el: '#app',
	data: {
		turn: 0,
		game: new Game(),
		drawBoard: new DrawBoard('canvasboard'),
		drawNet: new DrawNet('canvasnet'),
		playerX: "",
		playerO: ""
	},
	methods: {
		mounted: function(){
			console.log("Vue Loaded");
			this.init();
		},
		init: function () {

			// this.drawBoard = new DrawBoard('canvasboard');
			// this.drawNet = new DrawNet('canvasnet');

			this.playerX = new Human();
			this.PlayerO = new Neuro().init();

			this.game
			.with(this.PlayerO, this.playerX)
			.onUpdate( function(move){
				console.log( 'game updated', move );
				app.drawNet.setNeuralNet( app.PlayerO.network ).init();
				app.drawBoard.update();
			}).done( function( winner ){
				console.log( "winner", winner );
				var a = document.getElementById( "winner" ).innerHTML = 
					winner ? (winner.toString() + " wins") : "tie";
			});

			this.drawBoard.withGame( this.game )
			.onClick(function(game, move){
				console.log( move );
				game.players[game.board.turn].makeMove( move );
			});

			this.$nextTick(function () {
				app.reset();
			})
		},
		reset: function () {
			app.drawBoard.reset();
			app.game.reset().play();
		}
	}
})