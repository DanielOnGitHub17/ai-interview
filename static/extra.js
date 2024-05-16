// methods for Interview involving setting up
let Intv = Interview.prototype;

Intv.configure = function () {
    // general
    // choose the container video/text
    this.container = Interview.containers[+this.useVideo];
    // add controls to it
    add(CONTROLS, this.container);
    // create a switch to toggle the control's layout
    this.layoutButton = new     Switch(CONTROLS, CONTROLS, "layout", [1, 0]);
    // display the container only
    switchScreen(this.container.id);
    // end general

    // video specific
    this.questionBox = this.useVideo ? CC : QUESTIONBOX;
    if (this.useVideo) {
        (this.transcriber = new (
            window.SpeechRecognition || window.webkitSpeechRecognition
        )())
            .continuous = this.transcribe = true;
    } else {
        PLAYORPAUSE.remove();
        SAY.replaceWith(SAY.children[0]);
        (SAY = CONTROLS.children[0]).textContent = "ASK DIFFERENTLY";
    }
};


Intv.event = function () {
    CONTROLS.onclick = (event) => {
        event.stopImmediatePropagation();
        event.stopPropagation();
        let target = event.target;
        switch (event.target.id) {
            case "PREV":
                this.previous();
                break;

            case "NEXT":
                this.next();
                break;

            case "PLAYORPAUSE":
                this[target.textContent.toLowerCase()]();
                target.textContent = target.textContent == "PAUSE" ? "RESUME" : "PAUSE";
                break;

            default:
                break;
        }
    }
    SAY.onclick = (event) => {
        event.stopPropagation();  // necessary?
        let target = event.target;
        if (target.nodeName != "BUTTON") return;
        this.ask(
            this.index
            , (target.value || target.textContent)
                .toUpperCase() == "REPEAT" ?
                this.holdQuestion : this.anotherQuestion
        );
    };
    SAY.onchange = (event)=>{
        event.stopPropagation();
        let target = event.target;
        if (target.nodeName != "SELECT") return;
        target.previousElementSibling.textContent = target.value;
    };
    if (this.useVideo) {
        TALK.onstart = TALK.onresume = VIDEO.onpause = () => {
            this.disenable();
        }
        TALK.onerror = console.log;
        // no TALK.onend, use say().then -> whatever you want to do THEN.

        // the real '.start' for video usage
        VIDEO.onloadstart = () => {
            hideLoading();
            this.disenable();
            VIDEO.play();
            let hours = new Date().getHours(), time;
            if (hours > 17) {
                time = "evening";
            } else {
                time = hours > 11 ? "afternoon" : "morning";
            }
            say(`Good ${time}. ${INTERVIEW.TEXT_BEFORE}`).then(() => {
                this.ask(0);
                this.transcriber.start();
            })
        }
        // transcriber CC.
        this.transcriber.onresult = (event) => {
            if (!this.transcribe) return;
            let text = event.results[event.resultIndex][0].transcript + ' ';
            CC.textContent = text;
            this.answers[this.index] += text;
            // scroll to see how big text has become
            CC.scrollTop = CC.scrollHeight;
        }
        this.transcriber.onend = () => {
            if (this.transcribe) this.transcriber.start();
        }
        return;
    }
    ANSWERBOX.oninput = () => {
        this.answers[this.index] = ANSWERBOX.value;
    }
};

Intv.start = function () {
    if (this.useVideo) {
        showLoading("setting up...");
        say("setting things up, the interview will start soon").then(resp => {
            if (!navigator.mediaDevices) {
                return this.exit("Sorry, your browser cannot record video.");
            }
            // options for recording...
            navigator.mediaDevices.getUserMedia({
                audio: true, video: true, facingMode: { exact: "user" }
            }).then(mediaStream => {
                if (isPhone()){
                    // ha! (back to old implementation of spe)
                    return this.video(mediaStream);
                } 
                navigator.mediaDevices.getDisplayMedia({
                    audio: true, video: { displaySurface: "monitor" }
                }).then(screenStream => {
                    // check if user followed instructions.
                    let track = screenStream.getAudioTracks()[0];
                    if (!track || track.label != "System Audio") {
                        throw "Did not follow instructions";
                    }
                    this.video(mediaStream, screenStream);
                }).catch(error => {
                    console.log(error);
                    this.exit("You <i><b>must </b></i> share <b>entire</b> screen and system audio.");
                })
            }).catch((error) => {
                console.log(error);
                this.exit("You should allow all permissions!");
            })
        })
        return;
    }
    this.ask(0);
};

Intv.video = function (mediaStream, screenStream) {
    if (screenStream) {
        this.mdStm = mediaStream;
        this.videoTrack = mediaStream.getVideoTracks()[0];
        // stop screen's videoTrack
        let screenVideo = screenStream.getVideoTracks()[0];
        screenVideo.stop();
        screenStream.removeTrack(screenVideo);
        // merge the two streams into one audio stream
        let audioCtx = new AudioContext()
            , destination = audioCtx.createMediaStreamDestination();
        [...arguments].forEach(stream => {
            audioCtx.createMediaStreamSource(stream).connect(destination);
        })
        this.dest = destination.stream;
        // get the one audio track from the gotten stream
        this.audioTrack = destination.stream.getAudioTracks()[0];

        // create a new media stream to be used
        this.mediaStream = new MediaStream();
        // add video and audio tracks to this one stream
        ["audio", "video"].forEach(track => {
            this.mediaStream.addTrack(this[track + "Track"]);
        });
    } else {
        this.mediaStream = mediaStream;
    }
    this.mediaRecorder = new MediaRecorder(
        this.mediaStream, { mimeType: "video/webm; codecs=vp9" }
    );
    this.screenStream = screenStream;
    this.mediaRecorder.ondataavailable = (event) => {
        this.videoResponse(event);
    }
    this.mediaRecorder.start();
    VIDEO.srcObject = this.mediaStream;
    VIDEO.muted = true;
};

Interview.generateQuestions = function (obj) {
    Interview.aiGeneratedQuestions = Interview.aiGeneratedQuestions.concat(obj);
    // make it animated
    let questIndex = 0;
    let animateQUestions = setInterval(() => {
        if (!obj[questIndex]) {
            clearInterval(animateQUestions);
            return DONE = true;
            
        }
        new Question(obj[questIndex++]);
    }, 400);
};