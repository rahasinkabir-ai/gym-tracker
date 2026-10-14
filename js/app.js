/**
 * Main Application Controller
 * Handles routing, Day/Night theme switcher, mobile drawer, and lifecycle initialization.
 */

class AppController {
  constructor() {
    this.currentRoute = 'dashboard';
  }

  init() {
    this.initTheme();
    this.initRouting();
    
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

    // Show/Hide section elements
    validRoutes.forEach(id => {
      const pageEl = document.getElementById(`page-${id}`);
      if (pageEl) {
        if (id === routeId) {
          pageEl.classList.remove('hidden');
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

    // Trigger specific section refreshes
    if (routeId === 'attendance' && window.attendanceManager) {
      window.attendanceManager.render();
    }
    if (routeId === 'finances' && window.financesManager) {
      window.financesManager.render();
    }
    if (routeId === 'plans' && window.plansManager) {
      window.plansManager.render();
    }
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
