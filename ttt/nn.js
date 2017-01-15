
class NN {
    constructor (inputs, outputs, options, weights) {
        this.inputs = inputs || new Array(18);
        this.outputs = outputs || 9;
        this.options = options || {
            layers: [this.inputs.length, 20,20, this.outputs]
        }

        // calculate how many weights we'll need
        this.synapseCount = 0
        for (var i = 1; i < this.options.layers.length; i++) {
            this.synapseCount += this.options.layers[i-1] *
                this.options.layers[i];
        }

        // expecting weights to be a string of hex
        // if it's too short, fill it out
        this.weights = weights || '';
        this.weights = this.weights.split('').map(function(a,b){return parseInt(a,16)||0});
        for (var i = this.weights.length; i <  this.synapseCount; i++) {
            this.weights.push( NN.randomWeight() );
        }

        // build layers
        // this includes input and output layer
        this.layers = new Array();
        for (var i = 0; i < this.options.layers.length+1; i++) {
            this.layers.push([]);
            for (var j = 0; j < this.options.layers[i]; j++) {
                // hidden layers start with no value
                // and have inputs from the previous layer
                // and are given weights
                
                // previous layer is empty if layer 0
                var prevLayer = i ? this.layers[i-1] : [];
                
                // from the weights list,
                // pull off enough for the previous layer
                var w = this.weights.splice(0, prevLayer.length);

                // if inputs layer, take inputs value
                var v = i ? this.inputs[j] : 0;

                var n = new Node(v, w, prevLayer);
                this.layers[i].push(n);
            }
        }

    }

    static get WEIGHT_MIN() { return 0x0 }
    static get WEIGHT_MAX() { return 0xF }

    static randomWeight() {
        return Math.round( NN.WEIGHT_MIN + 
            Math.random() * (NN.WEIGHT_MAX - NN.WEIGHT_MIN) );
    }
}

class Node {
    constructor (value, weights, inputs, outputs) {
        this.value = value || 0;
        this.inputs = inputs || [];
        this.outputs = outputs || [];
        this.weights = weights || [];
    }
}