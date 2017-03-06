'use strict';

class Game {

    constructor (players) {
        this.players = players;
        this.reset();
        this.updateEvent;
    }

    static get points() {
        return {
            win: 100,
            tie: 45,
            loss: 0
        }
    }

    static play (players) {
        
        // new board
        var board = new TicTacToe();

        var done = false;
        var moves = board.getAvailableMoves();

        while ( !done && moves.length ) {

            var move = players[board.turn].getRecommendations(moves, board);

            done = board.takeTurn(move);

            moves = board.getAvailableMoves();
        }

        // get winner
        var winner = moves.length ? board.turn : undefined;
        var turns = board.players[board.turn].length - 1;

        return {
            game: board,
            winner: winner,
            turnsToWin: turns
        };
    }

    onUpdate( func ) {
        this.updateEvent = func;
        return this;
    }

    reset() {
        this.board = new TicTacToe();
        this.update();
        return this;
    }

    update() {
        this.values = this.board.playerBoardToArray();
        if (this.updateEvent) this.updateEvent( this );
        return this;
    }

    with( a, b) {
        // validate players
        if ( !a && !b)
            throw new Error("Need two players");

        this.players = [a,b];

        return this;
    }

    // what to do one game finish
    done( callback ) {
        this.onDone = callback;
        return this;
    }

    // for async plays
    play ( move, game ) {

        var done = false;
        var game = game || this;

        // if move given, make it
        if (move) {
            var done = game.board.takeTurn(move);
            this.update();
        }

        if ( !done ) {

            var player = game.players[game.board.turn]

            // proceed play
            var play = function(move) {
                game.play(move, game);
            }

            player.yourTurn( play, game );
        } else {

            this.scorePlayers();

            // on game completion
            game.onDone && game.onDone() ||
                game.board.winner !== undefined ? 
                    console.log( "winner", game.players[game.board.winner] ) :
                    console.log( "tie" );
        }

        return game;
    }

    // score players
    scorePlayers() {
        var game = this;
        this.players.forEach(function(p, idx, arr){

            switch (game.board.winner) {

                // tie
                case undefined:
                    p.score = Game.points.tie
                    break;

                // win
                case idx:
                    p.score = Game.points.win
                    break;

                // tie
                default:
                    p.score = Game.points.loss
                    break;
            }
        });
    }
}
