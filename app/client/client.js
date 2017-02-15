var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');
var localStream;
var socket;
socket = io.connect();
// socket = io.connect('hk.airir.com:81');
var mycandidate = [];
var pc;
var isanswer = false;
var btn1 = document.getElementById('btn1');
var btn2 = document.getElementById('btn2');
var btn3 = document.getElementById('btn3');
var btn4 = document.getElementById('btn4');
var needtocallback = true;
var tmpdesc;
btn1.addEventListener('click', peerconnection);
btn2.addEventListener('click', peerconnection);
btn3.addEventListener('click', setlocal);
btn4.addEventListener('click', setRemote);
btn2.disabled = true;
btn1.disabled = false;
btn3.disabled = true;
btn4.disabled = true;
function con() {
    btn2.disabled = true;
    btn1.disabled = false;
}
socket.on('connectionOk', function () {
    console.log('connectionOk');
});
console.log("gothe1n");
var iceServer = {
    "iceServers": [
        // {
        //     // "url": "stun:stun.l.google.com:19302"
        //     "url": "stun:hk.airir.com"
        //     // "url": "stun:stunserver.org"
        // },
        {
            "url": "turn:hk.airir.com",
            "username": "123",
            "credential": "123"
        }
    ]
};
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
    // console.log('绑定远端数据流');
    // console.log(e.stream);
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
            console.log(event.candidate.candidate);
            if (event.candidate.candidate.indexOf('210.12.125.20') >= 1) {
                console.log("bingooooooooooooooooooooooo!");
            }
            ;
            socket.emit('candidate', event.candidate);
        }
        else {
            console.log("!!!!!!!!!!!!!!!!!!!!!!");
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
        btn3.disabled = false;
        tmpdesc = desc;
    }
});
function setlocal() {
    btn3.disabled = true;
    console.log('setlocal', tmpdesc);
    pc.setLocalDescription(tmpdesc).then(function () {
        socket.emit('desc', tmpdesc);
    }, function (err) {
        console.log(err);
    });
}
function setRemote() {
    btn4.disabled = true;
    console.log('setRemote', tmpdesc);
    pc.setRemoteDescription(tmpdesc).then(function () {
        if (isanswer) {
            pc.createAnswer().then(gotDescription, function (err) {
                console.log(err);
            });
            function gotDescription(desc) {
                btn3.disabled = false;
                tmpdesc = desc;
            }
        }
    }, function (err) {
        console.log(err);
    });
}
socket.on('desc', function (desc) {
    tmpdesc = desc;
    btn4.disabled = false;
    setRemote();
});
socket.on('candidate', function (candidate) {
    pc.addIceCandidate(candidate).then(function () {
        console.log('收到candidate', candidate);
    }, function (err) {
        console.log(err);
        console.log(candidate);
    });
    ;
});
