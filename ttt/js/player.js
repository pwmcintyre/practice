'use strict'

// var me = new Human()
// var coach = new Coach();
// coach.train(100)
// coach.players = coach.topPlayers(10)
// coach.setOpponent( coach.topPlayers(1)[0] )
// var you = new Neuro( coach.topPlayers()[0].dna )
// var game = (new Game()).with(me,you).play()
// me.makeMove(1)

class Player {

    // For syncronous games
    getRecommendations (board) {
        throw new Error("Not implemented");
    }

    // For asyncronous games
    yourTurn( callback, game ) {
        var move = this.getRecommendations(game);
        callback( move );
    }

    // Reproduction
    static mate (a, b) {
        throw new Error("Not implemented");
    }

    toString() {
        return "Player";
    }
}

class Human extends Player {

    yourTurn( callback, board ) {
        // save the callback for when human decides on a move
        this.makeMove = callback;
        this.board = board;

        console.log("It's your turn, " + this.toString());
        console.log(game.board.toString());
    }

    toString() {
        return "Human";
    }
}

class Rando extends Player {

    getRecommendations (game) {

        // get all the moves
        var moves = game.board.getAvailableMoves();

        // make any ol' random valid move
        var r = Math.floor(Math.random() * moves.length);
        
        return moves[r];
    }

    static mate (a, b) {
        return new Rando();
    }

    toString() {
        return "Random";
    }
}

class Neuro extends Player {

    constructor(dna) {
        super();
        this.dna = dna || "";
    }

    init(){
        if ( !this.network ) {
            this.network = new NeuralNet({inputs:18, outputs:9}, this.dna);
            this.network.update();
        }

        return this;
    }

    getRecommendations (game) {

        this.init();

        var availableMoves = game.board.getAvailableMoves();

        // look at the board
        this.network.setInputs( board.playerBoardToArray() );

        // think about it
        this.network.update();

        // get ideas
        var o = this.network.getOutputs();

        // take the ones that make sense (available)
        var recommendations = o.map(function(v,i,a){
            return {
                positionIndex: i,
                position: (1 << i),
                score: v
            }
        }).filter(function(r){
            return availableMoves.indexOf(r.position) >= 0;
        }).sort(function(a,b){
            return b.score - a.score
        });

        // return the best idea
        return recommendations[0].position;
    }
    
    static get PROBABILITY_OF_MUTATION () { return 0.01; }
    static mate (a, b, count) {

        var length = Math.max(a.length, b.length);

        var children = [];
        var random, dna;
        
        while (children.length < count) {

            random = NeuralNet.randomDNA(length);
            dna = '';

            while (dna.length < length) {

                if ( Math.random() < Neuro.PROBABILITY_OF_MUTATION ) {
                    // mutate
                    dna += random.substr(dna.length, NeuralNet.DNA_PRECISION);
                } else {
                    // random from parents
                    if ( Math.random() > 0.5 ) {
                        dna += a.substr(dna.length, NeuralNet.DNA_PRECISION);
                    } else {
                        dna += b.substr(dna.length, NeuralNet.DNA_PRECISION);
                    }
                }
            }

            children.push( new Neuro(dna) );

        }
        return children;
    }
    
    toString() {
        return "Neuro";
    }
}