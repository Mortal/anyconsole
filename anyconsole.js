var net = require('net'),
    child = require('child_process'),
    Lines = require('./Lines').Lines;
function usage() {
  console.log("Usage: "+args[0]+" "+args[1]+" [-r] <socketpath> <daemon> <daemon args>");
  process.exit();
}
var args = process.argv;
var flags = {
  r: false // autorestart
};
while (args.length > 2) {
  var o = args[2].match(/^-(.)/);
  if (!o) break;
  if (o[1] in flags) {
    flags[o[1]] = !flags[o[1]];
  } else if (o[1] != '-') {
    usage();
  }
  args.shift();
}
if (args.length < 4) {
  usage();
}
args.shift(); // 'node'
args.shift(); // 'anyconsole.js'
var socketpath = args.shift();
var daemonpath = args.shift();
var clients = [];
clients.send = function (data, func) {
  func = func || net.Socket.prototype.write;
  for (var i = 0, l = clients.length; i < l; ++i) {
    if (clients[i]) {
      func.call(clients[i], data);
    }
  }
};
var daemon;
var lines = new Lines(30);

function ondata(data) {
  var msg = lines.addData(data.toString());
  clients.send(msg);
  process.stdout.write(msg);
}

function spawndaemon() {
  daemon = child.spawn(daemonpath, args);
  daemon.stdout.on('data', ondata);
  daemon.stderr.on('data', ondata);
  daemon.on('exit', function (code) {

    var msg = 'Process exited with code '+code;
    lines.freshLine();
    lines.addLine(msg);
    msg += '\n';
    clients.send(msg);
    process.stdout.write(msg);

    if (flags.r) {
      // restart
      setTimeout(spawndaemon, 500);
    } else {
      // don't restart
      clients.send(msg, net.Socket.prototype.end);
      process.nextTick(function () {
	process.exit(code);
      });
    }
  });
}
spawndaemon();
var server = net.createServer(function (socket) {
  console.log("anyconsole: Client connected");
  var idx = clients.length;
  clients.push(socket);
  socket.write(lines.getData());
  socket.on('data', function (data) {
    try {
      daemon.stdin.write(data);
    } catch (e) {
      console.log("anyconsole: "+e);
    }
  });
  socket.on('close', function () {
    console.log("anyconsole: Client closed");
    clients[idx] = null;
  });
});
server.listen(socketpath);
process.on('uncaughtException', function (e) {
  console.log("anyconsole: Caught exception: "+e);
});
/* vim:set sw=2 sts=2 ts=8 noet: */
