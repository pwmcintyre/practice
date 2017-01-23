'use strict';

importScripts(
        "tictactoe.js",
        "neural_net.js",
        "game.js",
        "player.js",
        "coach.js"
);

// Declare global variables (global to this thread only)
// This appears to prevent memory leaking
var swap = false;
var dna;
var iterations;
var player;
var opponent;
var scorecard;
var order;
var result;
var i;

onmessage = function(e) {

    dna = e.data.dna;
    iterations = e.data.iterations;

    player = new Neuro( dna );
    opponent = new Rando();

    scorecard = {
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
    for (i = 0; i < iterations; i++) {

        // swap sides
        order = swap && i % 2 === 0 ? [player, opponent] : [opponent,player];
        
        // play
        result = Game.play(order);

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