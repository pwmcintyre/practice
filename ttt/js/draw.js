
class Draw {

	constructor ( ) {
		this.coach   = null;
		this.network = null;
		this.board   = null;

		this.init();
		// this.start();
	}

	setCoach (player) {
		this.coach = coac;;
	}

	setPlayer (player) {
		this.network = new DrawNeuro ( coach.top[0] );
	}

	resetBoard() {
		this.board   = new DrawBoard ( new TTT() );
	}

	init() {

		this.mouseTarget;	// the display object currently under the mouse, or being dragged
		this.dragStarted;	// indicates whether we are currently in a drag operation
		this.offset;
		this.update = true;

		// create stage and point it to the canvas:
		this.canvas = document.getElementById("canvas");
		this.stage = new createjs.Stage(this.canvas);

		// enable touch interactions if supported on the current device:
		createjs.Touch.enable(this.stage);

		// enabled mouse over / out events
		this.stage.enableMouseOver(10);
		this.stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

		var self = this;
		function resizeEvent (event) {
			self.canvas.setAttribute('width', self.canvas.clientWidth);
			self.canvas.setAttribute('height', self.canvas.clientHeight);
			self.reset();
		};
		resizeEvent();
		window.onresize = resizeEvent;

		this.reset();
		// createjs.Ticker.addEventListener("tick", this.tick, null, false, {self:this});
	}

	stop() {
		createjs.Ticker.removeEventListener("tick", this.tick);
	}

	start() {
		createjs.Ticker.addEventListener("tick", this.tick, null, false, {self:this});
	}

	get radius () { return 20 }

	reset () {

		var self = this;

		this.stage.removeAllChildren();

		// play board
		if (this.board) {
			var board = new createjs.Container();
			board.x = 20;
			board.y = 20;
			board.width = DrawBoard.options.size;
			board.height = DrawBoard.options.size;
			this.board.draw(board);
			self.stage.addChild(board);
		}
		
		// network
		if (this.network) {
			var network = new createjs.Container();
			network.x = 0;
			network.y = 200;
			network.width = this.canvas.width;
			network.height = this.canvas.height;
			this.network.draw(network);
			self.stage.addChild(network);
		}

		this.draw();
	}

	draw () {
		this.stage.update();
	}


	tick(event, data) {
		// this set makes it so the stage only re-renders when an event handler indicates a change has happened.
		// if (data.self.update) {
			data.self.update = false; // only update once
			data.self.stage.update(event);
		// }
	}

}

class DrawBoard {
	
	constructor ( game, canvasId ) {
		this.board;
		this.game = game;

		var a = new Human();
		var b = new Neuro();
		var game = new Game([a,b]);

		this.init();
	}

	static get options () {
		return {
			size: 60,
			padding: 2
		}
	}

	init() {

		this.mouseTarget;	// the display object currently under the mouse, or being dragged
		this.dragStarted;	// indicates whether we are currently in a drag operation
		this.offset;
		this.update = true;

		// create stage and point it to the canvas:
		this.canvas = document.getElementById("canvasboard");
		this.stage = new createjs.Stage(this.canvas);

		// enable touch interactions if supported on the current device:
		createjs.Touch.enable(this.stage);

		// enabled mouse over / out events
		this.stage.enableMouseOver(10);
		this.stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

		var self = this;
		function resizeEvent (event) {
			self.canvas.setAttribute('width', self.canvas.clientWidth);
			self.canvas.setAttribute('height', self.canvas.clientHeight);
			// self.reset();
		};
		resizeEvent();
		window.onresize = resizeEvent;

		// this.reset();
		// createjs.Ticker.addEventListener("tick", this.tick, null, false, {self:this});

		this.draw();

		var self = this;
		createjs.Ticker.addEventListener("tick", function(){
			self.stage.update();
		}, null, false, this);
	}

	draw ( ) {
		
		var board = new createjs.Container();
		board.x = 20;
		board.y = 20;
		board.width = DrawBoard.options.size * 3;
		board.height = DrawBoard.options.size * 3;
		this.stage.addChild(board);

		// Draw board
		var shape = new createjs.Shape();
		var g = shape.graphics;

		g.setStrokeStyle(4);
		g.beginStroke("#000000");

		g.moveTo( (DrawBoard.options.size + DrawBoard.options.padding), 0 );
		g.lineTo( (DrawBoard.options.size + DrawBoard.options.padding), (DrawBoard.options.size + DrawBoard.options.padding) * 3 );
		g.moveTo( (DrawBoard.options.size + DrawBoard.options.padding) * 2, 0 );
		g.lineTo( (DrawBoard.options.size + DrawBoard.options.padding) * 2, (DrawBoard.options.size + DrawBoard.options.padding) * 3 );
		g.moveTo( 0, (DrawBoard.options.size + DrawBoard.options.padding) );
		g.lineTo( (DrawBoard.options.size + DrawBoard.options.padding) * 3, (DrawBoard.options.size + DrawBoard.options.padding) );
		g.moveTo( 0, (DrawBoard.options.size + DrawBoard.options.padding) * 2 );
		g.lineTo( (DrawBoard.options.size + DrawBoard.options.padding) * 3, (DrawBoard.options.size + DrawBoard.options.padding) * 2 );

		g.endStroke();
		board.addChild(shape);

		// little containers for each piece
		var bitboard = 1;
		for (var y = 0; y < 3; y++) {
			for (var x = 0; x < 3; x++) {

				var s = new createjs.Shape();

				s.overColor = "#3281FF"
				s.outColor = "#FF0000"
				s.graphics.beginFill(s.outColor).drawRect(0, 0, DrawBoard.options.size, DrawBoard.options.size).endFill();
				s.x = (DrawBoard.options.size + DrawBoard.options.padding) * x;
				s.y = (DrawBoard.options.size + DrawBoard.options.padding) * y;
				s.width  = DrawBoard.options.size;
				s.height = DrawBoard.options.size;

				s.on("rollover", handleMouseOver );
				s.on("rollout",  handleMouseOut );
				s.on("mousedown",  handleMouseDown );

				board.addChild(s)

				s.bitboard = bitboard;
				s.hasPiece = false;
				bitboard <<= 1;
			}
		}

		function handleMouseDown(event) {
			var target = event.target;
			if (target.hasPiece) return;
			target.hasPiece = true;
				
			target.graphics.clear();
			g = target.graphics

			g.setStrokeStyle(2);
			g.beginStroke("#00f");

			g.moveTo( DrawBoard.options.padding, DrawBoard.options.padding );
			g.lineTo( DrawBoard.options.size-DrawBoard.options.padding, DrawBoard.options.size-DrawBoard.options.padding );
			g.moveTo( DrawBoard.options.size-DrawBoard.options.padding, DrawBoard.options.padding );
			g.lineTo( DrawBoard.options.padding, DrawBoard.options.size-DrawBoard.options.padding );

			g.endStroke();
		}

		function handleMouseOver(event) {
			var target = event.target;
			if (target.hasPiece) return;
			target.graphics.clear()
				.beginFill(target.overColor)
				.drawRect(0, 0, target.width, target.height)
				.endFill();
		}

		function handleMouseOut(event) {
			var target = event.target;
			if (target.hasPiece) return;
			target.graphics.clear();
		}
	}
}

class DrawNet {
	
	constructor (canvasId) {

		this.mouseTarget;	// the display object currently under the mouse, or being dragged
		this.dragStarted;	// indicates whether we are currently in a drag operation
		this.offset;
		this.update = true;

		// create stage and point it to the canvas:
		this.canvas = document.getElementById(canvasId);
		this.stage = new createjs.Stage(this.canvas);

		// enable touch interactions if supported on the current device:
		createjs.Touch.enable(this.stage);

		// enabled mouse over / out events
		this.stage.enableMouseOver(10);
		this.stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

		var self = this;
		function resizeEvent (event) {
			self.canvas.setAttribute('width', self.canvas.clientWidth);
			self.canvas.setAttribute('height', self.canvas.clientHeight);
			self.draw();
		};
		resizeEvent();
		window.onresize = resizeEvent;

		this.init();

		this.draw();

		var self = this;
		createjs.Ticker.addEventListener("tick", function(){
			self.draw();
			// self.stage.update();
		}, null, false, this);
	}

	static get options () {
		return {
			node: {
				radius: 20,
				padding: 50
			}
		}
	}

	setDNA( dna ) {
		this.net = new NeuralNet({inputs:18, outputs:9}, dna);
		this.init();
	}

	setNeuralNet( net ) {
		this.net = net;
		this.init();
	}

	draw ( ) {

	}

	init ( ) {

		if ( !(this.net) ) return;

		this.stage.removeAllChildren();

		this.weightsContainer = new createjs.Container();
		this.stage.addChild(this.weightsContainer);
		this.nodesContainer = new createjs.Container();
		this.stage.addChild(this.nodesContainer);

		var layerWidth = this.canvas.width / (this.net.layers.length + 1);
		var biggestLayer = 0;
		this.net.layers.forEach(a => biggestLayer = Math.max( biggestLayer, a.length ) );

		var weightsContainer = this.weightsContainer;
		var nodesContainer = this.nodesContainer;

		this.net.layers.forEach(function (layer, layerIdx, layers) {

			// for vertical centering
			var biggestLayerSize = biggestLayer * ( DrawNet.options.node.padding + (DrawNet.options.node.radius * 2)) / 2;
			var thisLayerSize = layer.length * ( DrawNet.options.node.padding + (DrawNet.options.node.radius * 2)) / 2;
			var layerPad = (biggestLayerSize - thisLayerSize)/2;

			layer.forEach( function (node, nodeIdx, nodes) {
				
				node.draw = {
					x: layerWidth + layerWidth * layerIdx,
					y: layerPad + DrawNet.options.node.padding + 
						DrawNet.options.node.radius +
						DrawNet.options.node.padding*nodeIdx
				}
				
				node.mouse = node.mouse || {
					hover: false,
					selected: false
				}

				// node container
				var nodeContainer = new createjs.Container();
				// nodeContainer.alpha = 0.5;
				nodesContainer.addChild( nodeContainer );

				var nodeWeightContainer = new createjs.Container();
				nodeWeightContainer.alpha = 0.01;
				weightsContainer.addChild( nodeWeightContainer );

				// node
				// var val =  node.value.toFixed(2);
				var val =  roundToTwo( node.value );

				var shapeColor = Math.round( 255 - val * 200 ).toString(16);
				var shape = new createjs.Shape();
				shape.graphics
					.setStrokeStyle(1)
					.beginStroke("#000")
					.beginFill("#"+shapeColor+shapeColor+shapeColor)
					.drawCircle(node.draw.x, node.draw.y, DrawNet.options.node.radius);
				nodeContainer.addChild(shape);
				node.draw.shape = shape;
				
				shape.containers = {
					node: nodeContainer,
					weights: nodeWeightContainer
				}

				// value
				var text = new createjs.Text(val, "11px Arial", val < 0.5 ? "#000" : "#fff");
				var b = text.getBounds();
				text.x = node.draw.x - b.width/2;
				text.y = node.draw.y + b.height/2;
				text.textBaseline = "alphabetic";
				nodeContainer.addChild(text);
				node.draw.text = text;

				// weights
				node.inputs.forEach(function(prev, prevIdx, previousNodes){

					// var w = Math.round( node.weights[prevIdx], 2 );
					// var w = node.weights[prevIdx].toFixed(2);
					var w = roundToTwo( node.weights[prevIdx] );

					var stokeWeight = 2 + ((w + 1) / 2) * 3;
					var stokeColor = Math.floor( 200 - ((w + 1) / 2) * 200 ).toString(16);

					var text = new createjs.Text(w, "12px Arial",  w < 0.2 ? "#000" : "#fff");
					var b = text.getBounds();

					var weightLine = new createjs.Shape();
					var g = weightLine.graphics;
					
					// draw line
					g.setStrokeStyle(stokeWeight, "round")
					g.beginStroke("#"+stokeColor+stokeColor+stokeColor);
					g.moveTo( node.draw.x, node.draw.y );
					g.lineTo( prev.draw.x + DrawNet.options.node.radius + b.width + 5, prev.draw.y );
					g.endStroke();
					nodeWeightContainer.addChild( weightLine );

					// draw text background
					var shape = new createjs.Shape();
					shape.graphics
						.beginFill("#"+stokeColor+stokeColor+stokeColor)
						.drawRoundRect(prev.draw.x, prev.draw.y-b.height, DrawNet.options.node.radius + b.width + 15, b.height*2, 2);
					nodeWeightContainer.addChild(shape);
					node.draw.shape = shape;

					// draw text
					text.x = prev.draw.x + DrawNet.options.node.radius + 5;
					text.y = prev.draw.y + b.height/2;
					text.textBaseline = "alphabetic";
					nodeWeightContainer.addChild(text);
				});

				// mouse events
				function handleMouseDown(event) {
					var target = event.target;
					node.mouse.selected = true;
					console.log( "handleMouseDown", event, node );
					event.target.alpha = (event.type == "mouseover") ? 1 : 0.5;

					this.stage.update();
				}

				function handleMouse(event) {
					var target = event.target;
					node.mouse.hover = false;
					event.target.containers.weights.alpha = (event.type == "rollover") ? 1 : 0.01;
					// event.target.containers.node.alpha = (event.type == "rollover") ? 1 : 0.5;

					this.stage.update();
				}

				shape.on("rollover", handleMouse );
				shape.on("rollout",  handleMouse );
				shape.on("mousedown",  handleMouseDown );

			});
		});

		this.stage.update();

	}
}



function roundToTwo(num) {    
	// return +(Math.round(num + "e+2")  + "e-2");
	return Math.round(num*100)/100
}
