'use strict';

importScripts(
        "tictactoe.js",
        "neural_net.js",
        "game.js",
        "player.js",
        "coach.js"
);

var swap = false;

onmessage = function(e) {

    var dna = e.data.dna;
    var iterations = e.data.iterations;

    var player = new Neuro( dna );
    var opponent = new Rando();

    var scorecard = {
        score: 0,
        win:  0,
        loss: 0,
        tie:  0,
        moves: {
            min: Infinity,
            avg: 0,
            max: 0,
            count: 0
        }
    }

    // run test
    for (var i = 0; i < iterations; i++) {

        // swap sides
        var order = swap && i % 2 === 0 ? [player, opponent] : [opponent,player];
        
        // play
        var result = Game.play(order);

        scorecard.win  += result.winner === 0 ? 1 : 0;
        scorecard.loss += result.winner === 1 ? 1 : 0;
        scorecard.tie  += result.winner === undefined ? 1 : 0;
        scorecard.moves.count += result.turnsToWin;
        scorecard.moves.min =  Math.min(scorecard.moves.min, result.turnsToWin);
        scorecard.moves.max =  Math.max(scorecard.moves.max, result.turnsToWin);
    }

    scorecard.moves.avg = scorecard.moves.count / iterations;
    scorecard.score = Coach.scorePlayer(scorecard);

    // post results
    postMessage({
        scorecard: scorecard,
        dna: player.network.dna
    });

    // close worker
    // close();
}