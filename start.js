var express = require('express'),
app = express(),
server = require('http').createServer(app),

io = require('socket.io').listen(server);
io.set('log level', 1);

app.use(express.static(__dirname + '/public'));

var players = {
	gremlin: {x:200, y:200}
};

io.sockets.on('connection', function (socket) {

	console.log(socket.id + ' connected');
	players[socket.id] = {x:20,y:20};
	socket.emit('allocate-id', {id:socket.id});
  
	socket.on('chat-message', function (data) {
		console.log(socket.id + ' said: ' + data.text);
		socket.broadcast.emit('chat-message', {text:data.text,name:socket.id});
	});

	socket.on('move-player', function (data) {
		console.log(socket.id + ' moved to ' + data.x + ', ' + data.y);
		players[socket.id].x = data.x;
		players[socket.id].y = data.y;
	});

	socket.on('disconnect', function () {
		console.log(socket.id + ' disconnected');
		delete players[socket.id];
	});

});

server.listen(80);

setInterval(tick, 500);

function tick()
{
	var gremlin = players.gremlin;
	gremlin.x += Math.random() * 10 - 5;
	gremlin.x %= 400;
	if (gremlin.x < 0)
		gremlin.x += 400;

	gremlin.y += Math.random() * 10 - 5;
	gremlin.y %= 400;
	if (gremlin.y < 0)
		gremlin.y += 400;

	io.sockets.emit('status', {players_online:players});
}