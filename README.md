# Pomodoro App

A replica of the [Pomofocus](https://pomofocus.io/) application

## Technology Used

- HTML
- JavaScript
- CSS

---

### Features to implement

- [x] Store the settings using cookies / localStorage
- [x] Update report with counts
- [ ] Implement the feature of auto-starting breaks (short & long) & Pomodoros
- [ ] Implement Skip button functionality
- [x] Implement progress bar for timer
- [x] Should flash time '00:00' after timer expires for 5 secs (same time as it holds)
- [ ] Implement ticker sound
- [ ] Implement a way to detect if the settings changes are unsaved and show in a label
- [ ] Implement auto-save mechanism in the settings panel

### Bug Fixes

- [x] Timer going null after initial run
- [x] Title timer is not going away after timer finishes running
- [ ] Can submit settings form with any errors
- [x] Starts the timer with 1s less than specified
- [ ] Implement classList.toggle than classList.(add|remove) wherever suitable
- [x] Shows error when timer restarted after resetting

### Test Cases

- [ ] Check after inputting invalid setting values
- [x] Check how the notification info panel looks like in the new style scheme
