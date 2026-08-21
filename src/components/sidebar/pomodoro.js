import './pomodoro.css';

let timerInterval = null;
let timeLeft = 25 * 60; // 25 Minutes standard configuration state track
let isRunning = false;
let currentMode = 'focus'; // focus or break status flags

export function initPomodoroTimer() {
  console.log("⏱️ Pomodoro tracking widget mounted!");

  const minutesUI = document.getElementById('pomo-minutes');
  const secondsUI = document.getElementById('pomo-seconds');
  const statusUI = document.getElementById('pomo-status');
  const startBtn = document.getElementById('btn-pomo-start');
  const resetBtn = document.getElementById('btn-pomo-reset');

  if (!minutesUI || !secondsUI || !startBtn || !resetBtn) return;

  const updateDisplay = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    minutesUI.textContent = mins.toString().padStart(2, '0');
    secondsUI.textContent = secs.toString().padStart(2, '0');
  };

  const switchMode = () => {
    if (currentMode === 'focus') {
      currentMode = 'break';
      timeLeft = 5 * 60; // 5 minute standard brief recovery interval duration
      if (statusUI) statusUI.innerHTML = "🍃 Recovery Break";
      document.querySelector('.sidebar-pomodoro-panel').classList.add('mode-break');
    } else {
      currentMode = 'focus';
      timeLeft = 25 * 60;
      if (statusUI) statusUI.innerHTML = "⚡ Focus Session";
      document.querySelector('.sidebar-pomodoro-panel').classList.remove('mode-break');
    }
    updateDisplay();
  };

  startBtn.addEventListener('click', () => {
    if (window.Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        console.log(`🔔 Notification permissions state: ${permission}`);
      });
    }

    if (isRunning) {
      // Pause operation execution parameters
      clearInterval(timerInterval);
      isRunning = false;
      startBtn.innerHTML = "▶ Start";
    } else {
      isRunning = true;
      startBtn.innerHTML = "⏸ Pause";
      
      timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          isRunning = false;
          startBtn.innerHTML = "▶ Start";
          
          // Browser micro-haptic sound audio frequency alternative alert track trigger 🎯
          try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const osc = context.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, context.currentTime); // High pitch notification click frequency
            osc.connect(context.destination);
            osc.start();
            osc.stop(context.currentTime + 0.4);
          } catch (e) {
            console.log("AudioContext blocked or uninitialized");
          }

          if (window.Notification && Notification.permission === 'granted') {
            const title = currentMode === 'focus' ? "Focus Session Wrapped Up! 🎯" : "Break Completed! ⚡";
            const bodyMessage = currentMode === 'focus' 
              ? "Excellent work! Take a 5-minute breather to reset your brain." 
              : "Time to log back in! Your focus sprint is ready.";

            // Trigger the native OS platform pop-up banner component
            new Notification(title, {
              body: bodyMessage,
              icon: "https://flaticon.com" // Optional clean clock logo thumbnail vector
            });
          } else {
            // Safe fallback string modal if notifications are disabled or denied
            alert(currentMode === 'focus' ? "Session wrapped up! Time to grab a coffee." : "Break completed! Back to code loops.");
          }

          switchMode();
        }
      }, 1000);
    }
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    isRunning = false;
    currentMode = 'focus';
    timeLeft = 25 * 60;
    startBtn.innerHTML = "▶ Start";
    if (statusUI) statusUI.innerHTML = "⚡ Focus Session";
    document.querySelector('.sidebar-pomodoro-panel').classList.remove('mode-break');
    updateDisplay();
  });

  updateDisplay();
}
