// Constants

const url = 'https://us-central1-calm-streamer-339303.cloudfunctions.net/rsvp';


// Cookie methods

function getCookie() {
    const cookie = document.cookie || "{}";
    return JSON.parse(cookie);
}


function setCookie(data={}) {
    document.cookie = `${JSON.stringify(data)}; SameSite=None; Secure`
}


// Element methods 

const elements = {}


function getElement(id) {
    elements[id] = elements[id] || document.getElementById(id);
    return elements[id];
}


function addError(id, error) {
    addClass(id, 'is-danger');

    const errorId = `${id}-error`

    getElement(errorId).innerHTML = error;
    removeClass(errorId, 'is-hidden');
    addClass(errorId, 'is-danger');
}


function removeError(id, error) {
    removeClass(id, 'is-danger');

    const errorId = `${id}-error`

    addClass(errorId, 'is-hidden');
    removeClass(errorId, 'is-danger');
}


function addClass(id, ...classNames) {
    const element = getElement(id);
    if (!element) return;

    for (const className of classNames) {
        element.classList.add(className);
    }
}

function removeClass(id, ...classNames) {
    const element = getElement(id);
    if (!element) return;

    for (const className of classNames) {
        element.classList.remove(className);
    }
}


// Helper methods

function rsvpQuery(c, t, a, questions, success, error) {
    if (t === 'v' && document.cookie) {
        const cookie = getCookie();
        if (cookie.id === c) {
            success(cookie);
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
            success(response);
        }
    }

    let questionsString = ""
    if (questions) {
        questionsString += questions.q1 && `&q1=${encodeURIComponent(questions.q1)}`
        questionsString += questions.q2 && `&q2=${encodeURIComponent(questions.q2)}`
        questionsString += questions.q3 && `&q3=${encodeURIComponent(questions.q3)}`
        questionsString += questions.q4 && `&q4=${encodeURIComponent(questions.q4)}`
        questionsString += questions.q5 && `&q5=${encodeURIComponent(questions.q5)}`
    }

    console.log(`${url}?c=${c}&t=${t}&a=${a}${questionsString}`);
    xmlHttp.open("GET", `${url}?c=${c}&t=${t}&a=${a}${questionsString}`, true);
    xmlHttp.send(null);
}


// RSVP methods

function rsvpSubmit(event = null) {
    event?.preventDefault();

    addClass('rsvp-submit', 'is-loading');

    const amount = getElement('rsvp-amount').value;
    const code = getElement('rsvp-code').value;
    const q1 = getElement('rsvp-q1').value;
    const q2 = getElement('rsvp-q2').value;
    const q3 = getElement('rsvp-q3').value;
    const q4 = getElement('rsvp-q4').value;
    const q5 = getElement('rsvp-q5').value;

    rsvpQuery(code, 'r', amount, {q1, q2, q3, q4, q5}, rsvpSuccess, rsvpError);
}


function rsvpError({error}) {
    addError('rsvp-error', error);
    removeClass('rsvp-submit', 'is-loading');
}


function rsvpSuccess(data) {
    rsvpCodeSuccess(data);

    getElement('rsvp-submit').innerHTML = 'Change';
    removeClass('rsvp-submit', 'is-loading');
}


// RSVP Code methods

function rsvpCodeSubmit(event = null) {
    event?.preventDefault();

    const code = getElement('rsvp-code').value;
    if (!code) {
        addError('rsvp-code', 'Please enter the RSVP code found in your email.');
        return;
    }

    addClass('rsvp-code', 'is-disabled');
    addClass('rsvp-code-submit', 'is-loading');

    rsvpQuery(code, 'v', null, null, rsvpCodeSuccess, rsvpCodeError);
}


function rsvpCodeError({error}) {
    removeClass('rsvp-code', 'is-disabled');
    addClass('rsvp-code', 'is-danger');

    removeClass('rsvp-code-submit', 'is-loading');

    addError('rsvp-code', error);
}


function rsvpCodeSuccess(data) {
    setCookie(data);

    const {name, rsvp_max, rsvp_amount, events, questions} = data;
    console.log(data);

    // Hide RSVP code content
    addClass('rsvp-code-content', 'is-hidden');
    removeClass('rsvp-code-submit', 'is-loading');

    // Set and show RSVP content
    getElement('rsvp-name').innerHTML = `<p>Welcome ${name}!</p>`;

    let options = "";
    for (let i = 0; i <= rsvp_max; ++i) {
        options += `<option value=${i}>${i}</option>`;
    }
    getElement('rsvp-amount').innerHTML = options;
    getElement('rsvp-amount').value = rsvp_amount
    console.log(rsvp_amount);
    
    for (let i = 0; i < questions.length; ++i) {
        getElement(`rsvp-q${i + 1}`).value = questions[i];
    }

    removeClass('rsvp-content', 'is-hidden');

    // Set event details
    const eventDate = getElement('event-date');
    eventDate.innerHTML = events[0].date;
    removeClass('event-date', 'is-hidden');

    events.forEach(({name, time}, i) => {
        const event = getElement(`event-${i}`);
        event.innerHTML = `${time} &ndash; ${name}`;
        removeClass(`event-${i}`, 'is-hidden');
    });
    removeClass('event-schedule', 'is-hidden');
}


// Entry point

(() => {
    getElement('navbar-burger').addEventListener('click', () => {
        getElement('navbar-burger').classList.toggle('is-active');
        getElement('navbar-menu').classList.toggle('is-active');
    });
    getElement('rsvp-code').addEventListener('input', () => removeError('rsvp-code'));
    getElement('rsvp-incorrect').addEventListener('click', () => {
        setCookie();

        removeClass('rsvp-code-content', 'is-hidden');
        addClass('rsvp-content', 'is-hidden');

        getElement('rsvp-code').value = "";
    });

    const rsvpForm = getElement('rsvp-form');
    rsvpForm.addEventListener('submit', rsvpSubmit);

    const rsvpCodeForm = getElement('rsvp-code-form');
    rsvpCodeForm.addEventListener('submit', rsvpCodeSubmit);

    const cookie = getCookie();
    const urlParams = new URLSearchParams(window.location.search);

    const code = urlParams.get('c') || cookie.id || null;
    if (code) {
        getElement('rsvp-code').value = code;
        rsvpCodeSubmit();
    }
})();
