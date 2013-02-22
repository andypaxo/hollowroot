$(function () {
	var socket = io.connect(document.location.origin);
	var my_identifier = '';
	var my_name = make_name();
	var canvas = $('#play-canvas')[0].getContext('2d');
	var players = {};

	$('#your-name').val(my_name);

	$('#chatbox').submit(function(e) {
		e.preventDefault();
		var chatbox_input = $('#chatbox-input');
		var message_text = chatbox_input.val();
		if (message_text.length > 0) {
			socket.emit('chat-message', {text:message_text});
			log_chat(my_identifier, message_text);
		}
		chatbox_input.val('');
	});

	$('#play-canvas').click(function(e) {   //Offset mouse Position
		var posX = $(this).offset().left, posY = $(this).offset().top;
		var x = e.pageX - posX, y = e.pageY - posY;
		socket.emit('move-player', {x:x,y:y});
		players[my_identifier].x = x;
		players[my_identifier].y = y;
	});

	socket.on('connect', function() {
		socket.emit('identify', {name:my_name});
	});

	socket.on('allocate-id', function(data) {
		my_identifier = data.id;
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

	function pick_random_from(array) {
		return array[Math.floor(Math.random() * array.length)];
	}

	var drawFrame = function() {
		canvas.fillStyle = '#ddeeff';
		canvas.fillRect(0, 0, 400, 400);
		
		canvas.fillStyle = '#111111';
		for (player_id in players) {
			var player = players[player_id];
			canvas.fillText(player.name, player.x, player.y);
		};

	};

	window.setInterval(drawFrame, 50);
});