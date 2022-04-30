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
  settingsTargets: {
    unsaved: {},
    error: {},
  },
  settingsSuccessTimer: null,
};

const elements = {
  containerNotifWarning: null,
  containerSettingMessage: null,

  labelNotifAsk: null,
  labelNotifError: null,

  spanMins: null,
  spanSecs: null,
  spanTicker: null,
  spanPomoRoundCounter: null,
  spanSBreakRoundCounter: null,
  spanLBreakRoundCounter: null,

  trTimeComponents: null,
  trSettingsMessage: null,

  progressTimer: null,

  buttonTimerStart: null,
  buttonTimerPause: null,
  buttonTimerResume: null,
  buttonTimerReset: null,
  buttonTimerSkip: null,
  buttonSettingSave: null,

  imageRingAlarm: null,
  imageRingTick: null,
  imageSettingsMessage: null,

  headerPomo: null,
  headerSBreak: null,
  headerLBreak: null,

  inputSettingPomoTime: null,
  inputSettingSBreakTime: null,
  inputSettingLBreakTime: null,
  inputSettingNotifTime: null,
  inputSettingAlarmRepeat: null,

  checkboxSettingAutoStartBreaks: null,
  checkboxSettingAutoStartPomos: null,

  dropdownSettingAlarmSounds: null,
  dropdownSettingTickingSounds: null,
  dropdownSettingNotifEvent: null,
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

function updateSettingsMessage({
  hide = false,
  doneSaving = false,
  doneResetting = false,
  isSaving = false,
  isInvalid = false,
  isUnsaved = false,
}) {
  console.log('updateSettingsMessage', {
    hide,
    doneSaving,
    doneResetting,
    isSaving,
    isInvalid,
    isUnsaved,
  });

  function doHide() {
    resetClasses();
    elements.containerSettingMessage.classList.add('hidden');
    elements.buttonSettingSave.disabled = true;
  }

  function resetClasses() {
    elements.containerSettingMessage.classList.remove('hidden');
    elements.containerSettingMessage.classList.remove('settings-error-message');
    elements.containerSettingMessage.classList.remove('settings-saved-message');

    elements.trSettingsMessage.classList.remove('settings-saved-message');
    elements.trSettingsMessage.classList.remove('settings-error-message');
  }

  if (hide) doHide();
  else if (isSaving) {
    if (isInvalid || isUnsaved) {
      if (state.settingsSuccessTimer) {
        clearInterval(state.settivlvangsSuccessTimer);
        state.settingsSuccessTimer = null;
      }

      resetClasses();
      elements.containerSettingMessage.classList.add('settings-error-message');

      elements.trSettingsMessage.classList.add('settings-error-message');

      if (isInvalid) {
        elements.trSettingsMessage.innerText = 'Settings are invalid';
        elements.imageSettingsMessage.src = '../resources/images/cross.png';
      } else {
        elements.trSettingsMessage.innerText = 'Settings are unsaved';
        elements.imageSettingsMessage.src = '../resources/images/warn.png';
      }

      elements.buttonSettingSave.disabled = !isUnsaved || isInvalid;
    } else doHide();
  } else if (doneSaving || doneResetting) {
    resetClasses();
    elements.containerSettingMessage.classList.add('settings-saved-message');

    elements.trSettingsMessage.classList.add('settings-saved-message');
    elements.trSettingsMessage.innerText = `Settings are ${
      doneSaving ? 'saved' : 'reset'
    }`;

    elements.imageSettingsMessage.src = '../resources/images/tick.png';

    elements.buttonSettingSave.disabled = true;

    state.settingsSuccessTimer = setTimeout(doHide, 2000);
  }
}

function onSettingFieldUpdate(target) {
  console.log('onSettingFieldUpdate:', {
    target,
    id: target.id,
    value: target.value,
    checked: target.checked,
  });

  function validateInput(hasError, previousValue, currentValue, target) {
    console.log('validateInput', {
      hasError,
      previousValue,
      typeOfPreviousValue: typeof previousValue,
      currentValue,
      typeOfCurrentValue: typeof currentValue,
      target,
    });

    if (hasError) {
      target.classList.add('input-error');
      elements.buttonSettingSave.disabled = true;
      state.settingsTargets.error[target.id] = target;
    } else {
      target.classList.remove('input-error');
      delete state.settingsTargets.error[target.id];

      if (previousValue === currentValue)
        delete state.settingsTargets.unsaved[target.id];
      else state.settingsTargets.unsaved[target.id] = target;
    }

    updateSettingsMessage({
      isSaving: true,
      isInvalid: Object.keys(state.settingsTargets.error).length !== 0,
      isUnsaved: Object.keys(state.settingsTargets.unsaved).length !== 0,
    });
  }

  switch (target) {
    case elements.inputSettingPomoTime:
    case elements.inputSettingSBreakTime:
    case elements.inputSettingLBreakTime:
      validateInput(
        !target.value || target.value < 1 || target.value > 60,
        settings.custom.times[
          target === elements.inputSettingPomoTime
            ? 'pomo'
            : target === elements.inputSettingSBreakTime
            ? 'sbreak'
            : 'lbreak'
        ],
        target.value * 60,
        target
      );
      break;

    case elements.inputSettingAlarmRepeat:
      validateInput(
        !target.value || target.value < 1 || target.value > 10,
        settings.custom.alarmRepeatCount,
        target.value,
        target
      );
      break;

    case elements.inputSettingNotifTime:
      validateInput(
        !target.value || target.value < 1 || target.value > 60,
        settings.custom.notification.timeInMins,
        target.value,
        target
      );
      break;

    case elements.checkboxSettingAutoStartBreaks:
    case elements.checkboxSettingAutoStartPomos:
      validateInput(
        false,
        settings.custom.autoStart[
          target === elements.checkboxSettingAutoStartBreaks
            ? 'breaks'
            : 'pomos'
        ],
        target.checked,
        target
      );
      break;

    case elements.dropdownSettingAlarmSounds:
      validateInput(false, settings.custom.alarmSound, target.value, target);
      ring(target.value, 1);
      break;

    case elements.dropdownSettingTickingSounds:
      validateInput(false, settings.custom.tickingSound, target.value, target);
      if (target.value === alarmSounds.tickers[0]) {
        audio?.pause();
        elements.imageRingTick.classList.add('removed');
      } else {
        elements.imageRingTick.classList.remove('removed');
        ring(target.value, 1);
      }
      break;

    case elements.dropdownSettingNotifEvent:
      validateInput(
        false,
        settings.custom.notification.event,
        target.value,
        target
      );
      break;

    default:
      throw new Error('Unknown target selected: ' + target.id);
  }
}

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
      elements.buttonTimerPause.classList.remove('removed');
      elements.buttonTimerReset.classList.remove('removed');
      elements.buttonTimerStart.classList.add('removed');
      elements.buttonTimerResume.classList.add('removed');
      break;

    case 'pause':
      elements.buttonTimerPause.classList.add('removed');
      elements.buttonTimerReset.classList.remove('removed');
      elements.buttonTimerStart.classList.add('removed');
      elements.buttonTimerResume.classList.remove('removed');
      break;

    case 'resume':
      elements.buttonTimerPause.classList.remove('removed');
      elements.buttonTimerReset.classList.remove('removed');
      elements.buttonTimerStart.classList.add('removed');
      elements.buttonTimerResume.classList.add('removed');
      break;

    case 'reset':
      elements.buttonTimerPause.classList.add('removed');
      elements.buttonTimerReset.classList.add('removed');
      elements.buttonTimerStart.classList.remove('removed');
      elements.buttonTimerResume.classList.add('removed');
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
          elements.buttonTimerPause.disabled = false;
          elements.buttonTimerReset.disabled = false;
          elements.buttonTimerSkip.disabled = false;
          elements.trTimeComponents.classList.remove('hidden');

          clearInterval(flashTimer);
          resolve(null);
        };

        if (!flashTimeIndefinitely) {
          elements.buttonTimerPause.disabled = true;
          elements.buttonTimerReset.disabled = true;
          elements.buttonTimerSkip.disabled = true;
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

  elements.buttonTimerStart = document.getElementById('button-timer-start');
  elements.buttonTimerPause = document.getElementById('button-timer-pause');
  elements.buttonTimerResume = document.getElementById('button-timer-resume');
  elements.buttonTimerReset = document.getElementById('button-timer-reset');
  elements.buttonTimerSkip = document.getElementById('button-skip-round');
  elements.buttonSettingSave = document.getElementById('button-setting-save');

  elements.imageRingAlarm = document.getElementById('img-ring-alarm');
  elements.imageRingTick = document.getElementById('img-ring-tick');

  elements.headerPomo = document.getElementById('span-mode-pomo');
  elements.headerSBreak = document.getElementById('span-mode-sbreak');
  elements.headerLBreak = document.getElementById('span-mode-lbreak');

  elements.spanPomoRoundCounter = document.getElementById('span-pomo-rounds');
  elements.spanSBreakRoundCounter =
    document.getElementById('span-sbreak-rounds');
  elements.spanLBreakRoundCounter =
    document.getElementById('span-lbreak-rounds');

  elements.containerSettingMessage = document.getElementById(
    'container-settings-message'
  );

  elements.inputSettingPomoTime = document.getElementById(
    'input-setting-pomo-time'
  );
  elements.inputSettingSBreakTime = document.getElementById(
    'input-setting-sbreak-time'
  );
  elements.inputSettingLBreakTime = document.getElementById(
    'input-setting-lbreak-time'
  );
  elements.inputSettingNotifTime = document.getElementById(
    'input-setting-notif-time'
  );
  elements.inputSettingAlarmRepeat =
    document.getElementById('input-alarm-repeat');
  elements.trSettingsMessage = document.getElementById('settings-messsage');
  elements.imageSettingsMessage = document.getElementById(
    'image-settings-message'
  );

  elements.checkboxSettingAutoStartBreaks = document.getElementById(
    'checkbox-auto-start-breaks'
  );

  elements.checkboxSettingAutoStartPomos = document.getElementById(
    'checkbox-auto-start-pomos'
  );

  elements.dropdownSettingAlarmSounds = document.getElementById(
    'select-alarm-sounds'
  );
  elements.dropdownSettingTickingSounds = document.getElementById(
    'select-ticking-sounds'
  );
  elements.dropdownSettingNotifEvent =
    document.getElementById('select-notif-event');

  /* loads & sets custom settings */
  settings.custom =
    JSON.parse(localStorage.getItem(settings.storageKey)) ||
    structuredClone(settings.default);

  /* Load values in all HTML elements */
  elements.inputSettingPomoTime.value = Math.floor(
    settings.custom.times.pomo / 60
  );
  elements.inputSettingSBreakTime.value = Math.floor(
    settings.custom.times.sbreak / 60
  );
  elements.inputSettingLBreakTime.value = Math.floor(
    settings.custom.times.lbreak / 60
  );

  updateRoundCounters();

  alarmSounds.pomo.forEach(soundName => {
    const option = document.createElement('option');
    option.text = soundName.substring(0, soundName.lastIndexOf('.'));
    option.value = soundName;
    option.selected = soundName === settings.custom.alarmSound;
    elements.dropdownSettingAlarmSounds.appendChild(option);
  });

  elements.inputSettingAlarmRepeat.value = settings.custom.alarmRepeatCount;

  alarmSounds.tickers.forEach(soundName => {
    const option = document.createElement('option');
    option.text = soundName.substring(
      0,
      soundName === 'None' ? undefined : soundName.lastIndexOf('.')
    );
    option.value = soundName;
    option.selected = soundName === settings.custom.tickingSound;
    elements.dropdownSettingTickingSounds.appendChild(option);
  });

  if (settings.custom.tickingSound === 'None')
    elements.imageRingTick.classList.add('removed');
  else elements.imageRingTick.classList.remove('removed');

  notificationEvents.forEach(event => {
    const option = document.createElement('option');
    option.text = event;
    option.value = event;
    option.selected = event === settings.custom.notification.event;
    elements.dropdownSettingNotifEvent.appendChild(option);
  });

  elements.checkboxSettingAutoStartBreaks.checked =
    settings.custom.autoStart.breaks;

  elements.checkboxSettingAutoStartPomos.checked =
    settings.custom.autoStart.pomos;

  elements.inputSettingNotifTime.value =
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
      pomo: +elements.inputSettingPomoTime.value * 60,
      sbreak: +elements.inputSettingSBreakTime.value * 60,
      lbreak: +elements.inputSettingLBreakTime.value * 60,
    },
    autoStart: {
      breaks: elements.checkboxSettingAutoStartBreaks.checked,
      pomos: elements.checkboxSettingAutoStartPomos.checked,
    },
    alarmSound: elements.dropdownSettingAlarmSounds.value,
    alarmRepeatCount: +elements.inputSettingAlarmRepeat.value,
    tickingSound: elements.dropdownSettingTickingSounds.value,
    notification: {
      event: elements.dropdownSettingNotifEvent.value,
      timeInMins: elements.inputSettingNotifTime.value,
    },
  };

  settings.custom = userSettings;
  localStorage.setItem(settings.storageKey, JSON.stringify(userSettings));

  updateSettingsMessage({ doneSaving: true });
  console.log({ settings });
}

function resetSetting() {
  elements.inputSettingPomoTime.value = Math.floor(
    settings.default.times.pomo / 60
  );
  elements.inputSettingSBreakTime.value = Math.floor(
    settings.default.times.sbreak / 60
  );
  elements.inputSettingLBreakTime.value = Math.floor(
    settings.default.times.lbreak / 60
  );
  elements.checkboxSettingAutoStartBreaks.checked =
    settings.default.autoStart.breaks;
  elements.checkboxSettingAutoStartPomos.checked =
    settings.default.autoStart.pomos;
  elements.dropdownSettingAlarmSounds.value = settings.default.alarmSound;
  elements.inputSettingAlarmRepeat.value = settings.default.alarmRepeatCount;
  elements.dropdownSettingTickingSounds.value = settings.default.tickingSound;
  elements.dropdownSettingNotifEvent.value =
    settings.default.notification.event;
  elements.inputSettingNotifTime.value =
    settings.default.notification.timeInMins;

  localStorage.clear();

  settings.custom = structuredClone(settings.default);

  if (settings.custom.tickingSound === 'None')
    elements.imageRingTick.classList.add('removed');
  else elements.imageRingTick.classList.remove('removed');

  updateSettingsMessage({ doneResetting: true });
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

  updateSettingsMessage({ doneSaving: true });

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

function onSpeakerClick(target) {
  switch (target) {
    case elements.imageRingAlarm:
      ring(elements.dropdownSettingAlarmSounds.value, 1);
      break;

    case elements.imageRingTick:
      ring(elements.dropdownSettingTickingSounds.value, 1);
      break;

    default:
      throw new Error('Unknown target selected: ' + target.id);
  }
}

// function onTickSoundValueChange(soundName) {
//   console.log('onTickSoundValueChange', { value: soundName });

//   if (soundName === alarmSounds.tickers[0]) {
//     audio?.pause();
//     elements.imageRingTick.classList.add('removed');
//   } else {
//     elements.imageRingTick.classList.remove('removed');
//     ring(soundName, 1);
//   }
// }

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

window.onerror = function (message, source, lineno, colno, error) {
  alert(
    'Error occured:\n' +
      JSON.stringify({ message, source, lineno, colno, error }, null, 2)
  );
};
