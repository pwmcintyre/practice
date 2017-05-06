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
var p2;
var response = {};

onmessage = function(e) {

    var players = [];
    e.players.forEach(function(player, i, a){
        players.push( {
            player: player.dna ? new Neuro( player.dna ) : new Rando(),
            scorecard: {
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
        } )
    });

    // run test
    for (i = 0; i < e.data.iterations; i++) {

        // swap sides
        p2 = [ players[i % players.length], players[(i+1) % players.length] ]

        // play
        result = Game.play([p2[0].player, p2[1].player]);

        // score
        p2.forEach(function(p, idx, arr){
            p.scorecard.games ++;
            p.scorecard.moves += result.board.players[idx].length;
            switch (result.winner) {
                case idx:
                    p.scorecard.win++;
                    break;
                case undefined:
                    p.scorecard.tie++;
                    break;
                default:
                    p.scorecard.loss++;
                    break;
            }
        });
    }

    // post results
    response = {}
    players.forEach(function(p){
        response[p.player.dna] = p.scorecard;
    });
    postMessage(response);
}