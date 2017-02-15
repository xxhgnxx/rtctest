var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');
var localStream;
var socket = io.connect();
// let socket = io.connect('hk.airir.com:81');
var mycandidate = [];
var pc;
var isanswer = false;
var btn1 = document.getElementById('btn1');
var btn2 = document.getElementById('btn2');
var btn3 = document.getElementById('btn3');
var needtocallback = true;
btn1.addEventListener('click', peerconnection);
btn2.addEventListener('click', peerconnection);
btn2.disabled = true;
btn1.disabled = false;
socket.on('connectionOk', function () {
    console.log('connectionOk');
});
console.log("gothe1n");
var iceServer = [
    {
        "url": "stun:stun.l.google.com:19302"
    }
];
function gotStream(stream) {
    localVideo.srcObject = stream;
    localStream = stream;
    pc.addStream(stream);
    if (isanswer) {
        socket.emit('answer');
        console.log('you are answer');
    }
    else {
        iamcall('call');
    }
}
function gotRemoteStream(e) {
    console.log('绑定远端数据流');
    console.log(e.stream);
    remoteVideo.srcObject = e.stream;
}
function iamcall(key) {
    console.log(key);
    socket.emit(key);
}
function iamanswer() {
    socket.emit('answer');
    btn2.disabled = true;
}
function peerconnection() {
    pc = new RTCPeerConnection(iceServer);
    pc.onicecandidate = function (event) {
        if (event.candidate) {
            socket.emit('candidate', event.candidate);
        }
    };
    pc.onaddstream = gotRemoteStream;
    if (isanswer) {
        btn2.disabled = true;
    }
    else {
        btn1.disabled = true;
    }
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    })
        .then(gotStream);
}
socket.on("call", function () {
    console.log('收到call,等待同意');
    isanswer = true;
    btn2.disabled = false;
});
socket.on("answer", function () {
    btn2.disabled = true;
    console.log('对方同意 -- 建立offer');
    pc.createOffer().then(gotDescription, function (err) {
        console.log(err);
    });
    function gotDescription(desc) {
        pc.setLocalDescription(desc).then(function () {
            console.log("desc local OK");
            socket.emit('desc', desc);
        }, function (err) {
            console.log(err);
        });
    }
});
socket.on('desc', function (desc) {
    console.log('收到desc', isanswer, desc);
    pc.setRemoteDescription(desc).then(function () {
        console.log("desc_remoteOK");
    }, function (err) {
        console.log(err);
    });
    if (isanswer) {
        pc.createAnswer().then(gotDescription, function (err) {
            console.log(err);
        });
        function gotDescription(desc) {
            pc.setLocalDescription(desc).then(function () {
                console.log("desc local OK");
                socket.emit('desc', desc);
            }, function (err) {
                console.log(err);
            });
        }
    }
});
socket.on('desc_a', function (desc) {
    console.log('收到desc', desc);
    pc.setRemoteDescription(desc).then(function () {
        console.log("desc_remoteOK");
    }, function (err) {
        console.log(err);
    });
});
socket.on('candidate', function (candidate) {
    pc.addIceCandidate(candidate).then(function () {
    }, function (err) {
        console.log(err);
        console.log(candidate);
    });
    ;
});
