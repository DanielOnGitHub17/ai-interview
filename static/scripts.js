// global variables
const TEXT_FIELDS = ["TEXT_BEFORE", "TEXT_AFTER"];
let DONE = true  // not a constant, a flag.
    , interviewSaved = false;

// Functions that do things specific to this app
// get user consent for recording screen and making video (remove)
function consentToRecording(){
    confirm(`
    To use this app's video feature, you must share your entire screen
    <br> and allow the app to record system audio<br>
    The app does not store recorded data after usage.<br>
    <b>Your privacy is paramount</b>
    `, ["decline", "agree"]).then(bool=>{
        // create a toggle to switch video options
        createVideoToggle();
        if (bool){
            // create voice search ui
            createVoiceSearchUI();
        
            // initialize SpeechSynthesisUtterance
            TALK = new SpeechSynthesisUtterance();
            TALK.onend = ()=>say.resolve(true);
        } else{
            videoSwitch.switch.click();
            SHOULDVIDEO.remove();
        };
        // if a phone do something with speech
        if (isPhone()){
            speechSynthesis.getVoices = ()=> [{name: "Default voice"}];
        };
    });
}

function setupAIQuestions() {
    let rep = AIGEN.reportValidity.bind(AIGEN);
    AIGEN.reportValidity = ()=>rep() && (textTopic.on ? TOPIC : TEXT).value;
    AIGEN.onsubmit = (event)=>{
        event.preventDefault();
        if (AIGEN.reportValidity()){
            GEN.disabled = true;
            alert("Questions are being generated in the background. They will appear soon.");
            let type = (textTopic.on ? "topic" : "text")
            , data = new FormData(AIGEN),
            body = {};
            body[type] = data.get(type);
            body["number"] = parseInt(data.get("questno"));
            // flag
            DONE = false;
            getFromServer("/ai/questions/", body)
            .then(response=>{
                checkResponse(response, ["Passed", "Failed"])
                .then(()=>{
                    alert("Questions will now be added");
                    Interview.generateQuestions(response.obj);
                }).catch(error=>{
                    console.log(error);
                    alert("Failed to generate questions!");
                })
            }).catch(error=>{
                console.log(error);
                alert("Failed to generate questions!");
            });
        };
    };
};

// for "data persistence" - localStorage
function saveData(){
    if (window.SHARED) return;
    INTERVIEW.QUESTIONS = [...QUESTIONLIST.children].map(q=>q.obj.question);
    // FIRST|FINAL-->SAY
    TEXT_FIELDS.forEach(phrase=>{
        if (window[phrase]){
            INTERVIEW[phrase] = window[phrase].value.trim();
        }
    });
    local("AI_INTERVIEW", jsonStr(INTERVIEW));
};

function restoreSavedData(){
    // check if interview is a shared page
    if (window.SHARED){
        INTERVIEW = jsonObj(window.SHARED.textContent)
    }else{
        INTERVIEW = local("AI_INTERVIEW") ? jsonObj(local("AI_INTERVIEW")) : {};
    }
    const QUESTIONS = INTERVIEW.QUESTIONS ? INTERVIEW.QUESTIONS : [];
    QUESTIONS.forEach(q=>(new Question(q)));
    TEXT_FIELDS.forEach(pos=>{
        if (INTERVIEW[pos]){
            window[pos].value = INTERVIEW[pos];
        }
    });
};

// say function to speak (make general later)
function say(text="", voice){
    // global variable talk
    speechSynthesis.cancel();
    TALK.text = text;
    if (voice){
        TALK.voice = voice;
    }
    speechSynthesis.speak(TALK);
    return new Promise((resolve)=>say.resolve=resolve);
};


// creator functions...

// create switch inside SHOULDVIDEO
function createVideoToggle(){
    videoSwitch = new Switch(SHOULDVIDEO
        , VIDEOSETTINGS.style, "display", ["none", ""])
};

// create text or topic switch
function createTextOrTopic(){
    textTopic = new Switch(AISWITCHOLD
    , AIGEN, "ariaSort", ["topic", "text"])
};

// create search ui for voices
function createVoiceSearchUI(){
    speechSearch = new SearchUI(VOICETHINGS
        , ()=>speechSynthesis.getVoices().map(i=>i.name)
    );
};

// set some things for CONTROLS
Object.defineProperty(CONTROLS, "layout", {
    get: function () { return CONTROLS.classList.contains("side") },
    set: function (value) {
        let property = value ? "add" : "remove";
        CONTROLS.classList[property]("side");
        CONTROLS.parentElement.classList[property]("side");
    }
});