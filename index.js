const url = 'https://us-central1-calm-streamer-339303.cloudfunctions.net/rsvp';


function makeQuery(c, t, a, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => { 
        if (xmlHttp.readyState === 4 && (xmlHttp.status === 200 || xmlHttp.status === 304)) {
            callback(JSON.parse(xmlHttp.responseText));
        }
    }
    xmlHttp.open("GET", `${url}?c=${c}&t=${t}&a=${a}`, true);
    xmlHttp.send(null);
}

function updateRSVP(response) { 
    const content = document.querySelector('div[id=content]');
    content.innerHTML = `<p>Hello ${response.name}</p>`
}


(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const c = urlParams.get('c');
    if (c) {
        makeQuery(c, 'v', null, updateRSVP);
    }
})();
