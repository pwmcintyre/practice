'use strict';

class Game {

    static play (players) {
        
        // new board
        var board = new TTT();

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

    constructor (players) {
        this.players = players;
        this.reset();
        this.updateEvent;
    }

    onUpdate( func ) {
        this.updateEvent = func;
        return this;
    }

    reset() {
        this.board = new TTT();
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
            // proceed play
            var play = function(move) {
                game.play(move, game);
            }
            game.players[game.board.turn].yourTurn( play, game.board );
        } else {
            // on game completion
            game.onDone && game.onDone() ||
                game.board.winner !== undefined ? 
                    console.log( "winner", game.players[game.board.winner] ) :
                    console.log( "tie" );
        }

        return game;
    }
}
