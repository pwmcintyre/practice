
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
	
	constructor ( game ) {
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

class DrawNeuro {
	
	constructor (player) {
		this.player = player;
	}

	static get options () {
		return {
			node: {
				radius: 20,
				padding: 50
			}
		}
	}

	draw ( container ) {

		if ( !(this.player && this.player.network) ) return

		var layerWidth = container.width / (this.player.network.layers.length + 1);
		var biggestLayer = 0;
		this.player.network.layers.forEach(a => biggestLayer = Math.max( biggestLayer, a.length ) );

		this.player.network.layers.forEach(function (layer, layerIdx, layers) {

			// for vertical centering
			var biggestLayerSize = biggestLayer * ( DrawNeuro.options.node.padding + (DrawNeuro.options.node.radius * 2)) / 2;
			var thisLayerSize = layer.length * ( DrawNeuro.options.node.padding + (DrawNeuro.options.node.radius * 2)) / 2;
			var layerPad = (biggestLayerSize - thisLayerSize)/2;

			layer.forEach( function (node, nodeIdx, nodes) {
				
				var x = layerWidth + layerWidth * layerIdx;
				var y = layerPad + DrawNeuro.options.node.padding + 
					DrawNeuro.options.node.radius +
					DrawNeuro.options.node.padding*nodeIdx;

				var shape = new createjs.Shape();
				shape.graphics
					.setStrokeStyle(1)
					.beginStroke("#000")
					.beginFill("#fff")
					.drawCircle(x, y, DrawNeuro.options.node.radius);
				container.addChild(shape);

				var text = new createjs.Text(node.value, "10px Arial", "#000");
				text.x = x;
				text.y = y;
				text.textBaseline = "alphabetic";
				container.addChild(text);


			});
		});

	}
}