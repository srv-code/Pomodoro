const modes = ['pomo', 'sbreak', 'lbreak'];

const elements = {};

const alarmSounds = {
  pomo: [
    'Alarm clock.wav',
    'Bottles.wav',
    'Chimes.wav',
    'Circles.wav',
    'Complete.wav',
    'Crystal.wav',
    'Grig.wav',
    'Jungle.wav',
    'Kitchen Timer Bell Ring.mp3',
    'Mechanical.wav',
    'Old Telephone.wav',
    'Reminder.wav',
    'Stroll.wav',
    'Train whistle.wav',
    'Trill.wav',
    'Victory.wav',
    'Waves.wav',
    'Whistle.wav',
    'Yeehaw.wav',
  ],
  tickers: ['Clock Ticking 2 short.wav', 'Clock Ticking 2.wav'],
};

let audio = new Audio('resources/audio/Alarm clock.wav');

const timer = {
  tick: null,
  secs: null,
  mode: null,
};

const customSettings = {};

const defaultTimerSettings = {
  pomo: 25 * 60,
  sbreak: 5 * 60,
  lbreak: 15 * 60,

  test: 10, // TODO: Remove this, for testing purpose only
};

function setMode(mode) {
  if (modes.includes(mode)) {
    timer.mode = mode;
    timer.secs = defaultTimerSettings.test; // TODO: Remove this, for testing purpose only
    // timer.secs = defaultTimerSettings[mode]; // TODO: Enable this

    elements.spanMins.innerText = Math.floor(timer.secs / 60)
      .toString()
      .padStart(2, '0');
    elements.spanSecs.innerText = (timer.secs % 60).toString().padStart(2, '0');
    elements.spanTicker.className = '';

    [
      { mode: 'pomo', element: elements.headerPomo },
      { mode: 'sbreak', element: elements.headerSBreak },
      { mode: 'lbreak', element: elements.headerLBreak },
    ].forEach(x => {
      x.element.className = mode === x.mode ? 'highlighted-mode' : '';
    });
  } else throw new Error('Invalid mode: ' + mode);

  updateTimerButtonVisibilities('reset');
}

function updateTimerButtonVisibilities(state) {
  switch (state) {
    case 'start':
      elements.timerPauseButton.className = '';
      elements.timerResetButton.className = '';
      elements.timerStartButton.className = 'removed';
      elements.timerResumeButton.className = 'removed';
      break;

    case 'pause':
      elements.timerPauseButton.className = 'removed';
      elements.timerResetButton.className = '';
      elements.timerStartButton.className = 'removed';
      elements.timerResumeButton.className = '';
      break;

    case 'resume':
      elements.timerPauseButton.className = '';
      elements.timerResetButton.className = '';
      elements.timerStartButton.className = 'removed';
      elements.timerResumeButton.className = 'removed';
      break;

    case 'reset':
      elements.timerPauseButton.className = 'removed';
      elements.timerResetButton.className = 'removed';
      elements.timerStartButton.className = '';
      elements.timerResumeButton.className = 'removed';
      break;

    default:
      throw new Error('Invalid state: ' + state);
  }
}

function playAudio() {
  audio.play();
}

function clearTimer() {
  clearInterval(timer.tick);

  timer.tick = null;
  timer.mode = null;
  timer.secs = null;

  elements.spanTicker.className = '';

  elements.timer;
  elements.timerStartButton.className = '';
}

function pauseTimer() {
  updateTimerButtonVisibilities('pause');
}

function resumeTimer() {
  updateTimerButtonVisibilities('resume');
}

function resetTimer() {
  updateTimerButtonVisibilities('reset');
}

// function stopTimer() {
//   if (confirm('Reset Timer?')) {clearTimer();

//   }
// }

function startTimer() {
  timer.tick = setInterval(function updateTicker() {
    timer.secs -= 1;

    // if (timer.secs === 0) clearTimer();

    console.log('time:', {
      mins: Math.floor(timer.secs / 60)
        .toString()
        .padStart(2, '0'),
      secs: (timer.secs % 60).toString().padStart(2, '0'),
      showTicker: !!(timer.secs % 2),
    });

    elements.spanMins.innerText = Math.floor(timer.secs / 60)
      .toString()
      .padStart(2, '0');
    elements.spanSecs.innerText = (timer.secs % 60).toString().padStart(2, '0');
    elements.spanTicker.className = timer.secs % 2 ? 'hidden' : '';
  }, 1000);

  updateTimerButtonVisibilities('start');
}

window.onload = () => {
  elements.spanMins = document.getElementById('span-timer-mins');
  elements.spanSecs = document.getElementById('span-timer-secs');
  elements.spanTicker = document.getElementById('span-timer-ticker');

  elements.timerStartButton = document.getElementById('button-timer-start');
  elements.timerPauseButton = document.getElementById('button-timer-pause');
  elements.timerResumeButton = document.getElementById('button-timer-resume');
  elements.timerResetButton = document.getElementById('button-timer-reset');

  elements.headerPomo = document.getElementById('span-mode-pomo');
  elements.headerSBreak = document.getElementById('span-mode-sbreak');
  elements.headerLBreak = document.getElementById('span-mode-lbreak');

  elements.spanRoundCounter = document.getElementById('span-round-count');

  setMode('pomo');
};

function test() {
  console.log({ elements, timer });
  // playAudio();
  console.log('forms:', document.forms);
}

window.onerror = (message, source, lineno, colno, error) =>
  alert(
    'Error occured:\n' +
      JSON.stringify({ message, source, lineno, colno, error }, null, 2)
  );
