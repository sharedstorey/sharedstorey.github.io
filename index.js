// Constants

const url = 'https://us-central1-calm-streamer-339303.cloudfunctions.net/rsvp';


// Cookie methods

function getCookie() {
    try {
        const cookie = document.cookie || "data={};";
    
        const parts = cookie.split(';');
    
        const [_, ...remaining] = parts
            .map(value => value.split('='))
            .find(value => value[0] === 'data');
        
        if (!remaining) {
            return {};
        }
    
        return JSON.parse(remaining.join("="));
    } catch (e) {
        return {};
    }
}


function setCookie(data={}) {
    document.cookie = `data=${JSON.stringify(data)}; SameSite=None; Secure`
}


// Element methods 

const elements = {}


function getElement(id) {
    elements[id] = elements[id] || document.getElementById(id);
    return elements[id];
}


function addError(id, error) {
    addClass(id, 'is-danger');

    const parentId = `${id}-parent`;
    addClass(parentId, 'is-danger');

    const errorId = `${id}-error`;

    getElement(errorId).innerHTML = error;
    removeClass(errorId, 'is-hidden');
    addClass(errorId, 'is-danger');
}


function removeError(id) {
    removeClass(id, 'is-danger');

    const parentId = `${id}-parent`;
    removeClass(parentId, 'is-danger');

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

    xmlHttp.open("GET", `${url}?c=${encodeURIComponent(c)}&t=${encodeURIComponent(t)}&a=${encodeURIComponent(a)}${questionsString}`, true);
    xmlHttp.send(null);
}


// RSVP methods

function rsvpSubmit(event = null) {
    event?.preventDefault();

    const amount = getElement('rsvp-amount').value;
    const code = getElement('rsvp-code').value;
    const q1 = getElement('rsvp-q1').value;
    const q2 = getElement('rsvp-q2').value;
    const q3 = getElement('rsvp-q3').value;
    let q4 = getElement('rsvp-q4').value;
    let q5 = getElement('rsvp-q5').value;

    if (amount == 0) {
        q4 = q5 = "Not attending";
    }

    const data = getCookie();

    let error = false;

    console.log(amount, q4, q5);

    if ((amount == 2 || (amount == 1 && data.rsvp_max === 1)) && q4 === "Not attending") {
        addError('rsvp-q4', 'Please select an entrée for this guest.');
        error = true;
    }

    if (amount == 2 && q5 === "Not attending") {
        addError('rsvp-q5', 'Please select an entrée for this guest.');
        error = true;
    }

    if (amount == 1 && q4 === "Not attending" && q5 === "Not attending") {
        addError('rsvp-q4', '');
        addError('rsvp-q5', '');

        addError('rsvp', `The number of guests attending does not match the number of entrées selected.<br>Please verify your selections.`);

        error = true;

    }

    if (amount == 1 && q4 !== "Not attending" && q5 !== "Not attending") {
        addError('rsvp-q4', '');
        addError('rsvp-q5', '');

        addError('rsvp', `The number of guests attending does not match the number of entrées selected.<br>Please verify your selections.`);

        error = true;
    }

    if (error) return;

    addClass('rsvp-submit', 'is-loading');

    rsvpQuery(code, 'r', amount, {q1, q2, q3, q4, q5}, rsvpSuccess, rsvpError);
}


function rsvpError({error}) {
    addError('rsvp-error', error);
    removeClass('rsvp-submit', 'is-loading');
}


function rsvpSuccess(data) {
    rsvpCodeSuccess(data);

    removeError('rsvp-q4');
    removeError('rsvp-q5');
    removeError('rsvp');

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
    removeClass('rsvp-code-content', 'is-hidden');
    removeClass('rsvp-code', 'is-disabled');
    addClass('rsvp-code', 'is-danger');

    removeClass('rsvp-code-submit', 'is-loading');

    addError('rsvp-code', error);
}


function rsvpCodeSuccess(data) {
    setCookie(data);

    const {name, rsvp_max, rsvp_amount, events, questions} = data;
    
    // Hide RSVP code content
    addClass('rsvp-code-content', 'is-hidden');
    removeClass('rsvp-code-submit', 'is-loading');

    // Set and show RSVP content
    getElement('rsvp-name').innerHTML = `<p>Welcome ${name}!</p>`;

    let options = "";
    for (let i = 0; i <= rsvp_max; ++i) {
        let value = `${i} attending`; 
        if (i === 0) {
            value = data.rsvp_max > 1 ? 'We can\'t make it' : 'I can\'t make it';
        }  
        options += `<option class="has-text-centered" value=${i}>${value}</option>`;
    }
    getElement('rsvp-amount').innerHTML = options;
    getElement('rsvp-amount').value = rsvp_amount === null ? rsvp_max : rsvp_amount;
    
    for (let i = 0; i < 3; ++i) {
        getElement(`rsvp-q${i + 1}`).value = questions[i];
    }

    const names = name.split('and');

    for (let i = 0; i < 2; ++i) {
        if (i < names.length) {
            getElement(`rsvp-q${i + 1 + 3}`).value = questions[i + 3] || 'Not attending';
            getElement(`rsvp-q${i + 1 + 3}-text`).innerHTML = `${names[i].trim()}, please select your entrée.`;
            removeClass(`rsvp-q${i + 1 + 3}-field`, 'is-hidden');
        } else {
            addClass(`rsvp-q${i + 1 + 3}-field`, 'is-hidden');
        }
    }

    removeClass('rsvp-content', 'is-hidden');

    getElement('rsvp-submit').innerHTML = rsvp_amount == null ? 'RSVP' : 'Update';

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

    if (data.rsvp_amount == null) {
        return;
    }

    removeClass('rsvp-success-content', 'is-hidden');
    addClass('rsvp-content', 'is-hidden')

    getElement('rsvp-success-thanks').innerHTML = `${data.name}, thank you for your response.`;

    if (data.rsvp_amount > 0) {
        removeClass('rsvp-success-attending', 'is-hidden');
    } else {
        addClass('rsvp-success-attending', 'is-hidden');
    }
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

        removeError('rsvp');
        removeError('rsvp-q4');
        removeError('rsvp-q5');

        getElement('rsvp-code').value = "";
    });
    getElement('rsvp-success-incorrect').addEventListener('click', () => {
        setCookie();

        removeClass('rsvp-code-content', 'is-hidden');
        addClass('rsvp-success-content', 'is-hidden');

        getElement('rsvp-code').value = "";
    });
    getElement('rsvp-success-change').addEventListener('click', () => {
        addClass('rsvp-success-content', 'is-hidden');
        removeClass('rsvp-content', 'is-hidden');
    })
    getElement('rsvp-q4').addEventListener('change', () => removeError('rsvp-q4') || removeError('rsvp'));
    getElement('rsvp-q5').addEventListener('change', () => removeError('rsvp-q5') || removeError('rsvp'));
    getElement('rsvp-amount').addEventListener('change', () => {
        removeError('rsvp-q4') || removeError('rsvp-q5') || removeError('rsvp');

        if (getElement('rsvp-amount').value == 0) {
            getElement('rsvp-q4').value = 'Not attending';
            getElement('rsvp-q5').value = 'Not attending';
        }
    });

    var acc = document.getElementsByClassName('accordion-header');
    var i;
    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener('click', function() {
        this.classList.toggle('accordion-active');
        const panel = this.nextElementSibling;

        for(let item of document.getElementsByClassName('accordion-active')) {
            if (item !== this) {
                item.classList.toggle('accordion-active');

                const itemPanel = item.nextElementSibling;
                itemPanel.style.maxHeight = null;
            }
        }

        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = `${panel.scrollHeight}px`;
        } 
      });
    }

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
    } else {
        removeClass('rsvp-code-content', 'is-hidden');
    }
})();