class Coach {

    constructor(players, opp) {
        this.opponent = opp || new Rando();
        this.players = players || [...new Array(10)].map(() => new Neuro() );
    }

    setPlayers(playerArray) {
        this.players = playerArray;
    }

    setOpponent(opp) {
        this.opponent = opp;
    }

    // competes all players against a single opponent x times each
    train(iterations) {

        iterations = iterations || 1000;

        var opp = this.opponent;
        this.players.forEach(function(player){

            var scorecard = {
                score: 0,
                win:  0,
                loss: 0,
                tie:  0
            }

            for (var i = 0; i < iterations; i++) {

                // TODO: swap sides occasionally
                var result = Game.play([opp, player]);
                scorecard.win  += result.winner === 0 ? 1 : 0;
                scorecard.loss += result.winner === 1 ? 1 : 0;
                scorecard.tie  += result.winner === undefined ? 1 : 0;
            }

            player.scorecard = scorecard;

            // overall score
            player.scorecard.score = Coach.scorePlayer(player);

            console.log( player.scorecard, player );
        });
    }

    nextGeneration() {
        
        var top = shuffle( this.topPlayers(2) );
        var newPlayers = [];

        // use player length to keep same population
        for (var i = 0; i < this.players.length; i++) {
            newPlayers.push( Player.mate(top[i], top[(i+1)%top.length]) );
        }

        this.players = newPlayers;
    }

    // scores a player based on performance
    static scorePlayer( player ) {
        return player.scorecard.win * 100 +
            player.scorecard.tie * 50;
    }

    // sorts player array and returns top x
    topPlayers(howMany) {
        howMany = howMany || 2;
        return this.players.sort(function(a,b){
            return b.scorecard.score - a.scorecard.score;
        }).slice(0,howMany);
    }
}

function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}