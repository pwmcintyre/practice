
class Draw {

	constructor ( coach ) {
		this.coach = coach;
		this.currentPlayer = coach.players[0];

		this.init();
		// this.start();
	}

	setPlayer (player) {
		this.currentPlayer = player;
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
		
		var net = this.currentPlayer.network;
		if ( !net ) return;

		this.stage.removeAllChildren();

		var layers = net.layers.length;
		var layerWidth = this.canvas.width / (layers + 1);

		var self = this;
		net.layers.forEach(function (layer, layerIdx, layers) {
			layer.forEach( function (node, nodeIdx, nodes) {
				
				var x = layerWidth+layerWidth*layerIdx;
				var y = 50+self.radius+50*nodeIdx;

				var shape = new createjs.Shape();
				shape.graphics
					.setStrokeStyle(1)
					.beginStroke("#000")
					.beginFill("#fff")
					.drawCircle(x, y, self.radius);
				self.stage.addChild(shape);

				var text = new createjs.Text(node.value, "10px Arial", "#000");
				text.x = x;
				text.y = y;
				text.textBaseline = "alphabetic";
				self.stage.addChild(text);
				
			});
		});

		this.draw();
	}

	draw () {
		this.stage.update();
	}


	tick(event, data) {
		// this set makes it so the stage only re-renders when an event handler indicates a change has happened.
		if (data.self.update) {
			data.self.update = false; // only update once
			data.self.stage.update(event);
		}
	}

}

class DrawNeuro {
	constructor (player) {
		this.player = player;
	}
}