var world = new (require('./public/hollowroot_world.js').World)();
world.players.gremlin = {name:'gremlin', x:200, y:200, image:80};

var express = require('express'),
app = express(),
server = require('http').createServer(app),

io = require('socket.io').listen(server);
io.set('log level', 1);

app.use(express.static(__dirname + '/public'));

var walk_speed = 92;
var time_step = .4;

io.sockets.on('connection', function (socket) {

	console.log(socket.id + ' connected');
	world.players[socket.id] = {x:20,y:20};
	socket.emit('allocate-id', {id:socket.id, now:world.now()});

	socket.on('identify', function (data) {
		world.players[socket.id].name = data.name;
		world.players[socket.id].image = data.image;
	});
  
	socket.on('chat-message', function (data) {
		console.log(socket.id + ' said: ' + data.text);
		socket.broadcast.emit('chat-message', {text:data.text,name:world.players[socket.id].name});
	});

	socket.on('move-player', function (data) {
		console.log(socket.id + ' moved to ' + data.x + ', ' + data.y);
		c_player = world.players[socket.id]
		c_player.destination = {
			x : data.x,
			y : data.y,
			eta : world.now() + world.distance(c_player, data) / walk_speed
		};
	});

	socket.on('disconnect', function () {
		console.log(socket.id + ' disconnected');
		delete world.players[socket.id];
	});

});

server.listen(80);

setInterval(tick, time_step * 1000);

function tick() {
	moveGremlin();
	world.movePlayers();

	io.sockets.emit('status', {players_online:world.players});
}

function moveGremlin() {
	var gremlin = world.players.gremlin;
	gremlin.x += Math.random() * 10 - 5;
	gremlin.x %= 400;
	if (gremlin.x < 0)
		gremlin.x += 400;

	gremlin.y += Math.random() * 10 - 5;
	gremlin.y %= 400;
	if (gremlin.y < 0)
		gremlin.y += 400;
}