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
var swap = true;
var dna;
var iterations;
var player;
var opponent;
var scorecard;
var order;
var pos;
var result;
var i;

onmessage = function(e) {

    player = new Neuro( e.data.dna );
    opponent = e.data.opponent ? new Neuro(e.data.opponent) : new Rando();

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
    for (i = 0; i < e.data.iterations; i++) {

        // swap sides
        pos = i % 2;
        order = swap && pos === 0 ? [player, opponent] : [opponent, player];
        
        // play
        result = Game.play(order);

        scorecard.win  += result.winner === pos ? 1 : 0;
        scorecard.loss += result.winner === pos ? 0 : 1;
        scorecard.tie  += result.winner === undefined ? 1 : 0;
        scorecard.moves.count += result.turnsToWin;
        scorecard.moves.min =  Math.min(scorecard.moves.min, result.turnsToWin);
        scorecard.moves.max =  Math.max(scorecard.moves.max, result.turnsToWin);
    }

    scorecard.moves.avg = scorecard.moves.count / e.data.iterations;
    scorecard.score = Coach.scorePlayer(scorecard);

    // post results
    postMessage({
        scorecard: scorecard,
        dna: player.network.dna
    });

    // close worker
    // close();
}