
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
		this.board   = new DrawBoard ( new TicTacToe() );
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
	
	constructor ( canvasId ) {
		
		this.game = null;

		this.bitboard = [];

		this.mouseTarget;	// the display object currently under the mouse, or being dragged
		this.dragStarted;	// indicates whether we are currently in a drag operation
		this.offset;

		// create stage and point it to the canvas:
		this.canvas = document.getElementById( canvasId );
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

		this.setup();
		this.start();
	}

	start () {
		var self = this;
		createjs.Ticker.addEventListener("tick", function(){
			self.stage.update();
		}, null, false, this);
	}

	stop () {
		var self = this;
		createjs.Ticker.addEventListener("tick", function(){
			self.stage.update();
		}, null, false, this);
	}

	onClick( clickEvent ){
		this.clickEvent = clickEvent;
		return this;
	}

	static get options () {
		return {
			size: 60,
			padding: 10,
			stroke: 10,
			colour: {
				X: "#004659",
				O: "#C22935"
			}
		}
	}

	withGame( game ) {
		this.game = game;
		this.reset();
		return this;
	}

	update(){
		for( var x = 0; x < TicTacToe.MAX_MOVES; x++) {
			var bitPosition = 1 << x;
			this.bitboard[bitPosition].shapeX.alpha = this.game.board.players[0][0] & bitPosition;
			this.bitboard[bitPosition].shapeO.alpha = this.game.board.players[1][0] & bitPosition;
		}
	}

	reset ( ) {
		for( var x = 0; x < TicTacToe.MAX_MOVES; x++) {
			var bitPosition = 1 << x;
			this.bitboard[bitPosition].shapeX.alpha = 0;
			this.bitboard[bitPosition].shapeO.alpha = 0;
		}
	}

	setup ( ) {
		
		var board = new createjs.Container();
		board.width = DrawBoard.options.size * 3 + DrawBoard.options.padding * 2;
		board.height = DrawBoard.options.size * 3 + DrawBoard.options.padding * 2;
		board.x = (this.canvas.clientWidth/2) - (board.width/2);
		board.y = (this.canvas.clientHeight/2) - (board.height/2);;
		this.stage.addChild(board);

		// handle click events
		var game = this.game;
		var clickEvent = this.clickEvent;
		var self = this;
		function handleMouseDown(event) {
			var target = event.target;
			if (target.hasPiece) return;

			if(self.clickEvent) self.clickEvent( self.game, target.parent.bitboard );
		}

		function handleMouseOver(event) {
			var target = event.target;
			if (target.hasPiece) return;
			// target.graphics.clear()
			// 	.beginFill(target.overColor)
			// 	.drawRect(0, 0, target.width, target.height)
			// 	.endFill();
		}

		function handleMouseOut(event) {
			var target = event.target;
			if (target.hasPiece) return;
			// target.graphics.clear();
		}

		// little containers for each piece
		var bitboard = 1;
		for (var y = 0; y < 3; y++) {
			for (var x = 0; x < 3; x++) {

				var area = new createjs.Container();

				area.x = (DrawBoard.options.size + DrawBoard.options.padding) * x;
				area.y = (DrawBoard.options.size + DrawBoard.options.padding) * y;

				var s = new createjs.Shape();

				s.overColor = "#3281FF"
				s.outColor = "#FFF"
				s.graphics.beginFill(s.outColor).drawRect(0, 0, DrawBoard.options.size, DrawBoard.options.size).endFill();
				s.width  = DrawBoard.options.size;
				s.height = DrawBoard.options.size;

				area.addChild(s);

				area.on("rollover", handleMouseOver );
				area.on("rollout",  handleMouseOut );
				area.on("mousedown",  handleMouseDown );

				// draw X
				var shapeX = new createjs.Shape();
				area.addChild(shapeX);
				var g = shapeX.graphics
				g.setStrokeStyle( DrawBoard.options.stroke );
				g.beginStroke( DrawBoard.options.colour.X );
				g.moveTo( DrawBoard.options.padding, DrawBoard.options.padding );
				g.lineTo( DrawBoard.options.size, DrawBoard.options.size );
				g.moveTo( DrawBoard.options.size, DrawBoard.options.padding );
				g.lineTo( DrawBoard.options.padding, DrawBoard.options.size );
				g.endStroke();
				shapeX.alpha = 0.1;

				// draw O
				var shapeO = new createjs.Shape();
				area.addChild(shapeO);
				var g = shapeO.graphics
				g.setStrokeStyle( DrawBoard.options.stroke );
				g.beginStroke( DrawBoard.options.colour.O );
				g.drawCircle((DrawBoard.options.size+DrawBoard.options.padding)/2, (DrawBoard.options.size+DrawBoard.options.padding)/2, (DrawBoard.options.size-DrawBoard.options.padding)/2);
				g.endStroke();
				shapeO.alpha = 0.1;

				this.bitboard[bitboard] = {
					shapeX: shapeX,
					shapeO: shapeO
				}

				area.bitboard = bitboard;
				area.hasPiece = false;
				bitboard <<= 1;
				board.addChild(area);
			}
		}

		// Draw board
		var shape = new createjs.Shape();
		var g = shape.graphics;

		g.setStrokeStyle( DrawBoard.options.stroke );
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

		return this;
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

		// var self = this;
		// createjs.Ticker.addEventListener("tick", function(){
		// 	self.draw();
		// 	// self.stage.update();
		// }, null, false, this);

		return this;
	}

	static get options () {
		return {
			node: {
				radius: 20,
				padding: 10
			}
		}
	}

	setDNA( dna ) {
		this.net = new NeuralNet({inputs:18, outputs:9}, dna);
		this.init();
		return this;
	}

	setNeuralNet( net ) {
		this.net = net;
		this.init();
		return this;
	}

	draw ( ) {

	}

	init ( ) {

		if ( !(this.net) ) return this;

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
					y: layerPad + 
						(DrawNet.options.node.radius * 2 +
						DrawNet.options.node.padding) * (nodeIdx+1)
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
				// nodeWeightContainer.alpha = 0.01;
				weightsContainer.addChild( nodeWeightContainer );

				// node
				// var val =  node.value.toFixed(2);
				var val =  roundToTwo( node.value );
				var bias =  roundToTwo( node.bias );

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

				// bias
				var bias = new createjs.Text(bias, "8px Arial", "#000");
				var b = bias.getBounds();
				bias.x = node.draw.x - b.width/2;
				bias.y = node.draw.y - b.height/2 - DrawNet.options.node.radius + 2;
				bias.textBaseline = "alphabetic";
				nodeContainer.addChild(bias);
				node.draw.bias = bias;

				// weights
				node.inputs.forEach(function(prev, prevIdx, previousNodes){

					// var w = Math.round( node.weights[prevIdx], 2 );
					// var w = node.weights[prevIdx].toFixed(2);
					var w = roundToTwo( node.weights[prevIdx] * previousNodes[prevIdx].value );

					var strokeWeight = 2 + Math.abs(w * 3);
					// var strokeColor = Math.floor( 200 - ((w + 1) / 2) * 200 ).toString(16);
					var strokeColor = w < 0 ? '#E74C3C' : '#091E3A';
					var strokeAlpha = Math.abs(w);

					var text = new createjs.Text(w, "12px Arial", "#fff");
					var b = text.getBounds();

					var weightLine = new createjs.Shape();
					var g = weightLine.graphics;
					
					// draw line
					weightLine.alpha = strokeAlpha;
					g.setStrokeStyle(strokeWeight, "round")
					g.beginStroke( strokeColor );
					g.moveTo( node.draw.x, node.draw.y );
					g.lineTo( prev.draw.x + DrawNet.options.node.radius + b.width + 5, prev.draw.y );
					g.endStroke();
					nodeWeightContainer.addChild( weightLine );

					// draw text background
					var shape = new createjs.Shape();
					shape.graphics
						.beginFill( strokeColor )
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
					target.locked = !target.locked;
					console.log(target.locked);
					this.stage.update();
				}

				function handleMouse(event) {
					var target = event.target;

					if(target.locked) return;

					event.target.containers.weights.alpha = 
						(event.type === "rollover") ? 1 : 0.01;
					// event.target.containers.node.alpha = (event.type == "rollover") ? 1 : 0.5;

					this.stage.update();
				}

				shape.on("rollover", handleMouse );
				shape.on("rollout",  handleMouse );
				shape.on("mousedown",  handleMouseDown );

			});
		});

		this.stage.update();

		return this;
	}
}



function roundToTwo(num) {    
	// return +(Math.round(num + "e+2")  + "e-2");
	return Math.round(num*100)/100
}
