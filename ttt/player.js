
class Player {
    getRecommendations (availableMoves, board) {
        throw new Error("Not implemented");
    }
    static mate (a, b) {
        throw new Error("Not implemented");
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
    constructor() {
        super();
        this.network = new NeuralNet({inputs:18, outputs:9});
    }
    getRecommendations (availableMoves, board) {
        // look at the board
        var i = board.playerBoardToArray();
        this.network.setInputs(i);

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
        }).sort(function(a,b){
            return a.score - b.score
        }).filter(function(r){
            return availableMoves.indexOf(r.position) >= 0;
        });

        // return the best idea
        return recommendations[0].position;
    }
    
    static mate (a, b) {
        return new Neuro(); // TODO
    }
}