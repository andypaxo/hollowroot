$(function () {
	var socket = io.connect(document.location.origin);
	var my_identifier = '';
	var me = {
		name:makeName(),
		image:Math.floor(Math.random() * 64)
	};
	var canvas = $('#play-canvas')[0].getContext('2d');
	canvas.mozImageSmoothing = false;
	canvas.webkitImageSmoothingEnabled = false;
	canvas.imageSmoothing = false;
	var world = new World();

	var player_images = new Image();
	player_images.src="/lofi_char.png";

	$('#your-name').val(me.name);

	$('#chatbox').submit(function(e) {
		e.preventDefault();
		var chatbox_input = $('#chatbox-input');
		var message_text = chatbox_input.val();
		if (message_text.length > 0) {
			socket.emit('chat-message', {text:message_text});
			logChat(me.name, message_text);
		}
		chatbox_input.val('');
	});

	$('#play-canvas').click(function(e) {   //Offset mouse Position
		var posX = $(this).offset().left, posY = $(this).offset().top;
		var x = e.pageX - posX, y = e.pageY - posY;
		socket.emit('move-player', {x:x,y:y});
	});

	socket.on('connect', function() {
		socket.emit('identify', me);
	});

	socket.on('allocate-id', function(data) {
		my_identifier = data.id;
		// Not currently accounting for latency
		world.time_offset = data.now - world.now();
		console.log('Time offset = ' + world.time_offset);
	});

	socket.on('chat-message', function(data) {
		logChat(data.name, data.text);
	});

	socket.on('status', function(data) {
		world.players = data.players_online;
		var num_players = world.
			flattenArray(world.players).
			filter(function(player) {return player.type == 'human';})
			.length;
		$('#status-users').text(num_players);
	});

	function updatePlayers(players) {
		for (var player_id in players) {
			var server_player = players[player_id];
			var local_player = world.players[player_id];
			local_player.destination = server_player.destination;
			if (world.distance(server_player, local_player) > 24) {
				local_player.x = server_player.x;
				local_player.y = server_player.y;
			}
		}
	}

	function logChat(name, message_text) {
		$('<p/>').text(name + ' : ' + message_text).appendTo('#chat-messages');
	}

	function makeName() {
		var names = ['Tik', 'Bok', 'Toc', 'Pon', 'Kip', 'Bin', 'Fon', 'Doc', 'Gup', 'Hin'];
		return pickRandomFrom(names) + '-' + pickRandomFrom(names);
	}

	// Drawing

	var drawFrame = function() {
		world.movePlayers();

		canvas.fillStyle = '#221100';
		canvas.fillRect(0, 0, 400, 400);
		
		canvas.fillStyle = '#22ff22';
		var strip_width = player_images.width / 8;
		for (player_id in world.players) {
			var player = world.players[player_id];
			canvas.fillText(player.name, player.x, player.y);
			canvas.drawImage(player_images,
				8 * (player.image % strip_width), 8 * Math.floor(player.image / strip_width), 8, 8,
				player.x, player.y, 16, 16);
		};

		if (window.requestAnimationFrame)
			window.requestAnimationFrame(drawFrame);
	};

	if (window.requestAnimationFrame)
		window.requestAnimationFrame(drawFrame);
	else
		window.setInterval(drawFrame, 50);

	// Utility

	function pickRandomFrom(array) {
		return array[Math.floor(Math.random() * array.length)];
	}
});