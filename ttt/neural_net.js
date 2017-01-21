
class NeuralNet {
    constructor (inputs, outputs, options, dna) {

        this.inputs = inputs || new Array(18);
        this.outputs = outputs || 9;
        this.options = options || {
            layers: [this.inputs.length, 20, this.outputs]
        }

        // calculate how many weights we'll need
        this.synapseCount = 0
        for (var i = 1; i < this.options.layers.length; i++) {
            this.synapseCount += this.options.layers[i-1] *
                this.options.layers[i];
        }

        // expecting dna to be a string of hex
        // if it's too short, fill it out
        this.dna = dna || NeuralNet.randomDNA( this.synapseCount );
        if (this.dna < this.synapseCount * NeuralNet.DNA_PRECISION)
            throw new Error( "Not enough DNA" );

        // build layers
        // this includes input and output layer
        this.layers = new Array();
        var weights = NeuralNet.decodeDNA( this.dna );
        for (var i = 0; i < this.options.layers.length; i++) {
            this.layers.push([]);
            for (var j = 0; j < this.options.layers[i]; j++) {
                // hidden layers start with no value
                // and have inputs from the previous layer
                // and are given weights
                
                // previous layer is empty if layer 0
                var prevLayer = i ? this.layers[i-1] : [];
                
                // from the weights list,
                // pull off enough for the previous layer
                var w = weights.splice(0, prevLayer.length);

                // if inputs layer, take inputs value
                var v = i ? this.inputs[j] : 0;

                var n = new Node(v, w, prevLayer);
                this.layers[i].push(n);
            }
        }

    }

    static get WEIGHT_MIN()   { return -1 }
    static get WEIGHT_MAX()   { return  1 }
    static get WEIGHT_RANGE() { return NeuralNet.WEIGHT_MAX - NeuralNet.WEIGHT_MIN }

    static randomWeight() {
        return NeuralNet.WEIGHT_MIN + Math.random() * NeuralNet.WEIGHT_RANGE;
    }

    setInputs (inputs) {
        for (var i = 0; i < this.layers[0].length && i < inputs.length; i++) {
            this.layers[0][i].value = inputs[i];
        }
    }

    getDNA() {
        var d = '';
        // iterate over each node
        // excluding input layer
        for (var i = 1; i < this.layers.length; i++) {
            for (var j = 0; j < this.layers[i].length; j++) {
                var w = this.layers[i][j].weights;
                for (var k = 0; k < w.length; k++) {
                    d += NeuralNet.encode(k);
                }
            }
        }
    }

    static get DNA_BASE() { return 36 }
    static get DNA_PRECISION() { return 2 }
    static get DNA_RANGE() { return 1295 } // Base ^ precision - 1

    static randomDNA(length) {
        length *= NeuralNet.DNA_PRECISION;
        var dna = '';
        while (dna.length < length) {
            dna += NeuralNet.encode( NeuralNet.randomWeight() );
        }
        return dna;
    }

    static decodeDNA(dna) {
        var weights = [];
        for (var i = 0; i < dna.length; i += NeuralNet.DNA_PRECISION) {
            var a = dna.substr(i, NeuralNet.DNA_PRECISION)
            weights.push( NeuralNet.decode(a) );
        }
        return weights;
    }

    static encodeDNA(weights) {
        var dna = '';
        weights.forEach( w => dna += NeuralNet.encode(w) );
        return dna;
    }
    
    static decode(a) {
        // decode
        a = parseInt(a, NeuralNet.DNA_BASE);

        // reduce to fraction of base
        a = a / NeuralNet.DNA_RANGE;

        // expand to net range
        a = (a * NeuralNet.WEIGHT_RANGE) + NeuralNet.WEIGHT_MIN;

        return a;
    }
    static encode(a) {
        
        // reduce to a fraction
        a = (a - NeuralNet.WEIGHT_MIN) / NeuralNet.WEIGHT_RANGE;

        // expand to base
        a *= NeuralNet.DNA_RANGE

        // round
        a = Math.round( a );

        // encode and pad
        a =  ( "0" + a.toString(NeuralNet.DNA_BASE) ).slice(-2);

        return a;
    }

    update () {
        // iterate over each node
        // excluding input layer
        for (var i = 1; i < this.layers.length; i++) {
            for (var j = 0; j < this.layers[i].length; j++) {
                this.layers[i][j].update();
            }
        }
    }

    getOutputs () {
        return this.layers[this.layers.length-1].map( function(a){
            return a.value;
        });
    }

    toString () {
        for (var i = 0; i < this.layers.length; i++) {
            console.log( `Layer ${i} - ${this.layers[i].length} nodes` );
            for (var j = 0; j < this.layers[i].length; j++) {
                console.log( this.layers[i][j].toString() );
            }
        }
    }
}

class Node {

    constructor (value, weights, inputs, func) {
        this.value = value || 0;
        this.bias = 0; // TODO!
        this.inputs = inputs || [];
        this.weights = weights || [];
        this.activation_function = func || Node.ACTIVATION_FUNCTIONS.logistic;
    }

    update () {
        // apply the chosen activation function
        this.value = this.activation_function(this);
    }

    toString () {
        return this.value;
    }

    // all posible activation functions
    // https://en.wikipedia.org/wiki/Activation_function
    // https://www.quora.com/What-is-the-role-of-the-activation-function-in-a-neural-network
    static get ACTIVATION_FUNCTIONS() {

        return {

            logistic: function (node) {

                var sum = 0;

                for(var i = 0; i < this.inputs.length; i++) {
                    var v = this.inputs[i].value;
                    var w = this.weights[i];
                    
                    sum += w*v;
                }

                sum = 1 / ( 1 + Math.exp( -sum ) );
                // sum = Math.log( sum );
                return sum;
            }
        }
    }
}