// incorporate TensorFlow/Any free AI tool to check if input to AI is reasonable.
// add 'goto' feature (maybe), goto question i...
class Interview {
    constructor(questions, useVideo) {
        [this.questions, this.useVideo] = arguments;
        this.answers = populate(this.questions.length);
        this.index = 0;
        this.rewriteAll();
        this.configure();
        this.event();
    }
    ask(index, question) {
        this.index = index || this.index;  // how to 'goto'
        question = question || this.question;
        if (this.useVideo) {
            say(question).then(resp => {
                this.disenable(false);
            });
        } else {
            this.questionBox.textContent = question;
            ANSWERBOX.value = this.answer || "";
            ANSWERBOX.focus();
        }
    };
    next() {
        let ended = this.index >= this.questions.length - 1
        if (!this.useVideo && ANSWERBOX.value.trim() == "") {
            return alert("Enter a response to proceed!");
        }
        if (ended) {
            confirm("Do you want to complete your interview?").then(bool => {
                if (!bool) return;
                if (this.useVideo) {
                    say(INTERVIEW.TEXT_AFTER).then(resp => {
                        this.transcribe = false;
                        let tracks = ["media", "screen"];
                        isPhone() && tracks.pop();
                        tracks.forEach(type => {
                            this[type + "Stream"].getTracks().forEach(i => i.stop());
                        })
                        this.mediaRecorder.stop();  // Will call videoResponse
                    });
                }
                REFRESHER.disabled = this.textResponse(this.useVideo);
                this.makeShare();
            });
            return;
        }
        if (this.useVideo) {
            // maybe check if speechrecog text is plenty enough
        } else {
            this.blur();
        }
        this.ask(++this.index);
    };
    previous() {
        if (this.index <= 0) {
            return alert("Err... this is the first question...");
        }
        if (this.useVideo) {
            // maybe check if speechrecog text is plenty enough
        } else {
            this.blur();
        }
        this.ask(--this.index);
    };
    disenable(bool = true) {
        [...SAY.children].forEach(i => i.disabled = bool);
        [PREV, NEXT].forEach(button => button.disabled = bool);
        this.transcribe = !bool;
    };
    pause() {
        [speechSynthesis, VIDEO, this.mediaRecorder].forEach(
            obj=>obj.pause()
        );
        // pause audio recorder (screen recording)
    };
    resume() {
        // resume audio recorder (screen recording)
        this.mediaRecorder.resume();
        VIDEO.play();
        speechSynthesis.resume();
        if (!speechSynthesis.speaking && !speechSynthesis.paused) {
            this.disenable(false);
        }
    };
    makeShare(){
        if (window.SHARED) return;
        // generalize forming later
        let forming = (name, value)=>getS(`#SHARE [name="${name}"]`).value = value;
        forming("questions", jsonStr(INTERVIEW.QUESTIONS));
        TEXT_FIELDS.forEach(field=>{
            forming(field.toLowerCase(), INTERVIEW[field] || "Not Video");
        });
        if (this.useVideo){
            this.mediaRecorder.addEventListener("dataavailable", ()=>add(SHARE));
        } else{
            add(SHARE);
        }
    }
    rewriteAll() {
        getFromServer(`/ai/rewrite/`, this.questions)
        .then(response=>{
            checkResponse(response, ["Failed"])
            .then(()=>{
                this.various = response.obj;
            }).catch(console.log)
        }).catch(console.log);
    };
    textResponse(hide=False) {
        for (let i = 0; i < INTERVIEW.QUESTIONS.length; i++) {  // proper way to loop??? :)
            let row = add(make("tr"), TEXTRESPONSE);
            ["questions", "answers"].forEach(
                arg => add(make("td"), row).textContent = this[arg][i]
            )
        }
        if (!hide) switchScreen("TXTRESP");
        return hide;
    };
    videoResponse(event) {
        switchScreen("VIDRESP");
        this.videoFile = event.data;
        VIDEORESPONSE.src = URL.createObjectURL(this.videoFile);
        (SAVE.downloader = make('a')).download = "ai-interview.webm";
        SAVE.downloader.href = VIDEORESPONSE.src;
        REFRESHER.disabled = false;
    }
    blur() {
        this.questionBox.setAttribute("disabled", "true");
        setTimeout(() => this.questionBox.removeAttribute("disabled"), 200)
    }
    exit(message = "Sorry, an error occured. You will have to restart.") {
        alert(message, ["RESTART"]).then(() => location.reload());
    }
    get question() {
        return (this.holdQuestion = this.questions[this.index]);
    }
    get anotherQuestion() {
        return (this.holdQuestion = this.various ? choice(this.various[this.index]) : this.holdQuestion);
    }
    get answer() {
        return this.answers[this.index];
    }
    static containers = [TEXTINTERVIEW, VIDEOINTERVIEW];
    static aiGeneratedQuestions = [];
    // in SETUP, do a starter.
}