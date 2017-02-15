let express = require('express');
var fs = require('fs');
let app = express();


var https = require('https');
var privateKey = fs.readFileSync('./app/yourkey.pem', 'utf8');
var certificate = fs.readFileSync('./app/yourcert.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};


var httpsServer = https.createServer(credentials, app);

var SSLPORT = 8000;

httpsServer.listen(SSLPORT, function() {
    console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});


// let server = require('http').createServer(app);
let io = require('socket.io').listen(httpsServer);
// let port = process.env.PORT || 8000;
// server.listen(port);
app.use(express.static(__dirname + '/'));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});
let ice_list = new Map();
let socket_list = [];
io.on('connection', function (socket) {
    console.log(Date().toString().slice(15, 25), "有人连接", socket.id);
    socket_list.push(socket.id);
    ice_list[socket.id] = [];

    socket.emit("connectionOk");

    socket.on("call", () => {
        socket
            .broadcast
            .emit('call');
    });    
    socket.on("answer", () => {
        socket
            .broadcast
            .emit('answer');
    });
    socket.on("desc", (desc) => {
        socket
            .broadcast
            .emit('desc',desc);
    });
    socket.on("candidate", (candidate) => {
        socket
            .broadcast
            .emit('candidate',candidate);
    });




    socket.on("disconnect", () => {
        ice_list.delete(socket.id);
        socket_list.splice(socket_list.indexOf(socket.id), 1);
        console.log(Date().toString().slice(15, 25), socket.id, "离线");
    });

});