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
var historyMap = {};

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
        },
        wins: []
    }

    historyMap = {};

    // run test
    for (i = 0; i < e.data.iterations; i++) {

        // swap sides
        pos = i % 2;
        order = swap && pos === 0 ? [player, opponent] : [opponent, player];
        
        // play
        result = Game.play(order);

        // store history
        if(result.winner === pos){
            var key = JSON.stringify( result.game.history );
            if( !historyMap[key] ) {
                historyMap[key] = result.game.board.turn+1;
                scorecard.wins.push( result.game.history );
            }
        }

        switch (result.winner) {
            case pos:
                scorecard.win++;
                break;
            case undefined:
                scorecard.tie++;
                break;
            default:
                scorecard.loss++;
                break;
        }
        
        scorecard.moves.count += result.turnsToWin;
        scorecard.moves.min =  Math.min(scorecard.moves.min, result.turnsToWin);
        scorecard.moves.max =  Math.max(scorecard.moves.max, result.turnsToWin);
    }

    scorecard.moves.avg = scorecard.moves.count / e.data.iterations;
    scorecard.gamesPlayed = e.data.iterations;
    scorecard.score = Coach.scorePlayer(scorecard);

    // post results
    postMessage({
        scorecard: scorecard,
        dna: player.network.dna
    });

    // close worker
    // close();
}