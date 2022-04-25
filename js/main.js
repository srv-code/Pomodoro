const docTitleStaticPart = 'Pomodoro';

const modes = {
  pomo: 'pomo',
  sbreak: 'sbreak',
  lbreak: 'lbreak',
};

const state = {
  isTimerRunning: false,
  notificationSupported: null,
  selectedMode: null,
  stopFlashingTime: null,
  rounds: {
    pomo: 0,
    sbreak: 0,
    lbreak: 0,
  },
};

const elements = {
  containerNotifWarning: null,
  labelNotifAsk: null,
  labelNotifError: null,
  spanMins: null,
  spanSecs: null,
  spanTicker: null,
  trTimeComponents: null,
  progressTimer: null,
  timerStartButton: null,
  timerPauseButton: null,
  timerResumeButton: null,
  timerResetButton: null,
  timerSkipButton: null,
  imageRingAlarm: null,
  imageRingTick: null,
  headerPomo: null,
  headerSBreak: null,
  headerLBreak: null,
  spanPomoRoundCounter: null,
  spanSBreakRoundCounter: null,
  spanLBreakRoundCounter: null,
  settingInputPomoTime: null,
  settingInputSBreakTime: null,
  settingInputLBreakTime: null,
  settingInputNotifTime: null,
  settingInputAlarmRepeat: null,
  settingCheckboxAutoStartBreaks: null,
  settingCheckboxAutoStartPomos: null,
  settingDropdownAlarmSounds: null,
  settingDropdownTickingSounds: null,
  settingDropdownNotifEvent: null,
};

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
  tickers: ['None', 'Clock Ticking.wav'],
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
      test: 3, // TODO: Remove this, for testing purpose only}
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

function reportInternalError(e) {
  console.error('Internal Error:', e);
  alert('Internal Error Occurred!\nError: ' + e.message);
  throw e;
}

function updateTimer(reset) {
  timer.mode = reset ? null : state.selectedMode;
  timer.secs = reset ? null : settings.custom.times.test; // TODO: Remove this, for testing purpose only
  // timer.secs =  reset ? null :settings.custom.times[mode]; // TODO: Enable this

  elements.progressTimer.value = timer.secs ?? 0;
  elements.progressTimer.max = timer.secs ?? 0;

  elements.spanMins.innerText = Math.floor((timer.secs ?? 0) / 60)
    .toString()
    .padStart(2, '0');
  elements.spanSecs.innerText = ((timer.secs ?? 0) % 60)
    .toString()
    .padStart(2, '0');
  elements.spanTicker.classList.remove('hidden');
}

function setMode(mode) {
  console.log('setMode', { mode, sameMode: mode === state.selectedMode });

  if (mode in modes) {
    if (mode === state.selectedMode) return;
    else {
      if (state.isTimerRunning) {
        if (confirm('Timer is currently running.\nSure to stop it?')) {
          resetTimer();
        } else return;
      }
    }

    state.stopFlashingTime?.();

    state.selectedMode = mode;

    updateTimer();

    [
      { mode: 'pomo', element: elements.headerPomo },
      { mode: 'sbreak', element: elements.headerSBreak },
      { mode: 'lbreak', element: elements.headerLBreak },
    ].forEach(x => {
      if (mode === x.mode) x.element.classList.add('highlighted-mode');
      else x.element.classList.remove('highlighted-mode');
    });

    updateButtonVisibilities('reset');
  } else throw new Error('Invalid mode: ' + mode);
}

function updateButtonVisibilities(state) {
  switch (state) {
    // case 'hide-all':
    //   elements.timerPauseButton.classList.add('removed');
    //   elements.timerResetButton.classList.add('removed');
    //   elements.timerStartButton.classList.add('removed');
    //   elements.timerResumeButton.classList.add('removed');
    //   break;

    case 'start':
      elements.timerPauseButton.classList.remove('removed');
      elements.timerResetButton.classList.remove('removed');
      elements.timerStartButton.classList.add('removed');
      elements.timerResumeButton.classList.add('removed');
      break;

    case 'pause':
      elements.timerPauseButton.classList.add('removed');
      elements.timerResetButton.classList.remove('removed');
      elements.timerStartButton.classList.add('removed');
      elements.timerResumeButton.classList.remove('removed');
      break;

    case 'resume':
      elements.timerPauseButton.classList.remove('removed');
      elements.timerResetButton.classList.remove('removed');
      elements.timerStartButton.classList.add('removed');
      elements.timerResumeButton.classList.add('removed');
      break;

    case 'reset':
      elements.timerPauseButton.classList.add('removed');
      elements.timerResetButton.classList.add('removed');
      elements.timerStartButton.classList.remove('removed');
      elements.timerResumeButton.classList.add('removed');
      break;

    default:
      throw new Error('Invalid state: ' + state);
  }
}

function clearTimer({
  reset = false,
  flashTime = false,
  flashTimeIndefinitely = false,
  notify = false,
} = {}) {
  state.isTimerRunning = false;

  return new Promise(function (resolve, reject) {
    try {
      clearInterval(timer.tick);
      timer.tick = null;

      if (reset) updateTimer(true);

      elements.spanTicker.classList.remove('hidden');

      if (notify) {
        showNotification();
        ring(settings.custom.alarmSound, settings.custom.alarmRepeatCount);
      }

      if (flashTime) {
        if (reset) document.title = docTitleStaticPart + ' [FINISHED]';

        let count = 0,
          docTitle = [document.title, docTitleStaticPart],
          flashTimer;
        state.stopFlashingTime = function () {
          elements.timerPauseButton.disabled = false;
          elements.timerResetButton.disabled = false;
          elements.timerSkipButton.disabled = false;
          elements.trTimeComponents.classList.remove('hidden');

          clearInterval(flashTimer);
          resolve(null);
        };

        if (!flashTimeIndefinitely) {
          elements.timerPauseButton.disabled = true;
          elements.timerResetButton.disabled = true;
          elements.timerSkipButton.disabled = true;
        }

        flashTimer = setInterval(function () {
          count++;

          elements.trTimeComponents.classList.toggle('hidden');
          document.title = docTitle[count % 2];

          if (!flashTimeIndefinitely) {
            if (count === 10) {
              document.title = docTitleStaticPart;
              state.stopFlashingTime();
            }
          }
        }, 500);
      } else resolve(null);
    } catch (e) {
      reject(e);
    }
  });
}

function pauseTimer() {
  updateButtonVisibilities('pause');
  document.title = docTitleStaticPart + ' [PAUSED]';

  clearTimer({ flashTime: true, flashTimeIndefinitely: true }).catch(
    reportInternalError
  );
}

function resumeTimer() {
  updateButtonVisibilities('resume');

  console.log(
    'stopping flasher',
    state.stopFlashingTime,
    typeof state.stopFlashingTime
  );
  state.stopFlashingTime();

  const mode = state.selectedMode;
  startTimer()
    .then(function () {
      cleanupAfterTimerStops(true, mode);
      updateTimer();
    })
    .catch(reportInternalError);
}

function resetTimer() {
  clearTimer({ reset: true })
    .then(function () {
      state.stopFlashingTime?.();
      cleanupAfterTimerStops();
      updateTimer();
    })
    .catch(reportInternalError);
}

function startTimer() {
  state.isTimerRunning = true;

  return new Promise(function (resolve, reject) {
    timer.tick = setInterval(function () {
      try {
        if (timer.secs === null || timer.secs === undefined)
          throw new Error('Invalid timer.secs: ' + timer.secs);

        elements.progressTimer.value = timer.secs;

        if (timer.secs === 0) {
          clearTimer({ reset: true, notify: true, flashTime: true })
            .then(function () {
              resolve(null);
              // document.title = docTitleStaticPart;
              // updateButtonVisibilities('reset');
            })
            .catch(reportInternalError);
        } else if (timer.secs < 0) throw new Error('Invalid timer.secs: ' + timer.secs);

        console.log('time:', {
          mins: Math.floor(timer.secs / 60)
            .toString()
            .padStart(2, '0'),
          secs: (timer.secs % 60).toString().padStart(2, '0'),
          showTicker: timer.secs % 2 !== 0,
        });

        const hr = Math.floor(timer.secs / 60)
          .toString()
          .padStart(2, '0');
        const mins = (timer.secs % 60).toString().padStart(2, '0');
        const showDivider = timer.secs % 2 === 0;

        elements.spanMins.innerText = hr;
        elements.spanSecs.innerText = mins;
        if (showDivider) elements.spanTicker.classList.remove('hidden');
        else elements.spanTicker.classList.add('hidden');

        document.title = `Pomodoro - ${hr}${showDivider ? ':' : ' '}${mins}`;

        timer.secs -= 1;
      } catch (e) {
        state.isTimerRunning = false;
        clearInterval(timer.tick);
        reject(e);
      }
    }, 1000);
  });

  // updateButtonVisibilities('start');
}

function skipRound() {}

function initializeTimer() {
  console.log({ timer });

  updateButtonVisibilities('start');

  const mode = state.selectedMode;
  startTimer()
    .then(function () {
      cleanupAfterTimerStops(true, mode);
      updateTimer();
    })
    .catch(reportInternalError);
}

function updateRoundCounters() {
  elements.spanPomoRoundCounter.innerText = state.rounds[modes.pomo];
  elements.spanSBreakRoundCounter.innerText = state.rounds[modes.sbreak];
  elements.spanLBreakRoundCounter.innerText = state.rounds[modes.lbreak];
}

function cleanupAfterTimerStops(
  shouldUpdateRounds = false,
  modeToUpdate = null
) {
  console.log('cleanupAfterTimerStops', {
    shouldUpdateRounds,
    modeToUpdate,
    selectedMode: state.selectedMode,
  });

  updateButtonVisibilities('reset');

  document.title = docTitleStaticPart;

  if (shouldUpdateRounds) {
    state.rounds[modeToUpdate]++;
    updateRoundCounters();
    setMode(state.selectedMode);

    // setTimeout(function () {
    //   setMode(state.selectedMode);
    // }, 5000);
  }
}

window.onload = function () {
  /* Cache all HTML elements */
  elements.containerNotifWarning = document.getElementById(
    'container-notif-warning'
  );

  elements.labelNotifAsk = document.getElementById('label-notif-ask');
  elements.labelNotifError = document.getElementById('label-notif-error');

  elements.spanMins = document.getElementById('span-timer-mins');
  elements.spanSecs = document.getElementById('span-timer-secs');
  elements.spanTicker = document.getElementById('span-timer-ticker');

  elements.trTimeComponents = document.getElementById('tr-time-components');

  elements.progressTimer = document.getElementById('progress-timer');

  elements.timerStartButton = document.getElementById('button-timer-start');
  elements.timerPauseButton = document.getElementById('button-timer-pause');
  elements.timerResumeButton = document.getElementById('button-timer-resume');
  elements.timerResetButton = document.getElementById('button-timer-reset');
  elements.timerSkipButton = document.getElementById('button-skip-round');

  elements.imageRingAlarm = document.getElementById('img-ring-alarm');
  elements.imageRingTick = document.getElementById('img-ring-tick');
  if (alarmSounds.tickers[0] === 'None')
    elements.imageRingTick.classList.add('removed');

  elements.headerPomo = document.getElementById('span-mode-pomo');
  elements.headerSBreak = document.getElementById('span-mode-sbreak');
  elements.headerLBreak = document.getElementById('span-mode-lbreak');

  elements.spanPomoRoundCounter = document.getElementById('span-pomo-rounds');
  elements.spanSBreakRoundCounter =
    document.getElementById('span-sbreak-rounds');
  elements.spanLBreakRoundCounter =
    document.getElementById('span-lbreak-rounds');

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

  updateRoundCounters();

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
  setMode(modes.pomo);

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
      elements.containerNotifWarning.classList.remove('removed');
      elements.labelNotifError.classList.add('removed');
    } else if (Notification.permission === 'denied') {
      elements.containerNotifWarning.classList.remove('removed');
      elements.labelNotifAsk.classList.add('removed');
      elements.labelNotifError.innerText = `Browser notification disabled
Reminders won't be received!`;
    }
    // else if (Notification.permission === 'granted')
    //   elements.containerNotifWarning.classList.add('removed');
  } else {
    elements.containerNotifWarning.classList.remove('removed');
    elements.labelNotifAsk.classList.add('removed');
    elements.labelNotifError.innerText = `Browser does not supports notification
Reminders won't be received!`;

    //     alert(
    //       `Browser incompatibility:
    // Your browser does not support notifications.
    // Reminders won't be shown!`
    //     );
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
      if (permission === 'granted')
        elements.containerNotifWarning.classList.add('removed');
      else {
        elements.containerNotifWarning.classList.remove('removed');
        elements.labelNotifAsk.classList.add('removed');
        elements.labelNotifError.classList.remove('removed');
        elements.labelNotifError.innerText = `Browser notification disabled
Reminders won't be received!`;
        // alert("Notification denied\nReminders won't be received!");
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
  // ring(settings.default.alarmSound, 3);
  // elements.labelNotifError.value = 'dsfdsf';
  // elements.containerNotif.className = 'removed';
  // console.log('will start...');
  // setTimeout(() => {
  // showNotification();
  //   alert('notif shown');
  // }, 4000);

  // function waiter({ after = null }) {
  //   console.log('starting...');

  //   setTimeout(function () {
  //     console.log('done');
  //     if (after) after();
  //     return;
  //   }, 2000);

  //   console.log('ending...');
  // }

  // waiter({
  //   after: function () {
  //     console.log('timer finished');
  //   },
  // });

  //   function waiter1(n) {
  //     return new Promise(function (resolve, reject) {
  //       if (n === 22) reject(new Error('custom outside'));

  //       try {
  //         if (n === 21) throw new Error('custom outside');
  //       } catch (e) {
  //         reject(e);
  //       }

  //       console.log('starting...');
  //       setTimeout(function () {
  //         if (n === 23) throw new Error('custom inside before');

  //         try {
  //           if (n === 20) throw new Error('custom inside');
  //           if (n === 27) reject(new Error('custom inside'));

  //           console.log('timer finished');
  //           resolve(67);
  //         } catch (e) {
  //           reject(e);
  //         }
  //       }, 2000);

  //       console.log('ending...');
  //     });
  //   }

  //   waiter1(27)
  //     .then(function (retval) {
  //       console.log('promise resolved', { retval });
  //     })
  //     .catch(function (error) {
  //       console.log('promise rejected', { error });
  //     });
  // }
  console.log('test', { timer, state });
}

function showNotification() {
  if (
    document.visibilityState !== 'visible' &&
    state.notificationSupported &&
    Notification.permission === 'granted'
  ) {
    const notification = new Notification(docTitleStaticPart, {
      body: 'Timer is up',
      icon: 'resources/images/pomo.png',
    });
    notification.onclick = function () {
      window.parent.focus();
      notification.close();
    };
  }
}

function onSpeakerClick(id) {
  console.log('onSpeakerClick:', { id });

  switch (id) {
    case 'img-ring-alarm':
      ring(elements.settingDropdownAlarmSounds.value, 1);
      break;

    case 'img-ring-tick':
      ring(elements.settingDropdownTickingSounds.value, 1);
      break;

    default:
      throw new Error('Unrecognized image ID: ' + id);
  }
}

function onTickSoundValueChange(soundName) {
  console.log('onTickSoundValueChange', { value: soundName });

  if (soundName === alarmSounds.tickers[0]) {
    audio?.pause();
    elements.imageRingTick.classList.add('removed');
  } else {
    elements.imageRingTick.classList.remove('removed');
    ring(soundName, 1);
  }
}

let audio;

function ring(soundName, repeatCount) {
  console.log('ring', { soundName, repeatCount });

  if (audio) audio.pause();
  audio = new Audio(`resources/audio/${soundName}`);
  audio.play();

  if (repeatCount > 1) {
    let playCount = 1;
    audio.onended = function () {
      if (playCount < repeatCount) {
        setTimeout(function () {
          audio.play();
          playCount++;
        }, 500);
      }
    };
  }
}

window.onerror = (message, source, lineno, colno, error) =>
  alert(
    'Error occured:\n' +
      JSON.stringify({ message, source, lineno, colno, error }, null, 2)
  );
