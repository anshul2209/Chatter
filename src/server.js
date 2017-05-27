import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ChatApp from './components/ChatApp';
import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import fs from 'fs';

let app = express();
let server = http.Server(app);
let io = new SocketIO(server);
let port = process.env.PORT || 3000;
let messages = JSON.parse(fs.readFileSync('./message.json', 'utf8'));
io.on('connection', function(socket){
	socket.on('join', function(username) {
	  socket.join(username);
  });
	let currentUser = {
	    id: socket.id
	};
  function filteredMessages(messageArray, from, to, flag){
    const filteredMessages = messages.filter((message)=>{
			return ((message.from == from && message.to == to) || (message.from == to && message.to == from));
		})
		socket.emit('sendAllMessages', {'messages': filteredMessages})
		if(!flag)
		io.sockets.in(to).emit('sendAllMessages', {'messages': filteredMessages});
    }
 	socket.on('getAllMessages', function(data){
 		let from = data.from;
		let to = data.to;
		filteredMessages(messages, from, to, 'getAllFlag');
 	})
	socket.on('client_message', function(data){
		let from = data.from;
		let to = data.to;
		messages.push(data);
		fs.writeFile( "message.json", JSON.stringify( messages ), "utf8", function(){
			filteredMessages(messages, from, to);
		});
	});
});

app.set('view engine', 'ejs');

// Serve static files from the 'public' folder
app.use(express.static('public'));

// GET /
app.get('/', function (req, res) {
  res.render('layout', {
    content: ReactDOMServer.renderToString(<ChatApp />)
  });
});


// Start server
server.listen(port, () => {
    console.log('[INFO] Listening on *:' + port);
});
