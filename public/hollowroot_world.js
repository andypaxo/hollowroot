if (typeof exports !== 'undefined')
	exports.World = World;

function World()
{
	this.players = {};
	this.last_integration = this.now();
	this.time_offset = 0;
}

World.prototype.movePlayers = function() {
	for(var id in this.players)
		if (this.players[id].destination)
			this.moveTowardDestination(this.players[id]);
	this.last_integration = this.now();
}

World.prototype.moveTowardDestination = function(player) {
	var time = this.now();
	var destination = player.destination;
	var time_step = time - this.last_integration;
	if(destination.eta > time  + time_step) {
		var x_displacement = time_step * (destination.x - player.x) / (destination.eta - time);
		var y_displacement = time_step * (destination.y - player.y) / (destination.eta - time);
		player.x += x_displacement;
		player.y += y_displacement;
	} else {
		player.x = destination.x;
		player.y = destination.y;
	}
};

// Utility

World.prototype.now = function() {
	return new Date().getTime() /  1000 + this.time_offset;
}

World.prototype.distance = function(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}