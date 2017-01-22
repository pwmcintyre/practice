'use strict'

class Player {

    getRecommendations (availableMoves, board) {
        throw new Error("Not implemented");
    }
    static mate (a, b) {
        throw new Error("Not implemented");
    }
}

class Human extends Player {
    getRecommendations (availableMoves, board) {
        this.callback = callback;
        this.availableMoves = availableMoves;
        this.board = board;
        
        return this.move || 0;
    }
    makeMove(move){
        this.move = move;
    }
    static mate (a, b) {
        throw new Error("I can't help you");
    }
}

class Rando extends Player {
    getRecommendations (availableMoves, board) {
        var r = Math.floor(Math.random()*availableMoves.length);
        return availableMoves[r];
    }
    static mate (a, b) {
        return new Rando();
    }
}

class Neuro extends Player {

    constructor(dna) {
        super();
        this.dna = dna || "";
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
        while (children.length < count) {

            var random = NeuralNet.randomWeight(length);
            
            var dna = '';
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
}