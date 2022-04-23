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
    'Train Whistle.wav',
    'Trill.wav',
    'Victory.wav',
    'Waves.wav',
    'Whistle.wav',
    'Yeehaw.wav',
  ],
  tickers: ['None', 'Clock Ticking 2 short.wav', 'Clock Ticking 2.wav'],
};

const notificationEvent = ['Last', 'Every'];

let audio = new Audio('resources/audio/Alarm clock.wav');

const timer = {
  tick: null,
  secs: null,
  mode: null,
};

const settings = {
  storageKey: 'settings',
  default: {
    times: {
      pomo: 25 * 60,
      sbreak: 5 * 60,
      lbreak: 15 * 60,
      test: 10, // TODO: Remove this, for testing purpose only}
    },
    autoStartBreaks: true,
    alarmSound: alarmSounds.pomo[0],
    tickingSound: alarmSounds.tickers[0],
    notification: {
      event: notificationEvent[0],
      timeInMins: 5,
    },
  },
  custom: {},
};

function setMode(mode) {
  if (modes.includes(mode)) {
    timer.mode = mode;
    timer.secs = settings.custom.times.test; // TODO: Remove this, for testing purpose only
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
  /* Cache all HTML elements */
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

  elements.settingInputPomoTime = document.getElementById(
    'input-setting-pomo-time'
  );
  elements.settingInputSBreakTime = document.getElementById(
    'input-setting-sbreak-time'
  );
  elements.settingInputLBreakTime = document.getElementById(
    'input-setting-lbreak-time'
  );
  elements.settingInputNotifTime = document.getElementById(
    'input-setting-notif-time'
  );

  elements.settingCheckboxAutoStartBreaks = document.getElementById(
    'checkbox-auto-start-breaks'
  );

  elements.settingDropdownAlarmSounds = document.getElementById(
    'select-alarm-sounds'
  );
  elements.settingDropdownTickingSounds = document.getElementById(
    'select-ticking-sounds'
  );
  elements.settingDropdownNotifEvent =
    document.getElementById('select-notif-event');

  /* loads & sets custom settings */
  settings.custom =
    JSON.parse(localStorage.getItem(settings.storageKey)) ||
    structuredClone(settings.default);

  /* Load values in all HTML elements */
  elements.settingInputPomoTime.value = Math.floor(
    settings.custom.times.pomo / 60
  );
  elements.settingInputSBreakTime.value = Math.floor(
    settings.custom.times.sbreak / 60
  );
  elements.settingInputLBreakTime.value = Math.floor(
    settings.custom.times.lbreak / 60
  );

  alarmSounds.pomo.forEach(soundName => {
    const option = document.createElement('option');
    option.text = soundName.substring(0, soundName.lastIndexOf('.'));
    option.value = soundName;
    option.selected = soundName === settings.custom.alarmSound;
    elements.settingDropdownAlarmSounds.appendChild(option);
  });

  alarmSounds.tickers.forEach(soundName => {
    const option = document.createElement('option');
    option.text = soundName.substring(
      0,
      soundName === 'None' ? undefined : soundName.lastIndexOf('.')
    );
    option.value = soundName;
    option.selected = soundName === settings.custom.tickingSound;
    elements.settingDropdownTickingSounds.appendChild(option);
  });

  notificationEvent.forEach(event => {
    const option = document.createElement('option');
    option.text = event;
    option.value = event;
    option.selected = event === settings.custom.notification.event;
    elements.settingDropdownNotifEvent.appendChild(option);
  });

  elements.settingCheckboxAutoStartBreaks.checked =
    settings.custom.autoStartBreaks;

  elements.settingInputNotifTime.value =
    settings.custom.notification.timeInMins;

  /* Set inial mode to pomo */
  setMode('pomo');
};

function submitSetting() {
  const userSettings = {
    times: {
      pomo: +elements.settingInputPomoTime.value * 60,
      sbreak: +elements.settingInputSBreakTime.value * 60,
      lbreak: +elements.settingInputLBreakTime.value * 60,
    },
    autoStartBreaks: elements.settingCheckboxAutoStartBreaks.checked,
    alarmSound: elements.settingDropdownAlarmSounds.value,
    tickingSound: elements.settingDropdownTickingSounds.value,
    notification: {
      event: elements.settingDropdownNotifEvent.value,
      timeInMins: elements.settingInputNotifTime.value,
    },
  };

  settings.custom = userSettings;
  localStorage.setItem(settings.storageKey, JSON.stringify(userSettings));

  console.log({ settings });
}

function resetSetting() {
  elements.settingInputPomoTime.value = Math.floor(
    settings.default.times.pomo / 60
  );
  elements.settingInputSBreakTime.value = Math.floor(
    settings.default.times.sbreak / 60
  );
  elements.settingInputLBreakTime.value = Math.floor(
    settings.default.times.lbreak / 60
  );
  elements.settingCheckboxAutoStartBreaks.checked =
    settings.default.autoStartBreaks;
  elements.settingDropdownAlarmSounds.value = settings.default.alarmSound;
  elements.settingDropdownTickingSounds.value = settings.default.tickingSound;
  elements.settingDropdownNotifEvent.value =
    settings.default.notification.event;
  elements.settingInputNotifTime.value =
    settings.default.notification.timeInMins;

  localStorage.clear();

  settings.custom = structuredClone(settings.default);
}

function test() {
  // console.log({ elements, timer });
  // playAudio();
  // console.log(
  //   'forms:',
  //   document.forms,
  //   // document.forms[0]['checkbox-auto-start-breaks'],
  //   document.forms['form-settings']['checkbox-auto-start-breaks']
  // );
  // localStorage.setItem(settings.storageKey, JSON.stringify(settings.default));
  // console.log(
  //   'localStorage:',
  // localStorage.getItem(settings.storageKey),
  //   JSON.parse(localStorage.getItem(settings.storageKey))
  // );
  // localStorage.clear();
  console.log({ settings });
  // console.log(elements.checkboxAutoStartBreaks.checked);
}

window.onerror = (message, source, lineno, colno, error) =>
  alert(
    'Error occured:\n' +
      JSON.stringify({ message, source, lineno, colno, error }, null, 2)
  );
