// dom functions
let make = (name='div')=>document.createElement(name)
  , get = (id)=>document.getElementById(id)
  , getE = (selector,value)=>document.querySelector(`[${selector}=${value}]`)
  , getS = (query)=>document.querySelector(query)
  , getAll = (query)=>[...document.querySelectorAll(query)]
  , identify = ()=>getAll('[id]').forEach(i=>window[i.id] = i)
  , add = (what,to=document.body)=>to.appendChild(what)
  , bx = (who)=>who.getBoundingClientRect()
  , show = (what) => what.style.display=""
  , hide = (what) => what.style.display="none"
  , domAt = (x, y) => document.elementFromPoint(x, y)
  , reclass = (dom, className, remove=0) => dom.classList[remove?"remove":"add"](className)
  , hasClass = (dom, className)=>dom.classList.contains(className);


// still DOM functions
function switchScreen(screenID){
    getAll("body>div").forEach(div=>{if (div.id) div.style.display = "none"});
    get(screenID).style.display = "";
};

// initialize the loading element, that blocks the screen and all
function loader(){
  let loading;
  (loading = make()).id = "LOADING";
  showLoading = (text="") => add(loading).style.setProperty("--content", `"${text}"`);
  hideLoading = () => loading.remove();
  isPageLoading = () => loading.isConnected;
  const N = 10;
  for (let n = 0; n < N; n++){
      let c;
      (c = make()).id = 'c'+n;
      c.style.animationDelay = n/N+'s';
      // use other numbers appart from .1 to see effects;
      // will have to change animation-duration and dimensions too
      loading.append(c);
  };
};

// math
// not inclusive of the last one (a is the little one)
function randBtw(a, b){
    return a+parseInt((b-a)*Math.random());
};

// others for data handling
let choice = (array)=>array[randBtw(0, array.length)]
  , jsonStr = (obj)=>JSON.stringify(obj)
  , jsonObj = (str)=>JSON.parse(str)
  , copy = (obj)=>jsonObj(jsonStr(obj))
  , remove = (what, from) => from.splice(from.indexOf(what), 1)
  , local = (item, value)=>value ? localStorage.setItem(item, value) : localStorage[item];

function populate(n, val=""){
    let result = [];
    for (let i = 0; i < n; i++) {
       result.push(val);
    };
    return result;
}

  // Fetch API POST usage
function getFromServer(url, body){
  return fetch(url, {
      method: "post",
      headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': getS(`[name=csrfmiddlewaretoken]`).value
      },
  
      body: JSON.stringify(body)
  });
};

function checkResponse(response, wrongs, error="API cannot be used"){
  if (response.status != 200){
      throw "rejected with error "+response.statusText;
  }
  // will return the promise from text()
  return response.text().then(obj=>{
      // Check for other responses...
      if (!obj || wrongs.includes(obj.trim())){
          throw "rejected "+obj;
      }
      // Now convert to json.
      obj = jsonObj(obj);
      // Gemini cannot be used ("inside" joke (inside joke))
      if (!obj) throw error;
      // Keep obj across all (let's see how promises work)
      response.obj = obj;
  });
};

// speechSynthesis
// get voice from voice name
function getVoice(name){
  return speechSynthesis.getVoices().find(i=>i.name == name);
};

// misc
function isPhone(){
  return navigator.userAgentData.mobile;
}