
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
        throw new Error("Not implemented");
    }
}