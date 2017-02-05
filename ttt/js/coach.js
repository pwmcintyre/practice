'use strict'

class Coach {

    constructor(players, opp) {
        this.opponent = opp || new Rando();
        this.players = players || Coach.findRandomPlayers(100);
        this.top = [];
        this.generations = [];
        this.workers = new Workers();
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

    train(generations, iterations, current) {

        var self = this;
        current = current || 1;

        this.testPlayers(iterations, function(results){
            
            self.benchmark (self);

            console.log( `Gen: ${current} (+${generations - current}) with ${self.players.length} players`, self.top[0].scorecard );

            if (current < generations) {
                self.nextGeneration();
                self.train(generations, iterations, current + 1);
            }
        });
    }

    // competes all players against a single opponent x times each
    testPlayers(iterations, callback) {

        iterations = iterations || 1000;

        var self = this;
        var jobs = this.players.map(function(player, playerIdx){
            return {
                dna: player.dna,
                opponent: self.opponent && self.opponent.dna ? self.opponent.dna : null,
                iterations: iterations
            }
        });

        var self = this;
        this.workers.process(jobs, function(results){

            // save players
            self.players = results;

            // get the top x players
            var top = self.topPlayers(2);

            // save
            // self.generations.push(top[0]); // too much memory!
            self.top.push(...top);
            self.top = self.top.sort(sortPlayers).slice(0,10);

            // cleanup
            top = undefined;
            results = undefined;

            callback && callback();
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
        newPlayers = newPlayers.concat(
            Coach.findRandomPlayers( newCount ) );

        // save
        this.players = newPlayers;
    }

    // scores a player based on performance
    static scorePlayer( scorecard ) {
        return (scorecard.win * 100 + scorecard.tie * 45) / scorecard.gamesPlayed;
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