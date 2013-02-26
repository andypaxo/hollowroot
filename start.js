var express = require('express'),
app = express(),
server = require('http').createServer(app),

io = require('socket.io').listen(server);
io.set('log level', 1);

app.use(express.static(__dirname + '/public'));

var players = {
	gremlin: {name:'gremlin', x:200, y:200, image:80}
};
var walk_speed = 32;
var time_step = .5;

io.sockets.on('connection', function (socket) {

	console.log(socket.id + ' connected');
	players[socket.id] = {x:20,y:20};
	socket.emit('allocate-id', {id:socket.id, now:now()});

	socket.on('identify', function (data) {
		players[socket.id].name = data.name;
		players[socket.id].image = data.image;
	});
  
	socket.on('chat-message', function (data) {
		console.log(socket.id + ' said: ' + data.text);
		socket.broadcast.emit('chat-message', {text:data.text,name:players[socket.id].name});
	});

	socket.on('move-player', function (data) {
		console.log(socket.id + ' moved to ' + data.x + ', ' + data.y);
		c_player = players[socket.id]
		c_player.destination = {
			x : data.x,
			y : data.y,
			eta : now() + distance(c_player.x, c_player.y, data.x, data.y) / walk_speed
		};
	});

	socket.on('disconnect', function () {
		console.log(socket.id + ' disconnected');
		delete players[socket.id];
	});

});

server.listen(80);

setInterval(tick, time_step * 1000);

function tick() {
	moveGremlin();
	movePlayers();

	io.sockets.emit('status', {players_online:players});
}

function moveGremlin() {
	var gremlin = players.gremlin;
	gremlin.x += Math.random() * 10 - 5;
	gremlin.x %= 400;
	if (gremlin.x < 0)
		gremlin.x += 400;

	gremlin.y += Math.random() * 10 - 5;
	gremlin.y %= 400;
	if (gremlin.y < 0)
		gremlin.y += 400;
}

function movePlayers() {
	for(var id in players)
		if (players[id].destination)
			moveTowardDestination(players[id]);
}

function moveTowardDestination(player) {
	var time = now();
	var destination = player.destination;
	if(destination.eta > time  + time_step) {
		var x_displacement = time_step * (destination.x - player.x) / (destination.eta - time);
		var y_displacement = time_step * (destination.y - player.y) / (destination.eta - time);
		player.x += x_displacement;
		player.y += y_displacement;
	} else {
		player.x = destination.x;
		player.y = destination.y;
	}
}

// Utility

function now() {
	// Server runs ahead of local client - testing only
	return new Date().getTime() /  1000;// + (1000 * 60 * 5);
}

function distance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}