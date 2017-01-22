class Coach {

    constructor(players, opp) {
        this.opponent = opp || new Rando();
        this.players = players || Coach.findRandomPlayers(20);
        this.top = [];
        this.generations = [];
        this.workers = [...new Array(40)].map(() => new Worker('js/coach_worker.js') );
    }

    static findRandomPlayers (howMany) {
        return [...new Array(howMany)].map(() => new Neuro() )
    }

    setPlayers(playerArray) {
        this.players = playerArray;
    }

    setOpponent(opp) {
        this.opponent = opp;
    }

    benchmark (context) {

        if (!context.lastBenchmark) {
            context.lastBenchmark = new Date();
            return;
        }

        var now = new Date();
        var seconds = (now.getTime() - context.lastBenchmark.getTime()) / 1000;
        context.lastBenchmark = now;
        console.log(`Time since last benchmark: ${seconds}`);
    }

    train(generations, current) {

        var self = this;

        this.testPlayers(null, function(results){
            
            self.benchmark (self);

            console.log( `Best of generation ${self.generations.length}: `,  self.generations[self.generations.length-1][0].scorecard );
            console.log( "Best ever: ", self.top[0].scorecard, self.top[0].scorecard.moves );
            console.log( `continuing for another ${generations - self.generations.length} generations` );

            if (self.generations.length < generations) {
                self.nextGeneration();
                self.train(generations, self.generations.length - 1);
            }
        });
    }

    // competes all players against a single opponent x times each
    testPlayers(iterations, callback) {

        iterations = iterations || 1000;

        var promises = [];
        var workers = this.workers;

        // Each player
        this.players.forEach(function(player, playerIdx){
            
            // create a promise, push to stack
            promises.push( new Promise( function(resolve, reject) {

                    // create worker thread
                    // var worker = new Worker('js/coach_worker.js');
                    var worker = workers[playerIdx];

                    // add callback
                    worker.onmessage = function(e) {
                        // console.log(e.data.scorecard, e.data.dna.substr(0,10));
                        resolve(e.data);
                    };

                    // begin
                    worker.postMessage({
                        dna: player.dna,
                        iterations: iterations
                    });
                }
            ));

        });

        // when all workers are done
        Promise.all(promises).then(results => { 

            // save players
            this.players = results;

            // get the top x players
            var top = this.topPlayers(2);

            // save
            this.generations.push(top);
            this.top.push(...top);
            this.top = this.top.sort(sortPlayers);

            callback && callback(results);
        });
    }

    // breeds the top players
    static get ADD_RANDOM_TO_GENERATION() { return 0.1 }
    nextGeneration() {

        var newCount = Math.ceil(this.players.length * Coach.ADD_RANDOM_TO_GENERATION);
        var oldCount = this.players.length - newCount;

        // shuffle top players
        var top = this.top;
        shuffle( top );

        // use player length to keep same population
        // TODO: make work for more than 2 survivors
        var newPlayers = Neuro.mate(top[0].dna, top[1].dna, oldCount);

        // Add a dash of new players
        newPlayers = newPlayers.concat( Coach.findRandomPlayers( newCount ) );

        // save
        this.players = newPlayers;
    }

    // scores a player based on performance
    static scorePlayer( scorecard ) {
        return scorecard.win * 100 +
            scorecard.tie * 50;
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