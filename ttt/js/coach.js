class Coach {

    constructor(players, opp) {
        this.opponent = opp || new Rando();
        this.players = players || [...new Array(10)].map(() => new Neuro() );
        this.top = [];
        this.generations = [];
    }

    setPlayers(playerArray) {
        this.players = playerArray;
    }

    setOpponent(opp) {
        this.opponent = opp;
    }

    train(generations) {
        for (var generation = 0; generation < generations; generation++) {

            this.testPlayers();
            this.nextGeneration();

            console.log( "Best of generation `generation`: ",  this.generations[this.generations.length-1][0].scorecard );
            console.log( "Best ever: ", this.top[0].scorecard, this.top[0].scorecard.moves );
        }
    }

    // competes all players against a single opponent x times each
    testPlayers(iterations) {

        iterations = iterations || 1000;

        var opp = this.opponent;
        this.players.forEach(function(player){

            var scorecard = {
                score: 0,
                win:  0,
                loss: 0,
                tie:  0,
                moves: {
                    min: Infinity,
                    avg: 0,
                    max: 0,
                    count: 0
                }
            }

            for (var i = 0; i < iterations; i++) {

                // TODO: swap sides occasionally
                var result = Game.play([player, opp]);
                scorecard.win  += result.winner === 0 ? 1 : 0;
                scorecard.loss += result.winner === 1 ? 1 : 0;
                scorecard.tie  += result.winner === undefined ? 1 : 0;
                scorecard.moves.count += result.turnsToWin;
                scorecard.moves.min =  Math.min(scorecard.moves.min, result.turnsToWin);
                scorecard.moves.max =  Math.max(scorecard.moves.max, result.turnsToWin);
            }

            scorecard.moves.avg = scorecard.moves.count / iterations;

            player.scorecard = scorecard;

            // overall score
            player.scorecard.score = Coach.scorePlayer(player);

            // console.log( player.scorecard, player );
        });
    }

    // breeds the top players
    nextGeneration() {
        
        // get the top x players and save them
        var top = this.topPlayers(2);
        this.generations.push(top);
        this.top.push(...top);
        this.top = this.top.sort(sortPlayers);

        // shuffle them
        shuffle( top );

        // use player length to keep same population
        // TODO: make work for more than 2 survivors
        var newPlayers = top[0].mate(top[0], top[1], this.players.length);

        // save
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
        var top = this.players.sort(sortPlayers).slice(0,howMany);
        return top;
    }
}

function sortPlayers (a,b){
    return b.scorecard.score - a.scorecard.score;
}

function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}