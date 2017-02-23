var express = require('express');
var fs = require('fs');
var app = express();
var https = require('https');
var privateKey = fs.readFileSync('./app/yourkey.pem', 'utf8');
var certificate = fs.readFileSync('./app/yourcert.pem', 'utf8');
var credentials = { key: privateKey, cert: certificate };
var httpsServer = https.createServer(credentials, app);
var SSLPORT = 81;
httpsServer.listen(SSLPORT, function () {
    console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});
// let server = require('http').createServer(app);
var io = require('socket.io').listen(httpsServer);
// let io = require('socket.io').listen(88);
// let port = process.env.PORT || 8000;
// server.listen(port);
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
        console.log("收到desc");
        socket
            .broadcast
            .emit('desc', desc);
    });
    socket.on("candidate", function (candidate) {
        console.log("收到candidate");
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
