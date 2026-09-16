/**
 * Live Clock, Date Shower, Rest Interval Timer & Stopwatch
 */

class ClockTimerManager {
  constructor() {
    this.is24Hour = false;
    
    // Rest Timer state
    this.restDuration = 90; // default 90 seconds
    this.restRemaining = 90;
    this.restIntervalId = null;
    this.isRestRunning = false;
    
    // Stopwatch state
    this.stopwatchStartTime = 0;
    this.stopwatchElapsed = 0;
    this.stopwatchIntervalId = null;
    this.isStopwatchRunning = false;
    this.stopwatchLaps = [];

    this.audioContext = null;
  }

  init() {
    this.startClock();
    this.renderRestTimerDisplay();
    this.renderStopwatchDisplay();
  }

  // --- AUDIO BEEP (Web Audio API) ---
  playBeep(frequency = 880, duration = 0.25, type = 'sine') {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.start();
      osc.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.warn("Audio playback not allowed or not supported yet:", e);
    }
  }

  playCompletionChime() {
    // 3 successive melodic chimes
    setTimeout(() => this.playBeep(523.25, 0.2), 0);   // C5
    setTimeout(() => this.playBeep(659.25, 0.2), 180); // E5
    setTimeout(() => this.playBeep(783.99, 0.4), 360); // G5
  }

  // --- LIVE CLOCK & DATE ---
  startClock() {
    const update = () => {
      const now = new Date();
      
      // Time format
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      let ampm = '';

      if (!this.is24Hour) {
        ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
      }
      const formattedHours = String(hours).padStart(2, '0');
      const timeStr = `${formattedHours}:${minutes}:${seconds} ${ampm}`.trim();

      // Date format
      const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      const dateStr = now.toLocaleDateString(undefined, options);

      // Update in header widget
      const headerClock = document.getElementById('header-live-clock');
      const headerDate = document.getElementById('header-live-date');
      if (headerClock) headerClock.textContent = timeStr;
      if (headerDate) headerDate.textContent = dateStr;

      // Update in dedicated Timer view
      const viewClock = document.getElementById('timer-view-clock');
      const viewDate = document.getElementById('timer-view-date');
      if (viewClock) viewClock.textContent = timeStr;
      if (viewDate) viewDate.textContent = dateStr;
    };

    update();
    setInterval(update, 1000);
  }

  toggleTimeFormat() {
    this.is24Hour = !this.is24Hour;
    const btn = document.getElementById('clock-format-toggle');
    if (btn) btn.textContent = this.is24Hour ? '24H' : '12H';
  }

  // --- REST TIMER ---
  setRestDuration(seconds) {
    this.pauseRestTimer();
    this.restDuration = seconds;
    this.restRemaining = seconds;
    this.renderRestTimerDisplay();
  }

  startRestTimer(customSeconds = null) {
    if (customSeconds !== null) {
      this.restDuration = customSeconds;
      this.restRemaining = customSeconds;
    }
    
    if (this.isRestRunning) return;
    this.isRestRunning = true;
    this.renderRestTimerDisplay();

    this.restIntervalId = setInterval(() => {
      if (this.restRemaining > 0) {
        this.restRemaining--;
        this.renderRestTimerDisplay();
        
        if (this.restRemaining <= 3 && this.restRemaining > 0) {
          this.playBeep(440, 0.1); // subtle beep warning
        }
      } else {
        this.pauseRestTimer();
        this.playCompletionChime();
        this.flashRestTimerComplete();
      }
    }, 1000);
  }

  pauseRestTimer() {
    if (this.restIntervalId) {
      clearInterval(this.restIntervalId);
      this.restIntervalId = null;
    }
    this.isRestRunning = false;
    this.renderRestTimerDisplay();
  }

  resetRestTimer() {
    this.pauseRestTimer();
    this.restRemaining = this.restDuration;
    this.renderRestTimerDisplay();
  }

  adjustRestTimer(deltaSeconds) {
    this.restRemaining = Math.max(0, this.restRemaining + deltaSeconds);
    if (this.restRemaining > this.restDuration) {
      this.restDuration = this.restRemaining;
    }
    this.renderRestTimerDisplay();
  }

  renderRestTimerDisplay() {
    const minutes = Math.floor(this.restRemaining / 60);
    const seconds = this.restRemaining % 60;
    const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Target elements in page
    const timerDisplay = document.getElementById('rest-timer-display');
    const headerRestSnippet = document.getElementById('header-rest-snippet');
    const restStartPauseBtn = document.getElementById('rest-start-pause-btn');
    const progressBar = document.getElementById('rest-timer-progress');

    if (timerDisplay) timerDisplay.textContent = timeFormatted;
    if (headerRestSnippet) {
      headerRestSnippet.textContent = timeFormatted;
      if (this.isRestRunning) {
        headerRestSnippet.classList.add('text-orange-500', 'font-bold');
      } else {
        headerRestSnippet.classList.remove('text-orange-500', 'font-bold');
      }
    }

    if (restStartPauseBtn) {
      restStartPauseBtn.innerHTML = this.isRestRunning 
        ? `<svg class="w-5 h-5 inline mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg> Pause`
        : `<svg class="w-5 h-5 inline mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg> Start`;
    }

    if (progressBar && this.restDuration > 0) {
      const pct = Math.max(0, Math.min(100, (this.restRemaining / this.restDuration) * 100));
      progressBar.style.width = `${pct}%`;
    }
  }

  flashRestTimerComplete() {
    const el = document.getElementById('rest-timer-display');
    if (!el) return;
    el.classList.add('text-red-500', 'animate-bounce');
    setTimeout(() => {
      el.classList.remove('text-red-500', 'animate-bounce');
    }, 4000);
  }

  // --- STOPWATCH ---
  startStopwatch() {
    if (this.isStopwatchRunning) return;
    this.isStopwatchRunning = true;
    this.stopwatchStartTime = Date.now() - this.stopwatchElapsed;

    this.stopwatchIntervalId = setInterval(() => {
      this.stopwatchElapsed = Date.now() - this.stopwatchStartTime;
      this.renderStopwatchDisplay();
    }, 31); // ~30 fps update

    this.updateStopwatchButtons();
  }

  pauseStopwatch() {
    if (this.stopwatchIntervalId) {
      clearInterval(this.stopwatchIntervalId);
      this.stopwatchIntervalId = null;
    }
    this.isStopwatchRunning = false;
    this.updateStopwatchButtons();
  }

  resetStopwatch() {
    this.pauseStopwatch();
    this.stopwatchElapsed = 0;
    this.stopwatchLaps = [];
    this.renderStopwatchDisplay();
    this.renderStopwatchLaps();
    this.updateStopwatchButtons();
  }

  lapStopwatch() {
    if (!this.isStopwatchRunning) return;
    const lapTime = this.stopwatchElapsed;
    this.stopwatchLaps.unshift({
      number: this.stopwatchLaps.length + 1,
      time: this.formatStopwatchTime(lapTime)
    });
    this.renderStopwatchLaps();
  }

  formatStopwatchTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
  }

  renderStopwatchDisplay() {
    const display = document.getElementById('stopwatch-display');
    if (display) {
      display.textContent = this.formatStopwatchTime(this.stopwatchElapsed);
    }
  }

  renderStopwatchLaps() {
    const list = document.getElementById('stopwatch-laps-list');
    if (!list) return;
    if (this.stopwatchLaps.length === 0) {
      list.innerHTML = `<li class="text-xs text-gray-400 py-2 text-center">No laps recorded yet</li>`;
      return;
    }
    list.innerHTML = this.stopwatchLaps.map(lap => `
      <li class="flex justify-between items-center py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-slate-800 text-xs font-mono border border-gray-100 dark:border-slate-700">
        <span class="font-semibold text-gray-600 dark:text-gray-400">Lap ${lap.number}</span>
        <span class="text-blue-600 dark:text-blue-400 font-bold">${lap.time}</span>
      </li>
    `).join('');
  }

  updateStopwatchButtons() {
    const startPauseBtn = document.getElementById('stopwatch-start-pause-btn');
    if (startPauseBtn) {
      startPauseBtn.innerHTML = this.isStopwatchRunning
        ? `<svg class="w-5 h-5 inline mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg> Pause`
        : `<svg class="w-5 h-5 inline mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg> Start`;
    }
  }
}

// Global instance
window.clockTimer = new ClockTimerManager();
