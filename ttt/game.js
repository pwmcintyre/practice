class Game {
    static play (players) {
        
        // new board
        var t = new TTT();

        // loop until game is done`
        var done = false;
        var moves = t.getAvailableMoves();

        while ( !done && moves.length ) {
            var board = t.playerBoardToArray();
            var move = players[t.turn].getRecommendations(moves, board);

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
}
