/**
 * Main Application Controller
 * Handles routing, Day/Night theme switcher, mobile drawer, and lifecycle initialization.
 */

class AppController {
  constructor() {
    this.currentRoute = 'dashboard';
    this.isQuickActionOpen = false;
    this.commandPaletteOpen = false;
    this.filteredCommands = [];
    this.selectedCmdIndex = 0;
    this.setToastTimer = null;
    this.commands = [];
  }

  init() {
    this.initTheme();
    this.initRouting();
    this.initCommandPalette();
    this.initKeyboardShortcuts();
    
    // Initialize child managers
    if (window.renderQuote) window.renderQuote();
    if (window.clockTimer) window.clockTimer.init();
    if (window.cloudStore) window.cloudStore.initFirebase();
    if (window.workoutsManager) window.workoutsManager.init();
    if (window.attendanceManager) window.attendanceManager.init();
    if (window.financesManager) window.financesManager.init();
    if (window.plansManager) window.plansManager.init();

    this.renderSettingsView();
    this.initWelcomeScreen();
    console.log("IronPulse initialized successfully.");
  }

  // --- DAY / NIGHT THEME CONTROLLER ---
  initTheme() {
    const savedTheme = localStorage.getItem('GYM_TRACKER_THEME') || 'dark'; // default to athletic night mode
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    const html = document.documentElement;
    const themeIcon = document.getElementById('theme-toggle-icon');
    const themeText = document.getElementById('theme-toggle-text');
    const settingsToggle = document.getElementById('settings-darkmode-toggle');

    if (theme === 'dark') {
      html.classList.add('dark');
      localStorage.setItem('GYM_TRACKER_THEME', 'dark');
      if (themeIcon) themeIcon.innerHTML = `🌙`;
      if (themeText) themeText.textContent = `Night Mode`;
      if (settingsToggle) settingsToggle.checked = true;
    } else {
      html.classList.remove('dark');
      localStorage.setItem('GYM_TRACKER_THEME', 'light');
      if (themeIcon) themeIcon.innerHTML = `☀️`;
      if (themeText) themeText.textContent = `Day Mode`;
      if (settingsToggle) settingsToggle.checked = false;
    }
  }

  toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    this.setTheme(isDark ? 'light' : 'dark');
  }

  // --- NAVIGATION ROUTING ---
  initRouting() {
    // Check URL hash or default to dashboard
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    this.navigateTo(hash);

    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.replace('#', '') || 'dashboard';
      this.navigateTo(newHash);
    });
  }

  navigateTo(routeId) {
    const validRoutes = ['dashboard', 'workouts', 'attendance', 'finances', 'plans', 'timer', 'settings'];
    if (!validRoutes.includes(routeId)) routeId = 'dashboard';
    this.currentRoute = routeId;

    // Show/Hide section elements with silky entry animation
    validRoutes.forEach(id => {
      const pageEl = document.getElementById(`page-${id}`);
      if (pageEl) {
        if (id === routeId) {
          pageEl.classList.remove('hidden');
          // Re-trigger animation
          pageEl.classList.remove('page-section');
          void pageEl.offsetWidth; // trigger reflow
          pageEl.classList.add('page-section');
          pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          pageEl.classList.add('hidden');
        }
      }

      // Update desktop nav link states
      const navLinks = document.querySelectorAll(`[data-nav="${id}"]`);
      navLinks.forEach(link => {
        if (id === routeId) {
          link.classList.add('nav-tab-active');
          link.classList.remove('nav-tab-inactive');
        } else {
          link.classList.remove('nav-tab-active');
          link.classList.add('nav-tab-inactive');
        }
      });

      // Update iOS Floating Dock active tab states
      const dockLinks = document.querySelectorAll(`[data-dock="${id}"]`);
      dockLinks.forEach(link => {
        if (id === routeId) {
          link.classList.add('active');
          link.classList.remove('text-gray-500', 'dark:text-gray-400');
        } else {
          link.classList.remove('active');
          link.classList.add('text-gray-500', 'dark:text-gray-400');
        }
      });
    });

    // Close speed dial if open
    this.toggleQuickActions(false);

    // Update floating timer HUD visibility
    if (window.clockTimer && window.clockTimer.updateFloatingHud) {
      window.clockTimer.updateFloatingHud();
    }

    // Trigger specific section refreshes & animated number count-ups
    if (routeId === 'dashboard') {
      setTimeout(() => {
        const streakEl = document.getElementById('dashboard-streak-number');
        if (streakEl && window.attendanceManager && window.animateNumber) {
          const s = window.attendanceManager.calculateStreak();
          window.animateNumber(streakEl, s, 600);
        }
        if (window.anatomyHeatmap) window.anatomyHeatmap.renderHeatmap();
        if (window.readinessProtocol) {
          window.readinessProtocol.renderDashboardTimeline();
          window.readinessProtocol.renderReadinessWidget();
        }
        if (window.overloadEngine) window.overloadEngine.renderDashboardWidget();
      }, 50);
    }
    if (routeId === 'attendance' && window.attendanceManager) {
      window.attendanceManager.render();
      setTimeout(() => {
        const streakEl = document.getElementById('attendance-stat-streak');
        if (streakEl && window.animateNumber) {
          window.animateNumber(streakEl, window.attendanceManager.calculateStreak(), 600);
        }
      }, 50);
    }
    if (routeId === 'finances' && window.financesManager) {
      window.financesManager.render();
    }
    if (routeId === 'plans' && window.plansManager) {
      window.plansManager.render();
    }
  }

  // --- QUICK ACTIONS FAB & SPEED DIAL ---
  toggleQuickActions(forceState = null) {
    const menu = document.getElementById('quick-action-menu');
    const fabIcon = document.getElementById('fab-icon');
    if (!menu) return;

    this.isQuickActionOpen = forceState !== null ? forceState : !this.isQuickActionOpen;

    if (this.isQuickActionOpen) {
      menu.classList.remove('hidden');
      menu.classList.add('flex');
      if (fabIcon) fabIcon.style.transform = 'rotate(45deg)';
      if (window.triggerHaptic) window.triggerHaptic('light');
    } else {
      menu.classList.add('hidden');
      menu.classList.remove('flex');
      if (fabIcon) fabIcon.style.transform = 'rotate(0deg)';
    }
  }

  // --- COMMAND PALETTE (Ctrl+K) ---
  initCommandPalette() {
    this.commands = [
      { id: 'nav-dashboard', title: 'Dashboard & Overview', icon: '📊', category: 'Navigation', hint: 'Jump to home command center', action: () => this.navigateTo('dashboard') },
      { id: 'nav-workouts', title: 'Workouts, Sets & Reps', icon: '🏋️', category: 'Navigation', hint: 'View or log exercises & routines', action: () => this.navigateTo('workouts') },
      { id: 'nav-attendance', title: 'Attendance & Calendar', icon: '📅', category: 'Navigation', hint: 'View streak count & monthly calendar', action: () => this.navigateTo('attendance') },
      { id: 'nav-finances', title: 'Gym Fees & Meal Expenses', icon: '💳', category: 'Navigation', hint: 'Manage gym membership & dietary budget', action: () => this.navigateTo('finances') },
      { id: 'nav-plans', title: 'Workout Plans & Splits', icon: '🎯', category: 'Navigation', hint: 'Browse Push/Pull/Legs & custom routines', action: () => this.navigateTo('plans') },
      { id: 'nav-timer', title: 'Clock, Rest Timer & Stopwatch', icon: '⏱️', category: 'Navigation', hint: 'Precision workout intervals & lap timer', action: () => this.navigateTo('timer') },
      { id: 'nav-settings', title: 'Settings & Cloud Backup', icon: '⚙️', category: 'Navigation', hint: 'Configure units, currency & sync', action: () => this.navigateTo('settings') },
      { id: 'act-log-workout', title: 'Log New Workout Session', icon: '⚡', category: 'Quick Action', hint: 'Record exercises, sets, reps & weight', action: () => window.workoutsManager.openCreateModal() },
      { id: 'act-check-in', title: 'Toggle Today\'s Gym Attendance', icon: '💪', category: 'Quick Action', hint: 'Check-in or uncheck today\'s attendance', action: () => window.attendanceManager.toggleToday() },
      { id: 'act-rest-60', title: 'Start 60s Rest Timer', icon: '⏱️', category: 'Rest Timer', hint: '1 minute fast recovery interval', action: () => window.clockTimer.startRestTimer(60) },
      { id: 'act-rest-90', title: 'Start 90s Rest Timer', icon: '⏱️', category: 'Rest Timer', hint: 'Standard hypertrophy rest interval', action: () => window.clockTimer.startRestTimer(90) },
      { id: 'act-rest-120', title: 'Start 120s Rest Timer', icon: '⏱️', category: 'Rest Timer', hint: 'Heavy compound strength set rest', action: () => window.clockTimer.startRestTimer(120) },
      { id: 'act-stopwatch', title: 'Toggle Stopwatch (Start/Pause)', icon: '⏱️', category: 'Timer', hint: 'Run or pause active stopwatch', action: () => { window.clockTimer.isStopwatchRunning ? window.clockTimer.pauseStopwatch() : window.clockTimer.startStopwatch(); } },
      { id: 'act-add-fee', title: 'Record New Gym Fee / Expense', icon: '💳', category: 'Finances', hint: 'Log gym fee, meal, or supplements', action: () => window.financesManager.openCreateModal() },
      { id: 'act-voice', title: 'Hands-Free Voice Protocol', icon: '🎙️', category: 'Voice AI', hint: 'Control app with natural speech commands', action: () => window.voiceAssistant.startListening() },
      { id: 'act-1rm', title: '1RM & Overload Algorithmic Engine', icon: '🧬', category: 'Biometrics', hint: 'Epley/Brzycki max & zone calculations', action: () => window.overloadEngine.openModal() },
      { id: 'act-readiness', title: 'Audit Daily Athletic Readiness', icon: '⚡', category: 'Biometrics', hint: 'Calculate CNS recovery & training advice', action: () => window.readinessProtocol.openReadinessModal() },
      { id: 'act-theme', title: 'Toggle Day / Night Mode', icon: '🌓', category: 'Appearance', hint: 'Switch between light and dark theme', action: () => this.toggleTheme() },
      { id: 'act-edit-profile', title: 'Edit Athlete Profile & Moniker', icon: '👤', category: 'Profile', hint: 'Change name, units & currency', action: () => this.openWelcomeScreen(true) },
    ];
    this.filteredCommands = [...this.commands];
  }

  openCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    const input = document.getElementById('command-palette-input');
    if (!modal) return;

    this.commandPaletteOpen = true;
    modal.classList.remove('hidden');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 80);
    }
    this.filterCommandPalette('');
    if (window.triggerHaptic) window.triggerHaptic('light');
  }

  closeCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    if (!modal) return;
    this.commandPaletteOpen = false;
    modal.classList.add('hidden');
  }

  toggleCommandPalette() {
    if (this.commandPaletteOpen) {
      this.closeCommandPalette();
    } else {
      this.openCommandPalette();
    }
  }

  filterCommandPalette(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      this.filteredCommands = [...this.commands];
    } else {
      this.filteredCommands = this.commands.filter(cmd => 
        cmd.title.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        (cmd.hint && cmd.hint.toLowerCase().includes(q))
      );
    }
    this.selectedCmdIndex = 0;
    this.renderCommandList();
  }

  renderCommandList() {
    const container = document.getElementById('command-palette-list');
    if (!container) return;

    if (this.filteredCommands.length === 0) {
      container.innerHTML = `
        <div class="py-8 text-center text-xs text-stone-400">
          No matching commands found.
        </div>
      `;
      return;
    }

    container.innerHTML = this.filteredCommands.map((cmd, idx) => `
      <div onclick="app.executeCommand('${cmd.id}')" 
           data-cmd-idx="${idx}"
           class="cmd-item ${idx === this.selectedCmdIndex ? 'active-cmd' : ''} flex items-center justify-between p-2.5 rounded-xl cursor-pointer border border-transparent">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-lg bg-stone-100 dark:bg-[#181822] flex items-center justify-center text-base border border-stone-200 dark:border-stone-800">
            ${cmd.icon}
          </span>
          <div>
            <p class="cmd-title font-medium text-xs text-stone-900 dark:text-stone-200 font-sans">${cmd.title}</p>
            <p class="text-[10px] text-stone-400 font-sans font-light">${cmd.hint || cmd.category}</p>
          </div>
        </div>
        <span class="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 font-luxury font-medium">
          ${cmd.category}
        </span>
      </div>
    `).join('');

    const activeEl = container.querySelector(`[data-cmd-idx="${this.selectedCmdIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }

  handleCommandKeydown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.filteredCommands.length > 0) {
        this.selectedCmdIndex = (this.selectedCmdIndex + 1) % this.filteredCommands.length;
        this.renderCommandList();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.filteredCommands.length > 0) {
        this.selectedCmdIndex = (this.selectedCmdIndex - 1 + this.filteredCommands.length) % this.filteredCommands.length;
        this.renderCommandList();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.filteredCommands[this.selectedCmdIndex]) {
        this.executeCommand(this.filteredCommands[this.selectedCmdIndex].id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.closeCommandPalette();
    }
  }

  executeCommand(cmdId) {
    const cmd = this.commands.find(c => c.id === cmdId);
    this.closeCommandPalette();
    if (cmd && cmd.action) {
      setTimeout(() => cmd.action(), 50);
    }
  }

  // --- GLOBAL KEYBOARD SHORTCUTS ---
  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggleCommandPalette();
        return;
      }

      // Escape closes open palettes or drawers
      if (e.key === 'Escape') {
        this.closeCommandPalette();
        this.toggleQuickActions(false);
        this.hideSetToast();
        return;
      }

      // Single-key navigation (only when not inside input/textarea/select)
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      const routeMap = {
        '1': 'dashboard',
        '2': 'workouts',
        '3': 'attendance',
        '4': 'plans',
        '5': 'finances',
        '6': 'timer',
        '7': 'settings'
      };

      if (routeMap[e.key]) {
        e.preventDefault();
        this.navigateTo(routeMap[e.key]);
      }
    });
  }

  // --- WORKOUT SET COMPLETION TOAST ---
  showSetToast(setNum, exerciseName) {
    const toast = document.getElementById('set-complete-toast');
    const toastText = document.getElementById('set-complete-toast-text');
    if (!toast) return;

    if (toastText) toastText.textContent = `Set ${setNum} of ${exerciseName || 'Exercise'} finished!`;
    toast.classList.remove('opacity-0', '-translate-y-4', 'pointer-events-none');
    toast.classList.add('opacity-100', 'translate-y-0');

    if (this.setToastTimer) clearTimeout(this.setToastTimer);
    this.setToastTimer = setTimeout(() => {
      this.hideSetToast();
    }, 5500);
  }

  hideSetToast() {
    const toast = document.getElementById('set-complete-toast');
    if (!toast) return;
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');
  }

  // --- SETTINGS VIEW CONTROLS ---
  renderSettingsView() {
    const currencySelect = document.getElementById('settings-currency');
    const unitSelect = document.getElementById('settings-weight-unit');
    const nameInput = document.getElementById('settings-name');

    if (currencySelect) currencySelect.value = cloudStore.data.profile.currency || '$';
    if (unitSelect) unitSelect.value = cloudStore.data.profile.weightUnit || 'kg';
    if (nameInput) nameInput.value = cloudStore.data.profile.name || '';
  }

  saveProfileSettings() {
    const currency = document.getElementById('settings-currency').value;
    const weightUnit = document.getElementById('settings-weight-unit').value;
    const name = document.getElementById('settings-name').value.trim();

    cloudStore.data.profile.currency = currency;
    cloudStore.data.profile.weightUnit = weightUnit;
    if (name) cloudStore.data.profile.name = name;

    cloudStore.save();
    this.updateDashboardGreeting();
    alert("Profile settings saved successfully!");
  }

  // --- MINIMAL LUXURY WELCOME & ONBOARDING ---
  initWelcomeScreen() {
    this.tempUnit = cloudStore.data.profile.weightUnit || 'kg';
    this.tempCurrency = cloudStore.data.profile.currency || '$';

    this.updateDashboardGreeting();

    if (window.cloudStore && window.cloudStore.subscribe) {
      window.cloudStore.subscribe(() => this.updateDashboardGreeting());
    }

    // Check if user has completed welcome setup or if name is empty/default
    const hasWelcomed = localStorage.getItem('ironpulse_welcomed');
    const currentName = cloudStore.data.profile.name;
    const isDefault = !currentName || currentName === 'Fitness Champion' || currentName.trim() === '';

    if (!hasWelcomed || isDefault) {
      setTimeout(() => {
        this.openWelcomeScreen(false);
      }, 400);
    }
  }

  updateDashboardGreeting() {
    const rawName = cloudStore.data.profile.name;
    const name = (rawName && rawName.trim() && rawName !== 'Fitness Champion') ? rawName.trim() : 'Athlete';

    const nameSpan = document.getElementById('user-display-name-span');
    if (nameSpan) {
      nameSpan.textContent = name;
    }

    const headingEl = document.getElementById('dashboard-welcome-heading');
    if (headingEl) {
      const hour = new Date().getHours();
      let greeting = 'Welcome';
      if (hour >= 5 && hour < 12) greeting = 'Good morning';
      else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
      else if (hour >= 17 && hour < 22) greeting = 'Good evening';

      headingEl.innerHTML = `${greeting}, <span id="user-display-name-span" class="gold-gradient-text">${name}</span>`;
    }

    const dateSpan = document.getElementById('welcome-today-date');
    if (dateSpan) {
      const now = new Date();
      dateSpan.textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    }
  }

  openWelcomeScreen(isEditing = false) {
    const modal = document.getElementById('welcome-modal');
    if (!modal) return;

    const titleEl = document.getElementById('welcome-modal-title');
    const subtitleEl = document.getElementById('welcome-modal-subtitle');
    const submitBtn = document.getElementById('welcome-submit-btn');
    const nameInput = document.getElementById('welcome-name-input');

    this.tempUnit = cloudStore.data.profile.weightUnit || 'kg';
    this.tempCurrency = cloudStore.data.profile.currency || '$';

    if (isEditing) {
      if (titleEl) titleEl.textContent = 'PROFILE SETUP';
      if (subtitleEl) subtitleEl.textContent = 'Refine Your Training Identity';
      if (submitBtn) submitBtn.innerHTML = `<span>Save & Update</span> <span>✓</span>`;
      if (nameInput) {
        const curName = cloudStore.data.profile.name;
        nameInput.value = (curName && curName !== 'Fitness Champion') ? curName : '';
      }
    } else {
      if (titleEl) titleEl.textContent = 'IRONPULSE';
      if (subtitleEl) subtitleEl.textContent = 'Atelier of Discipline & Strength';
      if (submitBtn) submitBtn.innerHTML = `<span>Enter Sanctuary</span> <span>→</span>`;
      if (nameInput) nameInput.value = '';
    }

    this.renderWelcomePills();
    modal.classList.remove('hidden');

    setTimeout(() => {
      if (nameInput) nameInput.focus();
    }, 150);
  }

  closeWelcomeScreen() {
    const modal = document.getElementById('welcome-modal');
    if (modal) modal.classList.add('hidden');
    localStorage.setItem('ironpulse_welcomed', 'true');
  }

  setWelcomeUnit(unit) {
    this.tempUnit = unit;
    this.renderWelcomePills();
  }

  setWelcomeCurrency(curr) {
    this.tempCurrency = curr;
    this.renderWelcomePills();
  }

  renderWelcomePills() {
    // Unit pills
    ['kg', 'lbs'].forEach(u => {
      const btn = document.getElementById(`welcome-unit-${u}`);
      if (btn) {
        if (this.tempUnit === u) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });

    // Currency pills
    const currMap = { '$': 'usd', '€': 'eur', '£': 'gbp', '৳': 'bdt' };
    Object.keys(currMap).forEach(c => {
      const id = `welcome-curr-${currMap[c]}`;
      const btn = document.getElementById(id);
      if (btn) {
        if (this.tempCurrency === c) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });
  }

  saveWelcomeSetup() {
    const nameInput = document.getElementById('welcome-name-input');
    const enteredName = nameInput ? nameInput.value.trim() : '';
    const finalName = enteredName || 'Athlete';

    cloudStore.data.profile.name = finalName;
    cloudStore.data.profile.weightUnit = this.tempUnit || 'kg';
    cloudStore.data.profile.currency = this.tempCurrency || '$';

    cloudStore.save();
    localStorage.setItem('ironpulse_welcomed', 'true');

    this.updateDashboardGreeting();
    this.renderSettingsView();

    // Re-render other views if available to reflect unit/currency
    if (window.workoutsManager && window.workoutsManager.renderMetrics) {
      window.workoutsManager.renderMetrics();
    }
    if (window.financesManager && window.financesManager.render) {
      window.financesManager.render();
    }

    this.closeWelcomeScreen();
  }

  // --- PWA INSTALLATION & SERVICE WORKER ---
  checkIfInstalled() {
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (navigator.standalone === true) ||
      document.referrer.includes('android-app://') ||
      window.location.search.includes('source=pwa') ||
      window.location.search.includes('mode=standalone') ||
      localStorage.getItem('ironpulse_installed') === 'true';

    if (isStandalone) {
      document.documentElement.classList.add('app-is-installed');
      if (document.body) document.body.classList.add('app-is-installed');
      this.hideInstallButtons();
      return true;
    }
    return false;
  }

  hideInstallButtons() {
    const pwaBtn = document.getElementById('pwa-install-btn');
    const apkBtn = document.getElementById('get-apk-btn');
    if (pwaBtn) {
      pwaBtn.style.display = 'none';
      pwaBtn.classList.add('hidden');
    }
    if (apkBtn) {
      apkBtn.style.display = 'none';
      apkBtn.classList.add('hidden');
    }
    document.querySelectorAll('.install-prompt-btn').forEach(el => {
      el.style.display = 'none';
      el.classList.add('hidden');
    });
  }

  initPwa() {
    // Check if app is already running as installed standalone / APK
    this.checkIfInstalled();

    // Listen for display-mode changes dynamically
    try {
      const mql = window.matchMedia('(display-mode: standalone)');
      if (mql && mql.addEventListener) {
        mql.addEventListener('change', (e) => {
          if (e.matches) {
            this.hideInstallButtons();
            document.documentElement.classList.add('app-is-installed');
          }
        });
      }
    } catch (_) {}

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => {
            console.log('PWA ServiceWorker registered with scope:', reg.scope);
          })
          .catch(err => {
            console.warn('PWA ServiceWorker registration failed:', err);
          });
      });
    }

    // Capture install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      if (this.checkIfInstalled()) return;
      this.deferredPrompt = e;
      const btn = document.getElementById('pwa-install-btn');
      if (btn) btn.classList.remove('hidden');
    });

    window.addEventListener('appinstalled', () => {
      console.log('IronPulse PWA installed successfully');
      localStorage.setItem('ironpulse_installed', 'true');
      document.documentElement.classList.add('app-is-installed');
      if (document.body) document.body.classList.add('app-is-installed');
      this.hideInstallButtons();
      this.deferredPrompt = null;
    });
  }

  showInstallPrompt() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
          localStorage.setItem('ironpulse_installed', 'true');
          this.hideInstallButtons();
        } else {
          console.log('User dismissed the PWA install prompt');
        }
        this.deferredPrompt = null;
      });
    } else {
      alert("To install IronPulse on your phone or PC:\n\n• On Chrome/Android: Tap menu (⋮) -> 'Install App' or 'Add to Home Screen'\n• On iPhone (Safari): Tap Share (square with arrow) -> 'Add to Home Screen'");
    }
  }
}

window.app = new AppController();

// Global init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
  window.app.initPwa();
});
