
class Draw {

	constructor ( coach ) {
		this.coach = coach;
		this.network = new DrawNeuro ( coach.players[0] );
		this.board   = new DrawBoard ( new TTT() );

		this.init();
		// this.start();
	}

	setPlayer (player) {
		this.network = player;
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
	
	constructor (board) {
		this.board = board;
	}

	static get options () {
		return {
			size: 60,
			padding: 5
		}
	}

	draw ( container ) {

		// Draw board
		var shape = new createjs.Shape();
		var g = shape.graphics;

		g.setStrokeStyle(1);
		g.beginStroke("#000000");

		g.moveTo( (DrawBoard.options.size), 0 );
		g.lineTo( (DrawBoard.options.size), (DrawBoard.options.size) * 3 );
		g.moveTo( (DrawBoard.options.size) * 2, 0 );
		g.lineTo( (DrawBoard.options.size) * 2, (DrawBoard.options.size) * 3 );
		g.moveTo( 0, (DrawBoard.options.size) );
		g.lineTo( (DrawBoard.options.size) * 3, (DrawBoard.options.size) );
		g.moveTo( 0, (DrawBoard.options.size) * 2 );
		g.lineTo( (DrawBoard.options.size) * 3, (DrawBoard.options.size) * 2 );

		g.endStroke();
		container.addChild(shape);

		// little containers for each piece
		var bitboard = 1;
		for (var y = 0; y < 3; y++) {
			for (var x = 0; x < 3; x++) {

				var piece = new createjs.Container();
				piece.x = (DrawBoard.options.size) * x;
				piece.y = (DrawBoard.options.size) * y;
				piece.width = (DrawBoard.options.size);
				piece.height = (DrawBoard.options.size);
				container.addChild(piece);

				// X
				var s = new createjs.Shape();
				g = s.graphics;

				g.setStrokeStyle(2);
				g.beginStroke("#00f");

				g.moveTo( DrawBoard.options.padding, DrawBoard.options.padding );
				g.lineTo( DrawBoard.options.size-DrawBoard.options.padding, DrawBoard.options.size-DrawBoard.options.padding );
				g.moveTo( DrawBoard.options.size-DrawBoard.options.padding, DrawBoard.options.padding );
				g.lineTo( DrawBoard.options.padding, DrawBoard.options.size-DrawBoard.options.padding );

				g.endStroke();
				piece.addChild(s);

				// O
				s = new createjs.Shape();
				g = s.graphics;

				g.setStrokeStyle(2);
				g.beginStroke("#f00");
				g.drawCircle(DrawBoard.options.size/2, DrawBoard.options.size/2, DrawBoard.options.size/2-DrawBoard.options.padding);

				g.endStroke();
				piece.addChild(s);

				piece.on("mousedown", function (evt, data) {
					console.log("mousedown", data);
				}, null, false, {bitboard:bitboard});

				// piece.on("pressmove", function (evt) {
				// 	console.log("pressmove");
				// });

				// piece.on("rollover", function (evt) {
				// 	console.log("rollover");
				// });

				// piece.on("rollout", function (evt) {
				// 	console.log("rollout");
				// });

				bitboard <<= 1;
			}
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