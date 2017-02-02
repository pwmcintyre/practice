'use strict'

class Player {

    getRecommendations (availableMoves, board) {
        throw new Error("Not implemented");
    }
    yourTurn( callback ) {
        throw new Error("Not implemented");
    }
    static mate (a, b) {
        throw new Error("Not implemented");
    }
    toString() {
        return "Player";
    }
}

class Human extends Player {
    getRecommendations (availableMoves, board) {
        this.callback = callback;
        this.availableMoves = availableMoves;
        this.board = board;
        
        return this.move || 0;
    }
    yourTurn( callback, board ) {
        // save the callback for when human decides on a move
        this.makeMove = callback;
        this.board = board;
    }
    makeMove( move ){
        this.makeMove( move );
    }
    static mate (a, b) {
        throw new Error("I can't help you");
    }
    toString() {
        return "Human";
    }
}

class Rando extends Player {
    getRecommendations (availableMoves, board) {
        var r = Math.floor(Math.random()*availableMoves.length);
        return availableMoves[r];
    }
    yourTurn( callback, board ) {
        // get all the moves
        var moves = board.getAvailableMoves();

        // make any ol' random valid move
        var r = Math.floor(Math.random() * moves.length);

        callback( moves[r] );
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
    yourTurn( callback, board ) {
        var moves = board.getAvailableMoves();
        var move = this.getRecommendations(moves, board);
        callback( move );
    }
    getRecommendations (availableMoves, board) {

        if ( !this.network )
            this.network = new NeuralNet({inputs:18, outputs:9}, this.dna);

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
            return a.score - b.score
        });

        // return the best idea
        return recommendations[0].position;
    }
    
    static get PROBABILITY_OF_MUTATION () { return 0.8; }
    static mate (a, b, count) {

        var length = Math.max(a.length, b.length);

        var children = [];
        var random, dna;
        
        while (children.length < count) {

            random = NeuralNet.randomWeight(length);
            dna = '';

            while (dna.length < length) {

                if ( Math.random() > NeuralNet.PROBABILITY_OF_MUTATION ) {
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