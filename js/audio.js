function initAudio() {
    $("#soundtrack")[0].volume = 0.1;
    $("#sfx")[0].volume = 0.3;
    if (document.cookie) {
        let v = document.cookie.split('; ').find(row => row.startsWith('userHasSilenced=')).split('=')[1];
        setUserHasSilenced(v);
    } else {
        activateAudio();
    }

}

function toggleAudio() {
    if (readUserHasSilenced()) {
        activateAudio();
        playAudio();
    } else {
        silenceAudio();
        pauseAudio();
    }
}

function audioCallback(type) {
    switch (type) {
        case Audios.MUSIC:
            maybePlayAudio();
            break;
        case Audios.ROLL:
            maybePlayDiceSoundEffect();
            break;
    }
}

function maybePlayAudio() {
    if (!readUserHasSilenced()) {
        playAudio();
    }
}

function playAudio() {
    $("#soundtrack")[0].play();
}

function pauseAudio() {
    $("#soundtrack")[0].pause();
}

function maybePlayDiceSoundEffect() {
    if (!readUserHasSilenced()) {
        $("#sfx")[0].play();
    }
}

function silenceAudio() {
    enableUserHasSilenced();
    document.cookie = "userHasSilenced=true;samesite=strict";
}

function activateAudio() {
    disableUserHasSilenced();
    document.cookie = "userHasSilenced=false;samesite=strict";
}
