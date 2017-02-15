var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 8000;
server.listen(port);
app.use(express.static(__dirname + '/'));
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});
var ice_list = new Map();
var socket_list = [];
io.on('connection', function (socket) {
    console.log(Date().toString().slice(15, 25), "有人连接", socket.id);
    socket_list.push(socket.id);
    ice_list[socket.id] = [];
    socket.emit("connectionOk");
    socket.on("call", function () {
        socket
            .broadcast
            .emit('call');
    });
    socket.on("answer", function () {
        socket
            .broadcast
            .emit('answer');
    });
    socket.on("desc", function (desc) {
        socket
            .broadcast
            .emit('desc', desc);
    });
    socket.on("candidate", function (candidate) {
        socket
            .broadcast
            .emit('candidate', candidate);
    });
    socket.on("disconnect", function () {
        ice_list.delete(socket.id);
        socket_list.splice(socket_list.indexOf(socket.id), 1);
        console.log(Date().toString().slice(15, 25), socket.id, "离线");
    });
});
