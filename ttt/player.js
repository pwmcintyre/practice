
class Player {
    getRecommendations (availableMoves, board) {
        throw new Error("Not implemented");
    }
    static mate (a, b, count) {
        throw new Error("Not implemented");
    }
}

class Rando extends Player {
    getRecommendations (availableMoves, board) {
        var r = Math.floor(Math.random()*availableMoves.length);
        return availableMoves[r];
    }
    static mate (a, b, count) {
        var children = [];
        for (var i = 0; i < count; i++){
            children.push( new Rando() );
        }
        return children;
    }
}

class Neuro extends Player {
    constructor() {
        super();
        this.network = new NeuralNet(new Array(18),9);
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
}