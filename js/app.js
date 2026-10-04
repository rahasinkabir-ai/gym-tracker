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
    console.log("Gym Tracker initialized successfully.");
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

      // Update desktop and mobile nav link states
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
    });

    // Close mobile drawer if open
    this.closeMobileMenu();

    // Trigger specific section refreshes
    if (routeId === 'attendance' && window.attendanceManager) {
      window.attendanceManager.render();
    }
    if (routeId === 'finances' && window.financesManager) {
      window.financesManager.render();
    }
  }

  toggleMobileMenu() {
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) {
      drawer.classList.toggle('hidden');
    }
  }

  closeMobileMenu() {
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) {
      drawer.classList.add('hidden');
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
    alert("Profile settings saved successfully!");
  }

  // --- PWA INSTALLATION & SERVICE WORKER ---
  initPwa() {
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
      this.deferredPrompt = e;
      const btn = document.getElementById('pwa-install-btn');
      if (btn) btn.classList.remove('hidden');
    });

    window.addEventListener('appinstalled', () => {
      console.log('Gym Tracker PWA installed successfully');
      const btn = document.getElementById('pwa-install-btn');
      if (btn) btn.classList.add('hidden');
      this.deferredPrompt = null;
    });
  }

  showInstallPrompt() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
        } else {
          console.log('User dismissed the PWA install prompt');
        }
        this.deferredPrompt = null;
        const btn = document.getElementById('pwa-install-btn');
        if (btn) btn.classList.add('hidden');
      });
    } else {
      alert("To install Gym Tracker on your mobile phone or PC:\n\n• On Chrome/Android: Tap menu (⋮) -> 'Install App' or 'Add to Home Screen'\n• On iPhone (Safari): Tap Share (square with arrow) -> 'Add to Home Screen'");
    }
  }
}

window.app = new AppController();

// Global init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
  window.app.initPwa();
});
