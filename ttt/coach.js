class Coach {

    constructor(players, opp) {
        this.opponent = opp || new Rando();
        this.players = players || [new Rando()];
    }

    setPlayers(playerArray) {
        this.players = playerArray;
    }

    setOpponent(opp) {
        this.opponent = opp;
    }

    train(iterations) {
        iterations = iterations || 1000;

        for(var p = 0; p < this.players.length; p++) {
            var player = this.players
        }

        var opp = this.opponent;
        var total = {
            X: 0,
            O: 0,
            tie: 0
        }
        this.players.forEach(function(player){
            for (var i = 0; i < iterations; i++) {
                var result = Game.play([opp, player]);
                total.X   += result.winner === 0 ? 1 : 0;
                total.O   += result.winner === 1 ? 1 : 0;
                total.tie += result.winner === undefined ? 1 : 0;
                console.log(result);
            }
        });
        console.log(total);
    }
}