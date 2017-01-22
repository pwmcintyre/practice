'use strict';

class Game {

    static play (players) {
        
        // new board
        var t = new TTT();

        // loop until game is done`
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

    // for async plays
    play () {

        var move = this.players[this.board.turn].getRecommendations(this.board.getAvailableMoves(), this.board);
        if ( move ) {

            var done = t.takeTurn(move);
            if (done) {

                // get winner
                var winner = moves.length ? t.turn : undefined;
                var turns = t.players[t.turn].length - 1;

                return {
                    game: t,
                    winner: winner,
                    turnsToWin: turns
                };
            }
        }

    }
}
