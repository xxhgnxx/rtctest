let localVideo = <HTMLInputElement>document.getElementById('localVideo');
let remoteVideo = <HTMLInputElement>document.getElementById('remoteVideo');
let localStream;
let socket;
socket = io.connect('127.0.0.1:81');
// socket = io.connect('hk.airir.com:81');
let mycandidate = [];
let pc;
let isanswer = false;

let btn1 = <HTMLInputElement>document.getElementById('btn1');
let btn2 = <HTMLInputElement>document.getElementById('btn2');
let btn3 = <HTMLInputElement>document.getElementById('btn3');
let btn4 = <HTMLInputElement>document.getElementById('btn4');
let needtocallback = true;

let tmpdesc;

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

let iceServer = {
    "iceServers": [
        {
            // "url": "stun:stun.l.google.com:19302"
            "url": "stun:hk.airir.com"
            // "url": "stun:stunserver.org"
        },
        {

            "url": "turn:hk.airir.com",
            "username": "123",
            "credential": "123"
        }

    ]
};



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
    // console.log('绑定远端数据流');
    // console.log(e.stream);
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
            console.log(event.candidate.candidate);            
            if (event.candidate.candidate.indexOf('210.12.125.20') >= 1) {
                console.log("bingooooooooooooooooooooooo!");
            };
            socket.emit('candidate', event.candidate)
        } else {
            console.log("!!!!!!!!!!!!!!!!!!!!!!");

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
        .then(gotStream);
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
        btn3.disabled = false;
        tmpdesc = desc;
    }
});


function setlocal() {
    btn3.disabled = true;
    console.log('setlocal', tmpdesc);
    pc.setLocalDescription(tmpdesc).then(
        () => {
            socket.emit('desc', tmpdesc);
        },
        (err) => {
            console.log(err);
        }
    );
}

function setRemote() {
    btn4.disabled = true;
    console.log('setRemote', tmpdesc);
    pc.setRemoteDescription(tmpdesc).then(
        () => {
            if (isanswer) {
                pc.createAnswer().then(
                    gotDescription,
                    (err) => {
                        console.log(err);
                    }
                );
                function gotDescription(desc) {
                    btn3.disabled = false;
                    tmpdesc = desc;
                }
            }
        },
        (err) => {
            console.log(err);
        }
    );
}



socket.on('desc', desc => {
    tmpdesc = desc;
    btn4.disabled = false;

    setRemote();

});


socket.on('candidate', candidate => {
    pc.addIceCandidate(candidate).then(
        function () {
            console.log('收到candidate',candidate);
        },
        function (err) {
            console.log(err);
            console.log(candidate);

        }
    );;
})