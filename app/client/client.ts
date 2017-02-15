let localVideo = <HTMLInputElement>document.getElementById('localVideo');
let remoteVideo = <HTMLInputElement>document.getElementById('remoteVideo');
let localStream;
let socket = io.connect();
// let socket = io.connect('hk.airir.com:81');
let mycandidate = [];
let pc;
let isanswer = false;
let btn1 = <HTMLInputElement>document.getElementById('btn1');
let btn2 = <HTMLInputElement>document.getElementById('btn2');
let btn3 = <HTMLInputElement>document.getElementById('btn3');
let needtocallback = true;

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
    (<any>localVideo).srcObject = stream;
    localStream = stream;
    pc.addStream(stream);
    if (isanswer) {
        socket.emit('answer')
        console.log('you are answer');
    } else {
        iamcall('call');
    }
}
function gotRemoteStream(e) {
    console.log('绑定远端数据流');
    console.log(e.stream);
    (<any>remoteVideo).srcObject = e.stream;
}
function iamcall(key) {
    console.log(key);
    socket.emit(key);
}
function iamanswer() {
    socket.emit('answer')
    btn2.disabled = true;
}
function peerconnection() {
    pc = new RTCPeerConnection(iceServer);
    pc.onicecandidate = function (event) {
        if (event.candidate) {
            socket.emit('candidate', event.candidate)
        }
    }
    pc.onaddstream = gotRemoteStream;

    if (isanswer) {
        btn2.disabled = true;
    } else {
        btn1.disabled = true;
    }
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    })
        .then(gotStream)
}
socket.on("call", () => {
    console.log('收到call,等待同意');
    isanswer = true;
    btn2.disabled = false;
});
socket.on("answer", () => {
    btn2.disabled = true;
    console.log('对方同意 -- 建立offer');
    pc.createOffer().then(
        gotDescription,
        (err) => {
            console.log(err);
        }
    );
    function gotDescription(desc) {
        pc.setLocalDescription(desc).then(
            () => {
                console.log("desc local OK");
                socket.emit('desc', desc);
            },
            (err) => {
                console.log(err);
            }
        );
    }
});
socket.on('desc', desc => {
    console.log('收到desc', isanswer, desc);
    pc.setRemoteDescription(desc).then(
        () => {
            console.log("desc_remoteOK");
        },
        (err) => {
            console.log(err);
        }
    );
    if (isanswer) {
        pc.createAnswer().then(
            gotDescription,
            (err) => {
                console.log(err);
            }
        );
        function gotDescription(desc) {
            pc.setLocalDescription(desc).then(
                () => {
                    console.log("desc local OK");
                    socket.emit('desc', desc);
                },
                (err) => {
                    console.log(err);
                }
            );
        }
    }
})

socket.on('desc_a', desc => {
    console.log('收到desc', desc);
    pc.setRemoteDescription(desc).then(
        () => {
            console.log("desc_remoteOK");
        },
        (err) => {
            console.log(err);
        }
    );
})
socket.on('candidate', candidate => {
    pc.addIceCandidate(candidate).then(
        function () {
        },
        function (err) {
            console.log(err);
            console.log(candidate);

        }
    );;
})