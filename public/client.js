$(function () {
	var socket = io.connect('http://localhost');
	var my_name = '';

	$('#chatbox').submit(function(e) {
		e.preventDefault();
		var chatbox_input = $('#chatbox-input');
		var message_text = chatbox_input.val();
		if (message_text.length > 0) {
			socket.emit('chat-message', {text:message_text});
			log_chat(my_name, message_text);
		}
		chatbox_input.val('');
	})

	socket.on('allocate-id', function(data) {
		my_name = data.id;
	});
	socket.on('chat-message', function(data) {
		log_chat(data.name, data.text);
	});

	socket.on('status', function(data) {
		$('#status-users').text(Object.keys(data.players_online).length);
	});

	function log_chat(name, message_text) {
		$('<p/>').text(name + ' : ' + message_text).appendTo('#chat-messages');
	};
});