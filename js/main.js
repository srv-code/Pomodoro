const modes = ['pomo', 'sbreak', 'lbreak'];

const state = {
  notificationSupported: null,
  pomodoroRounds: 0,
};

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

const notificationEvents = ['Last', 'Every'];

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
    autoStart: {
      breaks: true,
      pomos: true,
    },
    alarmSound: alarmSounds.pomo[0],
    alarmRepeatCount: 1,
    tickingSound: alarmSounds.tickers[0],
    notification: {
      event: notificationEvents[0],
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

  updateButtonVisibilities('reset');
}

function updateButtonVisibilities(state) {
  switch (state) {
    // case 'hide-all':
    //   elements.timerPauseButton.className = 'removed';
    //   elements.timerResetButton.className = 'removed';
    //   elements.timerStartButton.className = 'removed';
    //   elements.timerResumeButton.className = 'removed';
    //   break;

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

function clearTimer(timerCompleted = false) {
  clearInterval(timer.tick);

  timer.tick = null;
  timer.mode = null;
  timer.secs = null;

  elements.spanTicker.className = '';

  if (timerCompleted) {
    showNotification();
    ring(settings.custom.alarmSound);
  }

  document.title = `Pomodoro`;

  updateButtonVisibilities('reset');
}

function pauseTimer() {
  updateButtonVisibilities('pause');
}

function resumeTimer() {
  updateButtonVisibilities('resume');
}

function resetTimer() {
  updateButtonVisibilities('reset');
}

// function stopTimer() {
//   if (confirm('Reset Timer?')) {clearTimer();

//   }
// }

function startTimer() {
  timer.tick = setInterval(function updateTicker() {
    timer.secs -= 1;

    if (timer.secs === 0) clearTimer(true);

    console.log('time:', {
      mins: Math.floor(timer.secs / 60)
        .toString()
        .padStart(2, '0'),
      secs: (timer.secs % 60).toString().padStart(2, '0'),
      showTicker: !!(timer.secs % 2),
    });

    const hr = Math.floor(timer.secs / 60)
      .toString()
      .padStart(2, '0');
    const mins = (timer.secs % 60).toString().padStart(2, '0');
    const showDivider = timer.secs % 2 ? 'hidden' : '';

    elements.spanMins.innerText = hr;
    elements.spanSecs.innerText = mins;
    elements.spanTicker.className = showDivider;

    document.title = `Pomodoro [${hr}${showDivider ? ':' : ' '}${mins}]`;
  }, 1000);

  updateButtonVisibilities('start');
}

window.onload = () => {
  /* Cache all HTML elements */
  elements.containerNotif = document.getElementById('container-notif');

  elements.labelNotifAsk = document.getElementById('label-notif-ask');
  elements.labelNotifError = document.getElementById('label-notif-error');

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
  elements.settingInputAlarmRepeat =
    document.getElementById('input-alarm-repeat');

  elements.settingCheckboxAutoStartBreaks = document.getElementById(
    'checkbox-auto-start-breaks'
  );

  elements.settingCheckboxAutoStartPomos = document.getElementById(
    'checkbox-auto-start-pomos'
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

  elements.settingInputAlarmRepeat.value = settings.custom.alarmRepeatCount;

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

  notificationEvents.forEach(event => {
    const option = document.createElement('option');
    option.text = event;
    option.value = event;
    option.selected = event === settings.custom.notification.event;
    elements.settingDropdownNotifEvent.appendChild(option);
  });

  elements.settingCheckboxAutoStartBreaks.checked =
    settings.custom.autoStart.breaks;

  elements.settingCheckboxAutoStartPomos.checked =
    settings.custom.autoStart.pomos;

  elements.settingInputNotifTime.value =
    settings.custom.notification.timeInMins;

  // state.notification.supported = typeof Notification !== 'undefined';
  // if (!state.notification.supported)

  /* Set initial mode */
  setMode('pomo');

  /* checking for browser notification */
  console.log(
    'notif perm:',
    Notification.permission,
    ', supported:',
    typeof Notification !== 'undefined'
  );

  state.notificationSupported = typeof Notification !== 'undefined';
  if (state.notificationSupported) {
    if (Notification.permission === 'default') {
      elements.containerNotif.className = '';
      elements.labelNotifError.className = 'removed';
    } else if (Notification.permission === 'denied') {
      elements.containerNotif.className = '';
      elements.labelNotifAsk.className = 'removed';
      elements.labelNotifError.innerText = `Browser notification disabled.
Reminders won't be received`;
    }
  } else {
    elements.containerNotif.className = '';
    elements.labelNotifAsk.className = 'removed';
    elements.labelNotifError.value = `Browser does not supports notification.
Reminders won't be received`;

    alert(
      `Browser incompatibility:
Your browser does not support notifications.
Reminders won't be shown!`
    );
  }
};

function requestNotification() {
  console.log(
    'requestNotification called, currently:',
    Notification.permission
  );

  if (state.notificationSupported) {
    Notification.requestPermission().then(function (permission) {
      console.log('requestNotification:', { permission });
      if (permission === 'granted') {
        elements.containerNotif.className = 'removed';
      } else {
        elements.containerNotif.className = '';
        elements.labelNotifAsk.className = 'removed';
        elements.labelNotifError.className = '';
        elements.labelNotifError.innerText = `Browser notification disabled.
Reminders won't be received`;
        alert("Notification denied\nReminders won't be received!");
      }
    });
  }
}

function saveSetting() {
  const userSettings = {
    times: {
      pomo: +elements.settingInputPomoTime.value * 60,
      sbreak: +elements.settingInputSBreakTime.value * 60,
      lbreak: +elements.settingInputLBreakTime.value * 60,
    },
    autoStart: {
      breaks: elements.settingCheckboxAutoStartBreaks.checked,
      pomos: elements.settingCheckboxAutoStartPomos.checked,
    },
    alarmSound: elements.settingDropdownAlarmSounds.value,
    alarmRepeatCount: +elements.settingInputAlarmRepeat.value,
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
    settings.default.autoStart.breaks;
  elements.settingCheckboxAutoStartPomos.checked =
    settings.default.autoStart.pomos;
  elements.settingDropdownAlarmSounds.value = settings.default.alarmSound;
  elements.settingInputAlarmRepeat.value = settings.default.alarmRepeatCount;
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
  // console.log({ settings });
  // console.log(elements.checkboxAutoStartBreaks.checked);
  // ring(settings.default.alarmSound);

  // elements.labelNotifError.value = 'dsfdsf';
  // elements.containerNotif.className = 'removed';

  // console.log('will start...');
  // setTimeout(() => {
  showNotification();
  //   alert('notif shown');
  // }, 4000);
}

function showNotification() {
  if (document.visibilityState !== 'visible' && state.notification.permitted) {
    const notification = new Notification('Pomodoro', {
      body: 'Timer is up',
      icon: 'resources/images/pomo.png',
    });
    notification.onclick = function () {
      window.parent.focus();
      notification.close();
    };
  }
}

let audio;

function ring(soundName) {
  console.log('ring', { soundName });

  if (audio) audio.pause();
  audio = new Audio(`resources/audio/${soundName}`);
  audio.play();
}

window.onerror = (message, source, lineno, colno, error) =>
  alert(
    'Error occured:\n' +
      JSON.stringify({ message, source, lineno, colno, error }, null, 2)
  );
