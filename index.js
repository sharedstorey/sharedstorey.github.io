// Constants

const url = 'https://us-central1-calm-streamer-339303.cloudfunctions.net/rsvp';


// Element methods 

const elements = {}


function getElement(id) {
    elements[id] = elements[id] || document.getElementById(id);
    return elements[id];
}


function hide(id) {
    getElement(id)?.setAttribute('hidden', '');
}


function show(id) {
    getElement(id)?.removeAttribute('hidden');
}


// Helper methods

function rsvpQuery(c, t, a, success, error) {
    if (t === 'v' && document.cookie) {
        response = JSON.parse(document.cookie);
        if (response.id === c) {
            success(response);
            return;
        }
    }

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => { 
        if (xmlHttp.readyState !== 4) return;

        let response = {error: 'An error occured. Please try again later.'}
        if (xmlHttp.status === 200 || xmlHttp.status === 304)
        {
            response = JSON.parse(xmlHttp.responseText);
        }
        
        if (response.error) {
            error(response);
        } else {
            document.cookie = `${JSON.stringify(response)}; SameSite=None; Secure`
            success(response);
        }
    }
    xmlHttp.open("GET", `${url}?c=${c}&t=${t}&a=${a}`, true);
    xmlHttp.send(null);
}


// RSVP methods

function rsvpSubmit(event = null) {
    event?.preventDefault();

    hide('rsvp-form');

    const amount = getElement('rsvp-amount').value;
    const code = getElement('rsvp-code').value;

    rsvpQuery(code, 'r', amount, rsvpSuccess, rsvpError);
}

function rsvpError({error}) {

}

function rsvpSuccess({/* todo */}) {

}


// RSVP Code methods

function rsvpCodeSubmit(event = null) {
    event?.preventDefault();

    hide('rsvp-code-form');
    show('rsvp-code-status');

    const code = getElement('rsvp-code').value;

    rsvpQuery(code, 'v', null, rsvpCodeSuccess, rsvpCodeError);
}


function rsvpCodeError({error}) {
    show('rsvp-code-form');
    hide('rsvp-code-status');

    getElement('rsvp-code-error').innerHTML = error;
    show('rsvp-code-error');
}


function rsvpCodeSuccess({name, rsvp_max, events}) {
    // Hide RSVP code content
    hide('rsvp-code-content');

    // Set and show RSVP content
    getElement('rsvp-name').innerHTML = `<p>Hello ${name}!</p>`;

    let options = "";
    for (let i = 0; i < rsvp_max; ++i) {
        options += `<option value=${i + 1}>${i + 1}</option>`;
    }
    getElement('rsvp-amount').innerHTML = options;

    show('rsvp-content');

    // Set event details
    const eventDate = getElement('event-date');
    eventDate.innerHTML = events[0].date;
    show('event-date');

    events.forEach(({name, time}, i) => {
        const event = getElement(`event-${i}`);
        event.innerHTML = `${time} - ${name}`;
        show(`event-${i}`);
    });
    show('event-schedule');
}


// Entry point

(() => {
    const rsvpForm = getElement('rsvp-form');
    rsvpForm.addEventListener('submit', rsvpSubmit);

    const rsvpCodeForm = getElement('rsvp-code-form');
    rsvpCodeForm.addEventListener('submit', rsvpCodeSubmit);

    let c;

    if (document.cookie) {
        const data = JSON.parse(document.cookie);
        c = data.id;
    }

    const urlParams = new URLSearchParams(window.location.search);
    c = urlParams.get('c') || c;

    if (c) {
        getElement('rsvp-code').value = c;
        rsvpCodeSubmit();
    }
})();
