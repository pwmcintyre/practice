'use strict';

class Game {

    static play (players) {
        
        // new board
        var t = new TTT();

        var done = false;
        var moves = t.getAvailableMoves();

        while ( !done && moves.length ) {

            var move = players[t.turn].getRecommendations(moves, t);

            done = t.takeTurn(move);

            moves = t.getAvailableMoves();
        }

        // get winner
        var winner = moves.length ? t.turn : undefined;
        var turns = t.players[t.turn].length - 1;

        return {
            game: t,
            winner: winner,
            turnsToWin: turns
        };
    }

    constructor (players) {
        this.players = players;
        this.board = new TTT();
    }

    reset() {
        this.board = new TTT();
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
                console.log( "winner", game.players[game.board.turn] );
        }

        return game;
    }
}
