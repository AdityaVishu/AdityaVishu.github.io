// --- Theme and Background ---
function changeBackground() {
    const bg = document.getElementById('bgSelect').value;
    let body = document.body;
    body.classList.remove('bg-forest', 'bg-ocean', 'bg-space', 'bg-gradient');
    if (bg === 'forest') body.classList.add('bg-forest');
    else if (bg === 'ocean') body.classList.add('bg-ocean');
    else if (bg === 'space') body.classList.add('bg-space');
    else body.classList.add('bg-gradient');
}
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    document.getElementById('darkModeBtn').textContent =
        document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}

// --- Sound Toggle ---
let soundOn = true;
function toggleSound() {
    soundOn = !soundOn;
    document.getElementById('soundBtn').textContent = soundOn ? '🔊' : '🔇';
}

// --- Motivational Quotes ---
const quotes = [
    "Stay focused, stay productive!",
    "Small steps every day!",
    "You are doing great!",
    "Breaks help your brain!",
    "Keep going, you're almost there!",
    "Discipline is the bridge between goals and accomplishment.",
    "Success is the sum of small efforts repeated.",
    "Progress, not perfection.",
    "You got this!",
    "Every minute counts!"
];
let quotePool = [];
function showRandomQuote() {
    if (quotePool.length === 0) quotePool = [...quotes];
    const idx = Math.floor(Math.random() * quotePool.length);
    const quote = quotePool.splice(idx, 1)[0];
    document.getElementById('quote').textContent = quote;
}

// --- Pomodoro Logic ---
let MODES = {
    pomodoro: { label: "Pomodoro", duration: 25 * 60 },
    shortBreak: { label: "Short Break", duration: 5 * 60 },
    longBreak: { label: "Long Break", duration: 15 * 60 }
};
let mode = 'pomodoro';

let timer, isRunning = false, isPaused = false, timeLeft = MODES[mode].duration;
let sessionCount = 0, cycleCount = 0, totalSessions = 0, totalMinutes = 0;
const SESSIONS_PER_CYCLE = 4;

const timeElement = document.getElementById('time');
const progressElement = document.getElementById('progress');
const sessionInfo = document.getElementById('sessionInfo');
const statSessions = document.getElementById('statSessions');
const statCycles = document.getElementById('statCycles');
const statTime = document.getElementById('statTime');
const autoStart = document.getElementById('autoStart');
const notifMsg = document.getElementById('notifMsg');
const modeButtons = {
    pomodoro: document.getElementById('pomodoroBtn'),
    shortBreak: document.getElementById('shortBreakBtn'),
    longBreak: document.getElementById('longBreakBtn')
};
const progressBar = document.getElementById('progressBar');

function updateTimeDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    updateProgress();
    updateCircle();
}

function updateProgress() {
    if (mode === 'pomodoro') {
        progressElement.textContent = `Session: ${sessionCount + 1} / ${SESSIONS_PER_CYCLE} | Cycle: ${cycleCount + 1}`;
    } else {
        progressElement.textContent = '';
    }
}

function updateSessionInfo() {
    sessionInfo.textContent = `Mode: ${MODES[mode].label}`;
}

function updateStats() {
    statSessions.textContent = `Sessions: ${totalSessions}`;
    statCycles.textContent = `Cycles: ${cycleCount}`;
    statTime.textContent = `Time: ${totalMinutes}m`;
}

function switchMode(newMode) {
    stopTimer();
    mode = newMode;
    timeLeft = MODES[mode].duration;
    updateTimeDisplay();
    updateSessionInfo();
    highlightModeButton();
}

function highlightModeButton() {
    Object.keys(modeButtons).forEach(m => {
        if (m === mode) {
            modeButtons[m].classList.add('active');
            modeButtons[m].setAttribute('aria-pressed', 'true');
        } else {
            modeButtons[m].classList.remove('active');
            modeButtons[m].setAttribute('aria-pressed', 'false');
        }
    });
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        isPaused = false;
        timer = setInterval(() => {
            if (!isPaused) {
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    isRunning = false;
                    playAlarm();
                    handleSessionEnd();
                } else {
                    timeLeft--;
                    updateTimeDisplay();
                }
            }
        }, 1000);
    }
}

function pauseTimer() {
    isPaused = true;
}

function resumeTimer() {
    if (isRunning && isPaused) {
        isPaused = false;
    }
}

function stopTimer() {
    clearInterval(timer);
    isRunning = false;
    isPaused = false;
}

function resetTimer() {
    stopTimer();
    timeLeft = MODES[mode].duration;
    updateTimeDisplay();
}

function setCustomTimer() {
    const minutes = document.getElementById('minutes').value;
    if (minutes && !isNaN(minutes) && minutes > 0) {
        timeLeft = minutes * 60;
        updateTimeDisplay();
    } else {
        alert('Please enter a valid number of minutes.');
    }
}

function setCustomDurations() {
    const pomo = parseInt(document.getElementById('pomodoroDuration').value, 10);
    const shortB = parseInt(document.getElementById('shortBreakDuration').value, 10);
    const longB = parseInt(document.getElementById('longBreakDuration').value, 10);
    if (pomo > 0) MODES.pomodoro.duration = pomo * 60;
    if (shortB > 0) MODES.shortBreak.duration = shortB * 60;
    if (longB > 0) MODES.longBreak.duration = longB * 60;
    timeLeft = MODES[mode].duration;
    updateTimeDisplay();
}

function handleSessionEnd() {
    if (mode === 'pomodoro') {
        sessionCount++;
        totalSessions++;
        totalMinutes += Math.round(MODES.pomodoro.duration / 60);
        if (sessionCount % SESSIONS_PER_CYCLE === 0) {
            cycleCount++;
            switchMode('longBreak');
        } else {
            switchMode('shortBreak');
        }
    } else {
        if (mode === 'longBreak') {
            sessionCount = 0;
        }
        switchMode('pomodoro');
    }
    updateSessionInfo();
    updateStats();
    showRandomQuote();
    if (autoStart && autoStart.checked) {
        setTimeout(() => {
            startTimer();
        }, 1000);
    }
}

function playAlarm() {
    if (soundOn) {
        try {
            const audio = new Audio('alarm.mp3'); // Corrected line
            audio.play();
        } catch (e) {}
    }
    let msg = notifMsg && notifMsg.value ? notifMsg.value : "Time's up!";
    if (Notification && Notification.permission === "granted") {
        new Notification("Pomodoro Timer", { body: msg });
    }
}
// --- Skip Session ---
function skipSession() {
    stopTimer();
    handleSessionEnd();
}

// Circular progress bar
function updateCircle() {
    const total = MODES[mode].duration;
    const percent = 1 - timeLeft / total;
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    progressBar.setAttribute('stroke-dasharray', circumference);
    progressBar.setAttribute('stroke-dashoffset', circumference * (1 - percent));
}

// Request notification permission on load
if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Save/restore state
window.addEventListener('beforeunload', () => {
    localStorage.setItem('timeLeft', timeLeft);
    localStorage.setItem('isRunning', isRunning);
    localStorage.setItem('mode', mode);
    localStorage.setItem('sessionCount', sessionCount);
    localStorage.setItem('cycleCount', cycleCount);
    localStorage.setItem('totalSessions', totalSessions);
    localStorage.setItem('totalMinutes', totalMinutes);
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    localStorage.setItem('bgSelect', document.getElementById('bgSelect').value);
    localStorage.setItem('soundOn', soundOn);
    localStorage.setItem('autoStart', autoStart && autoStart.checked);
    localStorage.setItem('notifMsg', notifMsg && notifMsg.value);
});

window.addEventListener('load', () => {
    // Restore theme/background
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeBtn').textContent = '☀️';
    }
    if (localStorage.getItem('bgSelect')) {
        document.getElementById('bgSelect').value = localStorage.getItem('bgSelect');
        changeBackground();
    } else {
        document.body.classList.add('bg-gradient');
    }
    // Restore sound
    soundOn = localStorage.getItem('soundOn') !== 'false';
    document.getElementById('soundBtn').textContent = soundOn ? '🔊' : '🔇';
    // Restore stats
    totalSessions = parseInt(localStorage.getItem('totalSessions'), 10) || 0;
    totalMinutes = parseInt(localStorage.getItem('totalMinutes'), 10) || 0;
    // Restore timer state
    if (localStorage.getItem('timeLeft')) {
        timeLeft = parseInt(localStorage.getItem('timeLeft'), 10);
        isRunning = localStorage.getItem('isRunning') === 'true';
        mode = localStorage.getItem('mode') || 'pomodoro';
        sessionCount = parseInt(localStorage.getItem('sessionCount'), 10) || 0;
        cycleCount = parseInt(localStorage.getItem('cycleCount'), 10) || 0;
        updateTimeDisplay();
        updateSessionInfo();
        highlightModeButton();
        updateStats();
        showRandomQuote();
        if (isRunning) {
            startTimer();
        }
    } else {
        updateTimeDisplay();
        updateSessionInfo();
        highlightModeButton();
        updateStats();
        showRandomQuote();
    }
    // Restore advanced options
    if (autoStart) autoStart.checked = localStorage.getItem('autoStart') === 'true';
    if (notifMsg && localStorage.getItem('notifMsg')) notifMsg.value = localStorage.getItem('notifMsg');
});
