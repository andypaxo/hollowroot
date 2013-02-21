$(function () {
	var socket = io.connect(document.location.origin);
	var my_name = '';
	var canvas = $('#play-canvas')[0].getContext('2d');
	var players = {};

	$('#chatbox').submit(function(e) {
		e.preventDefault();
		var chatbox_input = $('#chatbox-input');
		var message_text = chatbox_input.val();
		if (message_text.length > 0) {
			socket.emit('chat-message', {text:message_text});
			log_chat(my_name, message_text);
		}
		chatbox_input.val('');
	});

	$('#play-canvas').click(function(e) {   //Offset mouse Position
		var posX = $(this).offset().left, posY = $(this).offset().top;
		var x = e.pageX - posX, y = e.pageY - posY;
		socket.emit('move-player', {x:x,y:y});
		players[my_name].x = x;
		players[my_name].y = y;
	});

	socket.on('allocate-id', function(data) {
		my_name = data.id;
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
	};

	var drawFrame = function() {
		canvas.fillStyle = '#ddeeff';
		canvas.fillRect(0, 0, 400, 400);
		
		canvas.fillStyle = '#111111';
		for (player_name in players) {
			var player = players[player_name];
			canvas.fillText(player_name, player.x, player.y);
		};

		if (window.requestAnimationFrame)
			window.requestAnimationFrame(drawFrame);
	};

	drawFrame();
	if (!window.requestAnimationFrame)
		window.setInterval(drawFrame, 100);
});