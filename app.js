
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const timeDisplay = document.getElementById('time');
    const progressBar = document.getElementById('progressBar');
    const sessionInfo = document.getElementById('sessionInfo');
    const progressInfo = document.getElementById('progress');
    const quoteDisplay = document.getElementById('quote');
    const statSessions = document.getElementById('statSessions');
    const statCycles = document.getElementById('statCycles');
    const statTime = document.getElementById('statTime');
    const pomodoroBtn = document.getElementById('pomodoroBtn');
    const shortBreakBtn = document.getElementById('shortBreakBtn');
    const longBreakBtn = document.getElementById('longBreakBtn');
    const mainTimerBtn = document.getElementById('mainTimerBtn');
    const resetBtn = document.getElementById('resetBtn');
    const skipBtn = document.getElementById('skipBtn');
    const darkModeBtn = document.getElementById('darkModeBtn');
    const soundBtn = document.getElementById('soundBtn');
    const bgSelect = document.getElementById('bgSelect');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const setDurationsBtn = document.getElementById('setDurationsBtn');
    const pomodoroDurationInput = document.getElementById('pomodoroDuration');
    const shortBreakDurationInput = document.getElementById('shortBreakDuration');
    const longBreakDurationInput = document.getElementById('longBreakDuration');
    const autoStartCheckbox = document.getElementById('autoStart');

    // --- State ---
    // Button state
    let mainBtnState = 'start'; // 'start', 'pause', 'resume'
    let mode = 'pomodoro';
    let durations = {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15
    };
    let timer = null;
    let timeLeft = durations.pomodoro * 60;
    let isRunning = false;
    let isPaused = false;
    let sessionCount = 0;
    let cycleCount = 0;
    let totalMinutes = 0;
    let autoStart = false;
    let soundOn = true;
    let darkMode = false;
    let quotes = [
        "Stay focused, stay productive!",
        "Small steps every day.",
        "Discipline is the bridge between goals and accomplishment.",
        "You can do it!",
        "Breaks help your brain!",
        "Consistency is key.",
        "Keep going, you're doing great!"
    ];
    let alarm = new Audio('alarm.mp3');
    alarm.preload = 'auto';

    // --- Utility Functions ---
    function pad(n) { return n < 10 ? '0' + n : n; }
    function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${pad(m)}:${pad(s)}`;
    }
    function setProgressBar() {
        const total = durations[mode] * 60;
        const percent = 1 - (timeLeft / total);
        const radius = 80;
        const circ = 2 * Math.PI * radius;
        progressBar.setAttribute('stroke-dasharray', circ);
        progressBar.setAttribute('stroke-dashoffset', circ * (1 - percent));
    }
    function updateDisplay() {
        timeDisplay.textContent = formatTime(timeLeft);
        sessionInfo.textContent = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
        setProgressBar();
        statSessions.textContent = `Sessions: ${sessionCount}`;
        statCycles.textContent = `Cycles: ${cycleCount}`;
        statTime.textContent = `Time: ${totalMinutes}m`;
        progressInfo.textContent = isRunning ? 'Running...' : (isPaused ? 'Paused' : 'Stopped');
        // Update main button icon and label
        if (mainTimerBtn) {
            if (!isRunning && !isPaused) {
                mainBtnState = 'start';
                mainTimerBtn.textContent = '▶️';
                mainTimerBtn.title = 'Start';
            } else if (isRunning) {
                mainBtnState = 'pause';
                mainTimerBtn.textContent = '⏸️';
                mainTimerBtn.title = 'Pause';
            } else if (isPaused) {
                mainBtnState = 'resume';
                mainTimerBtn.textContent = '⏵';
                mainTimerBtn.title = 'Resume';
            }
        }
    }
    function showQuote() {
        quoteDisplay.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    }
    function saveState() {
        localStorage.setItem('pomodoroState', JSON.stringify({
            durations, sessionCount, cycleCount, totalMinutes, autoStart, soundOn, darkMode
        }));
    }
    function loadState() {
        const state = JSON.parse(localStorage.getItem('pomodoroState'));
        if (state) {
            durations = state.durations || durations;
            sessionCount = state.sessionCount || 0;
            cycleCount = state.cycleCount || 0;
            totalMinutes = state.totalMinutes || 0;
            autoStart = state.autoStart || false;
            soundOn = state.soundOn !== undefined ? state.soundOn : true;
            darkMode = state.darkMode || false;
        }
    }
    function applyTheme() {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        if (darkModeBtn) darkModeBtn.textContent = darkMode ? '☀️' : '🌙';
    }
    function applySoundIcon() {
        soundBtn.textContent = soundOn ? '🔊' : '🔇';
    }
    function applyBackground() {
        const val = bgSelect.value;
        document.body.classList.remove('bg-gradient', 'bg-forest', 'bg-ocean', 'bg-space');
        if (val === 'gradient') document.body.classList.add('bg-gradient');
        if (val === 'forest') document.body.classList.add('bg-forest');
        if (val === 'ocean') document.body.classList.add('bg-ocean');
        if (val === 'space') document.body.classList.add('bg-space');
    }
    function notify() {
        if (Notification.permission === 'granted') {
            new Notification("Time's up!");
        }
    }

    // --- Timer Logic ---
    function startOrPauseTimer() {
        if (!isRunning && !isPaused) {
            // Start
            isRunning = true;
            isPaused = false;
            timer = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateDisplay();
                } else {
                    clearInterval(timer);
                    isRunning = false;
                    sessionCount++;
                    totalMinutes += durations[mode];
                    if (soundOn) alarm.play();
                    notify();
                    showQuote();
                    if (mode === 'pomodoro') {
                        if ((sessionCount % 4) === 0) {
                            mode = 'longBreak';
                            cycleCount++;
                        } else {
                            mode = 'shortBreak';
                        }
                    } else {
                        mode = 'pomodoro';
                    }
                    timeLeft = durations[mode] * 60;
                    updateDisplay();
                    saveState();
                    if (autoStartCheckbox.checked) {
                        startOrPauseTimer();
                    }
                }
            }, 1000);
            updateDisplay();
        } else if (isRunning) {
            // Pause
            clearInterval(timer);
            isPaused = true;
            isRunning = false;
            updateDisplay();
        } else if (isPaused) {
            // Resume
            isRunning = true;
            isPaused = false;
            timer = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateDisplay();
                } else {
                    clearInterval(timer);
                    isRunning = false;
                    sessionCount++;
                    totalMinutes += durations[mode];
                    if (soundOn) alarm.play();
                    notify();
                    showQuote();
                    if (mode === 'pomodoro') {
                        if ((sessionCount % 4) === 0) {
                            mode = 'longBreak';
                            cycleCount++;
                        } else {
                            mode = 'shortBreak';
                        }
                    } else {
                        mode = 'pomodoro';
                    }
                    timeLeft = durations[mode] * 60;
                    updateDisplay();
                    saveState();
                    if (autoStartCheckbox.checked) {
                        startOrPauseTimer();
                    }
                }
            }, 1000);
            updateDisplay();
        }
    }
    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        isPaused = false;
        timeLeft = durations[mode] * 60;
        updateDisplay();
    }
    function skipSession() {
        clearInterval(timer);
        isRunning = false;
        isPaused = false;
        if (mode === 'pomodoro') {
            if ((sessionCount % 4) === 0) {
                mode = 'longBreak';
                cycleCount++;
            } else {
                mode = 'shortBreak';
            }
        } else {
            mode = 'pomodoro';
        }
        timeLeft = durations[mode] * 60;
        updateDisplay();
        saveState();
    }
    function switchMode(newMode) {
        clearInterval(timer);
        isRunning = false;
        isPaused = false;
        mode = newMode;
        timeLeft = durations[mode] * 60;
        updateDisplay();
        saveState();
        highlightModeButton();
    }
    // Custom timer logic removed
    function setCustomDurations() {
        const p = parseInt(pomodoroDurationInput.value);
        const s = parseInt(shortBreakDurationInput.value);
        const l = parseInt(longBreakDurationInput.value);
        if (!isNaN(p) && p > 0 && p <= 120) durations.pomodoro = p;
        if (!isNaN(s) && s > 0 && s <= 60) durations.shortBreak = s;
        if (!isNaN(l) && l > 0 && l <= 60) durations.longBreak = l;
        timeLeft = durations[mode] * 60;
        updateDisplay();
        saveState();
    }
    function highlightModeButton() {
        [pomodoroBtn, shortBreakBtn, longBreakBtn].forEach(btn => btn.classList.remove('active'));
        if (mode === 'pomodoro') pomodoroBtn.classList.add('active');
        if (mode === 'shortBreak') shortBreakBtn.classList.add('active');
        if (mode === 'longBreak') longBreakBtn.classList.add('active');
    }
    function toggleDarkMode() {
        darkMode = !darkMode;
        applyTheme();
        saveState();
    }
    function toggleSound() {
        soundOn = !soundOn;
        applySoundIcon();
        saveState();
    }
    function changeBackground() {
        applyBackground();
    }
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // --- Event Listeners ---
    if (mainTimerBtn) mainTimerBtn.onclick = startOrPauseTimer;
    if (resetBtn) resetBtn.onclick = resetTimer;
    if (skipBtn) skipBtn.onclick = skipSession;
    if (pomodoroBtn) pomodoroBtn.onclick = () => switchMode('pomodoro');
    if (shortBreakBtn) shortBreakBtn.onclick = () => switchMode('shortBreak');
    if (longBreakBtn) longBreakBtn.onclick = () => switchMode('longBreak');
    if (setDurationsBtn) setDurationsBtn.onclick = setCustomDurations;
    if (darkModeBtn) darkModeBtn.onclick = function() {
        darkMode = !darkMode;
        applyTheme();
        saveState();
    };
    if (soundBtn) soundBtn.onclick = toggleSound;
    if (bgSelect) bgSelect.onchange = changeBackground;
    if (fullscreenBtn) fullscreenBtn.onclick = toggleFullscreen;

    // --- Initialization ---
    loadState();
    applyTheme();
    applySoundIcon();
    applyBackground();
    highlightModeButton();
    updateDisplay();
    showQuote();
    autoStartCheckbox.checked = autoStart;
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
});


