var net = require('net'),
		child = require('child_process'),
		Lines = require('./Lines').Lines;
var args = process.argv;
if (args.length < 4) {
	console.log("Usage: "+args[0]+" "+args[1]+" <socketpath> <daemon> <daemon args>");
	process.exit();
}
args.shift(); // 'node'
args.shift(); // 'anyconsole.js'
var socketpath = args.shift();
var daemonpath = args.shift();
var clients = [];
clients.send = function (data) {
	for (var i = 0, l = clients.length; i < l; ++i) {
		if (clients[i]) {
			clients[i].write(data);
		}
	}
};
var daemon = child.spawn(daemonpath, args);
var lines = new Lines(30);
function ondata(data) {
	var msg = lines.addData(data.toString());
	clients.send(msg);
	process.stdout.write(msg);
}
daemon.stdout.on('data', ondata);
daemon.stderr.on('data', ondata);
daemon.on('exit', function (code) {
	var msg = 'Process exited with code '+code;
	lines.freshLine();
	lines.addLine(msg);
	clients.send(msg);
});
var server = net.createServer(function (socket) {
	console.log("Client connected");
	var idx = clients.length;
	clients.push(socket);
	socket.write(lines.getData());
	socket.on('data', function (data) {
		daemon.stdin.write(data);
	});
	socket.on('close', function () {
		console.log("Client closed");
		clients[idx] = null;
	});
});
server.listen(socketpath);