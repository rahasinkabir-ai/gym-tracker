/**
 * IronPulse Voice Protocol Assistant
 * Browser-native Web Speech API & SpeechSynthesis for hands-free in-gym voice commands.
 */

class VoiceAssistantManager {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.speechSynth = window.speechSynthesis || null;
    this.transcriptEl = null;
    this.statusEl = null;
    this.overlayEl = null;
    this.hasSupport = ('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window);
  }

  init() {
    if (!this.hasSupport) {
      console.warn("Web Speech API not natively supported on this browser.");
      return;
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRec();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.updateUIState(true);
      if (window.triggerHaptic) window.triggerHaptic('light');
    };

    this.recognition.onresult = (event) => {
      let interim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const text = finalTranscript || interim;
      this.setTranscriptText(text);

      if (finalTranscript) {
        this.processVoiceCommand(finalTranscript.trim());
      }
    };

    this.recognition.onerror = (event) => {
      console.warn("Voice Recognition error:", event.error);
      this.setStatusText(`Error: ${event.error}. Tap to retry.`);
      setTimeout(() => this.stopListening(), 2500);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.updateUIState(false);
    };

    // Keyboard shortcut 'V' to toggle voice assistant
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'v' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag !== 'input' && activeTag !== 'textarea' && activeTag !== 'select') {
          e.preventDefault();
          this.toggleListening();
        }
      }
    });
  }

  toggleListening() {
    if (!this.hasSupport) {
      alert("Voice Command Protocol requires a browser with Web Speech API support (Chrome, Edge, Safari, Android Chrome).");
      return;
    }

    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening() {
    this.showOverlay();
    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition already started or error:", e);
    }
  }

  stopListening() {
    try {
      this.recognition.stop();
    } catch (_) {}
    this.isListening = false;
    this.updateUIState(false);
    setTimeout(() => this.hideOverlay(), 1200);
  }

  showOverlay() {
    this.overlayEl = document.getElementById('voice-assistant-modal');
    if (this.overlayEl) {
      this.overlayEl.classList.remove('hidden');
      this.setTranscriptText('Listening for voice protocol...');
      this.setStatusText('Say a command: "Start 90s rest", "Check in today", "Log workout"...');
    }
  }

  hideOverlay() {
    if (this.overlayEl) {
      this.overlayEl.classList.add('hidden');
    }
  }

  setTranscriptText(text) {
    this.transcriptEl = document.getElementById('voice-transcript-text');
    if (this.transcriptEl) {
      this.transcriptEl.textContent = `“${text}”`;
    }
  }

  setStatusText(text) {
    this.statusEl = document.getElementById('voice-status-hint');
    if (this.statusEl) {
      this.statusEl.textContent = text;
    }
  }

  updateUIState(listening) {
    const orb = document.getElementById('voice-mic-orb');
    const pulse = document.getElementById('voice-pulse-indicator');
    const wave = document.getElementById('voice-wave-container');

    if (listening) {
      if (orb) orb.classList.add('ring-4', 'ring-[#dab978]', 'scale-110');
      if (pulse) pulse.classList.remove('hidden');
      if (wave) wave.classList.remove('opacity-0');
    } else {
      if (orb) orb.classList.remove('ring-4', 'ring-[#dab978]', 'scale-110');
      if (pulse) pulse.classList.add('hidden');
      if (wave) wave.classList.add('opacity-0');
    }
  }

  speak(text) {
    if (!this.speechSynth) return;
    try {
      this.speechSynth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.0;
      utterance.rate = 1.05;
      utterance.volume = 0.9;
      this.speechSynth.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  }

  processVoiceCommand(phrase) {
    const raw = phrase.toLowerCase();
    console.log("Voice Command Recognized:", raw);

    // 1. Rest Timer Commands
    const restMatch = raw.match(/(start|run|set)?\s*(\d+)\s*(s|sec|secs|seconds|minute|min|minutes)?\s*rest/i) ||
                      raw.match(/rest\s*(for)?\s*(\d+)\s*(s|sec|seconds|min|minutes)?/i);
    if (restMatch || raw.includes('start rest') || raw.includes('rest timer')) {
      let seconds = 90;
      if (restMatch) {
        const num = parseInt(restMatch[2] || restMatch[1]);
        const unit = restMatch[3] || '';
        if (unit.startsWith('min')) {
          seconds = num * 60;
        } else if (num) {
          seconds = num;
        }
      }
      if (window.clockTimer) {
        window.clockTimer.startRestTimer(seconds);
        this.speak(`Starting ${seconds} seconds rest interval.`);
        this.setStatusText(`✔ Started ${seconds}s Rest Timer!`);
        setTimeout(() => this.hideOverlay(), 1400);
        return;
      }
    }

    if (raw.includes('pause timer') || raw.includes('stop timer') || raw.includes('pause rest')) {
      if (window.clockTimer) {
        window.clockTimer.pauseRestTimer();
        this.speak("Rest timer paused.");
        this.setStatusText("✔ Rest timer paused.");
        setTimeout(() => this.hideOverlay(), 1200);
        return;
      }
    }

    // 2. Gym Attendance Check-In
    if (raw.includes('check in') || raw.includes('attended') || raw.includes('gym today') || raw.includes('mark attendance')) {
      if (window.attendanceManager) {
        window.attendanceManager.toggleToday();
        this.speak("Attendance recorded. Great discipline today.");
        this.setStatusText("✔ Checked in for today! 💪");
        setTimeout(() => this.hideOverlay(), 1400);
        return;
      }
    }

    // 3. Log / Create Workout
    if (raw.includes('log workout') || raw.includes('new workout') || raw.includes('add workout') || raw.includes('create workout')) {
      this.hideOverlay();
      this.speak("Opening workout session logger.");
      if (window.workoutsManager) {
        window.workoutsManager.openCreateModal();
      }
      return;
    }

    // 4. One-Rep Max Calculator
    if (raw.includes('1rm') || raw.includes('one rep max') || raw.includes('max calculator') || raw.includes('overload')) {
      this.hideOverlay();
      this.speak("Opening 1-Rep Max and Overload Engine.");
      if (window.overloadEngine) {
        window.overloadEngine.openModal();
      }
      return;
    }

    // 5. Navigation Commands
    const navMap = {
      'dashboard': 'dashboard',
      'home': 'dashboard',
      'workouts': 'workouts',
      'exercises': 'workouts',
      'attendance': 'attendance',
      'calendar': 'attendance',
      'streak': 'attendance',
      'plans': 'plans',
      'splits': 'plans',
      'finances': 'finances',
      'fees': 'finances',
      'timer': 'timer',
      'stopwatch': 'timer',
      'settings': 'settings'
    };

    for (const [key, target] of Object.entries(navMap)) {
      if (raw.includes(key)) {
        this.hideOverlay();
        this.speak(`Navigating to ${target}.`);
        if (window.app) window.app.navigateTo(target);
        return;
      }
    }

    // 6. Day / Night Theme Toggle
    if (raw.includes('dark mode') || raw.includes('night mode')) {
      if (window.app) window.app.setTheme('dark');
      this.speak("Night mode activated.");
      this.setStatusText("✔ Dark Mode Enabled");
      setTimeout(() => this.hideOverlay(), 1000);
      return;
    }

    if (raw.includes('light mode') || raw.includes('day mode')) {
      if (window.app) window.app.setTheme('light');
      this.speak("Day mode activated.");
      this.setStatusText("✔ Day Mode Enabled");
      setTimeout(() => this.hideOverlay(), 1000);
      return;
    }

    // 7. Fallback unrecognized
    this.setStatusText(`Command not recognized. Try "Start 90s rest" or "Check in today".`);
    this.speak("Command not recognized.");
    setTimeout(() => this.hideOverlay(), 2000);
  }
}

window.voiceAssistant = new VoiceAssistantManager();

document.addEventListener('DOMContentLoaded', () => {
  window.voiceAssistant.init();
});
