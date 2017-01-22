
'use strict'

class Workers {

    constructor (num) {

        // default to number of cores available
        num = num || navigator.hardwareConcurrency;
        // console.log( `New worker with ${num} threads` );

        this.queue = [];
        this.results = [];
        this.idle = [];
        this.workers = [...new Array(num)].map(function(a,i) {
        
            var parent = this;

            var w = {
                id: i,
                worker: new Worker('js/coach_worker.js'),
                job: null
            }

            w.worker.onmessage = function(e) {

                // console.log( `worker ${w.id} finished` );

                // save results
                parent.results.push(e.data);

                // keep moving
                w.work();
            };

            w.work = function() {

                // console.log( `worker ${w.id} starting` );

                if (parent.queue.length) {

                    // get next job
                    w.job = parent.queue.pop();
                    
                    // process
                    w.worker.postMessage( w.job.data );

                } else {

                    // console.log( `worker ${w.id} idle` );

                    // no work, go back to idle
                    parent.idle.push(w);

                    parent.done();
                }

            }

            this.idle.push( w );

        }, this);
    }

    // batches a bunch of jobs with a common callback
    process(dataArray, callback) {

        if (this.queue.length)
            throw new Error("still processing");
        
        this.callback = callback;
        
        for (var i = 0; i < dataArray.length; i++) {
            this.queue.push({
                data: dataArray[i]
            });
        }

        this.begin();
    }

    done () {

        // if no queue and workers are idle, done
        if( !this.queue.length && this.workers.length == this.idle.length ) {

            // cleanup
            var r = this.results;
            this.results = [];

            // respond
            this.callback( r );
        }
    }

    begin () {
        while (this.queue.length && this.idle.length) {
            this.idle.pop().work();
        }
    }


}