//Node Server which will handle our socket io connections
const io = require('socket.io')(8000)

const users = {};

io.on('connection', socket =>{
	socket.on('new-user-joined',name =>{
		users[socket.id] = name;
		socket.broadcast.emit('user-joined',name);
	});

	socket.on('send', message=>{
		socket.broadcast.emit('receive', {message: message,name:users[socket.id]})
	});
	socket.on('disconnect', message=>{
		socket.broadcast.emit('left',users[socket.id]);
		delete users[socket.id];
	});
})

const http = require('http');

const port = 3000;

const server = http.createServer((req, res) => {
	var contentHeader, filePath, responseStatus, isRemoteFile;
	console.log(req.url);
	switch (req.url.split("/")[1]) {
		case "scripts":
			contentHeader = 'text/javascript';
			responseStatus = 200;
			break;
		case "styles":
			contentHeader = 'text/css';
			responseStatus = 200;
			break;
		case "images":
			contentHeader = 'image/png';
			responseStatus = 200;
			break;
		case "audio":
			contentHeader = 'audio/wav';
			responseStatus = 200;
			break;
		case "socket.io":
			contentHeader = 'text/javascript';
			filePath = 'http://localhost:8000/socket.io/socket.io.js';
			isRemoteFile = true;
			responseStatus = 200;
			break;
		case "":
			contentHeader = 'text/html';
			filePath = process.cwd() + '/index.html';
			responseStatus = 200;
			break;
		default:
			responseStatus = 400;
	}
	if(responseStatus == 200){
		res.setHeader('Content-Type', contentHeader);
		const fs = require('fs');
		if(isRemoteFile){
			const fileReq = http.request(filePath, (fileRes) => {
				fileRes.on('data', (content) => {
					console.log(content);
					res.write(content);
				});
			});
			
			fileReq.on('error', (e) => {
				res.write("Resource cannot be fetched");
			});
		}
		else{
			filePath = filePath?filePath:(process.cwd() + '/Client' + req.url);
			var content = fs.readFileSync(filePath);
			res.write(content);
		}
	}
	else{
		res.write("Resource not Found");
	}
	res.statusCode = responseStatus;
	res.end();
});
server.listen(port);
