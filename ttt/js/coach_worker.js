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
var dna = "k0o9yuhh04xkrdyyztmsltx85cpup5anr7oiwgtcdz8t8yza9c7nh6scdcxenpczepwt4abhufw6b38y4v3718rzrfuewnhl8ejndil142twwzvsr2arxkrsyo8pqf1j36ahju5ovkcfmbtkve1u0nud01w3fojc4arkfh3c4nd91ohpq7pomxnibrik391ieicrywz50a5fqoqpzqggrkl1d6huc0s4ge72hog8hibsgpzjuz30irerr37780ik5ut2183ttyu4keu1kdg8uk5t6j3972gna0us1p0nb7016usnoko14zvz4r71tkejww03tul873786c0hi9oszqn1haf3xk6fozs2cq9ytmosqqnedfzoyxjivx1tezh4a6pvfpficp7wyvklt81n6097wa16wot9ze6cieuwub0i86qutvu5k0qs0vnt2unury3wtr21ff2j40w4sbjbjaxrlpcpe62ob6ec35gcmr3ojmlnoxapmr2gqtipvaqf6j9k2fsiy269zx106jjnq7atcm77o6p0g60mxose51msc42tuvuslgpqpmpjlujo56wouhjukxn0bguau7g5j3jwxctut6odipxcl2"

onmessage = function(e) {

    player = new Neuro( e.data.dna );
    opponent = e.data.opponent ? new Neuro( e.data.opponent ) : new Rando();

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