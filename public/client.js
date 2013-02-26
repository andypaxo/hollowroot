$(function () {
	var socket = io.connect(document.location.origin);
	var my_identifier = '';
	var me = {
		name:make_name(),
		image:Math.floor(Math.random() * 64)
	};
	var canvas = $('#play-canvas')[0].getContext('2d');
	canvas.mozImageSmoothing = false;
	canvas.webkitImageSmoothingEnabled = false;
	canvas.imageSmoothing = false;
	var time_offset = 0;
	var players = {};
	var time_step = 1;

	var player_images = new Image();
	player_images.src="/lofi_char.png";

	$('#your-name').val(me.name);

	$('#chatbox').submit(function(e) {
		e.preventDefault();
		var chatbox_input = $('#chatbox-input');
		var message_text = chatbox_input.val();
		if (message_text.length > 0) {
			socket.emit('chat-message', {text:message_text});
			log_chat(me.name, message_text);
		}
		chatbox_input.val('');
	});

	$('#play-canvas').click(function(e) {   //Offset mouse Position
		var posX = $(this).offset().left, posY = $(this).offset().top;
		var x = e.pageX - posX, y = e.pageY - posY;
		socket.emit('move-player', {x:x,y:y});
		//players[my_identifier].x = x;
		//players[my_identifier].y = y;
	});

	socket.on('connect', function() {
		socket.emit('identify', me);
	});

	socket.on('allocate-id', function(data) {
		my_identifier = data.id;
		// Not currently accounting for latency
		time_offset = data.now - now();
		console.log('Time offset = ' + time_offset);
	});

	socket.on('chat-message', function(data) {
		log_chat(data.name, data.text);
	});

	socket.on('status', function(data) {
		players = data.players_online;
		$('#status-users').text(Object.keys(players).length);
	});

	function log_chat(name, message_text) {
		$('<p/>').text(name + ' : ' + message_text).appendTo('#chat-messages');
	}

	function make_name() {
		var names = ['Tik', 'Bok', 'Toc', 'Pon', 'Kip', 'Bin', 'Fon'];
		return pick_random_from(names) + '-' + pick_random_from(names);
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

	// Drawing

	var drawFrame = function() {
		time_step = now() - last_time;
		last_time = now();

		movePlayers();

		canvas.fillStyle = '#221100';
		canvas.fillRect(0, 0, 400, 400);
		
		canvas.fillStyle = '#22ff22';
		var strip_width = player_images.width / 8;
		for (player_id in players) {
			var player = players[player_id];
			canvas.fillText(player.name, player.x, player.y);
			canvas.drawImage(player_images,
				8 * (player.image % strip_width), 8 * Math.floor(player.image / strip_width), 8, 8,
				player.x, player.y, 16, 16);
		};

		if (window.requestAnimationFrame)
			window.requestAnimationFrame(drawFrame);
	};

	var last_time = now();
	if (window.requestAnimationFrame)
		window.requestAnimationFrame(drawFrame);
	else
		window.setInterval(drawFrame, 50);


	function movePlayers() {
		for(var id in players)
			if (players[id].destination)
				moveTowardDestination(players[id]);
	}

	function moveTowardDestination(player) {
		var time = now() + time_offset;
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
		return new Date().getTime() / 1000;
	}

	function pick_random_from(array) {
		return array[Math.floor(Math.random() * array.length)];
	}
});