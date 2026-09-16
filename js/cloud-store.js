/**
 * Cloud & Local Data Engine
 * Supports seamless LocalStorage persistence + Firebase Cloud Sync with Google Authentication
 */

const LOCAL_STORAGE_KEY = 'GYM_TRACKER_DATA_V1';
const FIREBASE_CONFIG_KEY = 'GYM_TRACKER_FIREBASE_CONFIG';

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyD_IEaVYb7pZBRJC67SKPdfIr6Mv_6Csh0",
  authDomain: "gym-tracker-4dbdc.firebaseapp.com",
  projectId: "gym-tracker-4dbdc",
  storageBucket: "gym-tracker-4dbdc.firebasestorage.app",
  messagingSenderId: "217983177998",
  appId: "1:217983177998:web:44bd6b71c674940385735f",
  measurementId: "G-M2GSYBGENR"
};

const INITIAL_SAMPLE_DATA = {
  profile: {
    name: 'Fitness Champion',
    email: '',
    photoURL: '',
    weightUnit: 'kg',
    currency: '$'
  },
  workouts: [
    {
      id: 'w-1',
      date: new Date().toISOString().split('T')[0],
      title: 'Chest & Triceps Power',
      muscleGroup: 'Chest',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: 8, weight: 80, completed: true },
        { name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 26, completed: true },
        { name: 'Cable Tricep Pushdown', sets: 3, reps: 12, weight: 35, completed: true },
        { name: 'Overhead Extension', sets: 3, reps: 12, weight: 20, completed: true }
      ],
      notes: 'Felt strong on bench today. New personal rep record on set 3!'
    },
    {
      id: 'w-2',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      title: 'Back & Biceps Hypertrophy',
      muscleGroup: 'Back',
      exercises: [
        { name: 'Deadlift', sets: 4, reps: 6, weight: 120, completed: true },
        { name: 'Lat Pulldown', sets: 4, reps: 10, weight: 65, completed: true },
        { name: 'Barbell Row', sets: 3, reps: 8, weight: 70, completed: true },
        { name: 'Incline Dumbbell Curl', sets: 3, reps: 12, weight: 14, completed: true }
      ],
      notes: 'Form felt very dialed in.'
    },
    {
      id: 'w-3',
      date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
      title: 'Leg Day & Calves',
      muscleGroup: 'Legs',
      exercises: [
        { name: 'Barbell Back Squat', sets: 4, reps: 8, weight: 100, completed: true },
        { name: 'Romanian Deadlift', sets: 3, reps: 10, weight: 80, completed: true },
        { name: 'Leg Press', sets: 3, reps: 12, weight: 160, completed: true },
        { name: 'Standing Calf Raises', sets: 4, reps: 15, weight: 50, completed: true }
      ],
      notes: 'Brutal squat session, great depth.'
    }
  ],
  attendance: {
    // Stored as date strings 'YYYY-MM-DD': true
    [new Date().toISOString().split('T')[0]]: true,
    [new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0]]: true,
    [new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0]]: true,
    [new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0]]: true,
    [new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0]]: true
  },
  finances: [
    {
      id: 'f-1',
      category: 'gym', // 'gym' or 'meal'
      title: 'Monthly Gym Membership',
      amount: 45.00,
      date: new Date().toISOString().split('T')[0].slice(0, 7) + '-01',
      status: 'paid', // 'paid', 'pending', 'overdue'
      notes: 'Includes access to all zones and sauna'
    },
    {
      id: 'f-2',
      category: 'meal',
      title: 'Whey Protein Isolate 2kg',
      amount: 58.50,
      date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
      status: 'paid',
      notes: 'Double Chocolate flavour'
    },
    {
      id: 'f-3',
      category: 'meal',
      title: 'Weekly High-Protein Grocery',
      amount: 84.20,
      date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
      status: 'paid',
      notes: 'Chicken breast, eggs, Greek yogurt, oats, bananas'
    },
    {
      id: 'f-4',
      category: 'gym',
      title: 'Locker Rental Fee',
      amount: 10.00,
      date: new Date().toISOString().split('T')[0].slice(0, 7) + '-05',
      status: 'paid',
      notes: 'Locker #42'
    },
    {
      id: 'f-5',
      category: 'meal',
      title: 'Pre-workout & Creatine Refill',
      amount: 32.00,
      date: new Date().toISOString().split('T')[0].slice(0, 7) + '-15',
      status: 'pending',
      notes: 'Due next grocery run'
    }
  ],
  plans: {
    yearly: [
      {
        id: 'py-1',
        year: 2026,
        title: 'Hit 100kg Bench Press & 140kg Squat',
        targetDate: '2026-12-31',
        progress: 75,
        status: 'active',
        checklist: [
          { text: 'Bench 85kg for 5 reps', done: true },
          { text: 'Squat 115kg for 5 reps', done: true },
          { text: 'Bench 100kg for 1 rep', done: false },
          { text: 'Squat 140kg for 1 rep', done: false }
        ]
      },
      {
        id: 'py-2',
        year: 2026,
        title: 'Complete 200 Total Gym Sessions in 2026',
        targetDate: '2026-12-31',
        progress: 68,
        status: 'active',
        checklist: [
          { text: 'Average 4 workouts per week', done: true },
          { text: 'Track all sessions consistently', done: true }
        ]
      }
    ],
    monthly: [
      {
        id: 'pm-1',
        month: new Date().toISOString().slice(0, 7),
        title: 'Strict Nutrition & 18 Gym Attendances',
        targetDate: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
        progress: 60,
        status: 'active',
        checklist: [
          { text: 'Hit daily 160g protein target', done: true },
          { text: 'Drink 3.5L water daily', done: true },
          { text: 'Meal fee budget kept under $350', done: true },
          { text: 'Complete at least 18 workouts', done: false }
        ]
      }
    ],
    weekly: [
      {
        id: 'pw-1',
        week: 'Current Week',
        title: 'Push-Pull-Legs + Upper Hypertrophy Split',
        progress: 65,
        status: 'active',
        checklist: [
          { text: 'Chest & Triceps Day (Push)', done: true },
          { text: 'Back & Biceps Day (Pull)', done: true },
          { text: 'Legs & Core Day', done: true },
          { text: 'Upper Body Pump & Conditioning', done: false },
          { text: 'Sunday Mobility & Stretch', done: false }
        ]
      }
    ]
  }
};

class CloudStore {
  constructor() {
    this.data = this.loadLocal();
    this.currentUser = null;
    this.firebaseApp = null;
    this.db = null;
    this.auth = null;
    this.isCloudConnected = false;
    this.unsubscribeFirestore = null;
    this.listeners = [];
  }

  // Register state change subscriber
  subscribe(fn) {
    this.listeners.push(fn);
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this.data); } catch (e) { console.error(e); }
    });
  }

  // --- LOCAL PERSISTENCE ---
  loadLocal() {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed reading localStorage:", e);
    }
    // Save sample data if nothing stored
    this.saveLocal(INITIAL_SAMPLE_DATA);
    return JSON.parse(JSON.stringify(INITIAL_SAMPLE_DATA));
  }

  saveLocal(data) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed writing to localStorage:", e);
    }
  }

  // Main save function: writes locally and to Firestore if connected
  async save() {
    this.saveLocal(this.data);
    this.notify();

    if (this.isCloudConnected && this.currentUser && this.db) {
      try {
        const userDocRef = this.db.collection('users').doc(this.currentUser.uid).collection('gymData').doc('tracker');
        await userDocRef.set({
          ...this.data,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        this.updateSyncBadge('synced');
      } catch (err) {
        console.error("Firestore sync error:", err);
        this.updateSyncBadge('error');
      }
    }
  }

  // --- FIREBASE INITIALIZATION & GOOGLE AUTH ---
  initFirebase() {
    let config = null;
    const configStr = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (configStr) {
      try {
        config = JSON.parse(configStr);
      } catch (e) {}
    }

    if (!config || !config.apiKey) {
      config = DEFAULT_FIREBASE_CONFIG;
    }

    try {
      if (!window.firebase || !config.apiKey) {
        this.updateSyncBadge('local');
        return;
      }

      if (!firebase.apps.length) {
        this.firebaseApp = firebase.initializeApp(config);
      } else {
        this.firebaseApp = firebase.app();
      }

      this.auth = firebase.auth();
      this.db = firebase.firestore();

      // Listen for auth changes
      this.auth.onAuthStateChanged(user => {
        this.currentUser = user;
        this.handleAuthChange(user);
      });
    } catch (e) {
      console.error("Error setting up Firebase:", e);
      this.updateSyncBadge('error');
    }
  }

  handleAuthChange(user) {
    const authBtn = document.getElementById('google-auth-btn');
    const userProfileEl = document.getElementById('user-profile-display');

    if (user) {
      this.isCloudConnected = true;
      this.data.profile.email = user.email || '';
      this.data.profile.name = user.displayName || 'Google User';
      this.data.profile.photoURL = user.photoURL || '';
      
      this.updateSyncBadge('online');
      this.listenToCloudData(user.uid);

      if (authBtn) {
        authBtn.innerHTML = `
          <img src="${user.photoURL || 'https://via.placeholder.com/28'}" class="w-6 h-6 rounded-full border border-white dark:border-slate-700" alt="Avatar"/>
          <span class="hidden md:inline font-medium text-xs">${user.displayName ? user.displayName.split(' ')[0] : 'Account'}</span>
          <span class="text-xs text-red-500 font-bold ml-1" title="Sign Out">✕</span>
        `;
        authBtn.onclick = () => this.signOut();
      }

      if (userProfileEl) {
        userProfileEl.innerHTML = `
          <div class="flex items-center gap-3">
            <img src="${user.photoURL || 'https://via.placeholder.com/48'}" class="w-12 h-12 rounded-full border-2 border-blue-500" alt="Avatar"/>
            <div>
              <p class="font-bold text-sm text-gray-900 dark:text-white">${user.displayName || 'Google User'}</p>
              <p class="text-xs text-gray-500">${user.email}</p>
              <span class="inline-flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 font-semibold mt-0.5">
                <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Cloud Sync Active
              </span>
            </div>
          </div>
        `;
      }
    } else {
      this.isCloudConnected = false;
      if (this.unsubscribeFirestore) {
        this.unsubscribeFirestore();
        this.unsubscribeFirestore = null;
      }
      this.updateSyncBadge('local');

      if (authBtn) {
        authBtn.innerHTML = `
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span class="hidden md:inline font-medium text-xs">Sign in with Google</span>
        `;
        authBtn.onclick = () => this.signInWithGoogle();
      }

      if (userProfileEl) {
        userProfileEl.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold text-lg">
              ${this.data.profile.name ? this.data.profile.name[0] : 'G'}
            </div>
            <div>
              <p class="font-bold text-sm text-gray-900 dark:text-white">${this.data.profile.name || 'Local User'}</p>
              <p class="text-xs text-gray-500">Offline Local Storage Mode</p>
              <button onclick="cloudStore.signInWithGoogle()" class="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-0.5">
                Sign in with Google for Cross-Device Sync
              </button>
            </div>
          </div>
        `;
      }
    }
  }

  async signInWithGoogle() {
    if (!this.auth) {
      this.showFirebaseConfigModal();
      return;
    }
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await this.auth.signInWithPopup(provider);
    } catch (e) {
      console.error("Google sign in failed:", e);
      alert("Sign-in note: " + e.message + "\n\nIf you haven't entered your Firebase project configuration yet, please configure it in Settings.");
      this.showFirebaseConfigModal();
    }
  }

  async signOut() {
    if (this.auth) {
      await this.auth.signOut();
    }
  }

  listenToCloudData(uid) {
    if (!this.db) return;
    const docRef = this.db.collection('users').doc(uid).collection('gymData').doc('tracker');

    this.unsubscribeFirestore = docRef.onSnapshot(doc => {
      if (doc.exists) {
        const cloudData = doc.data();
        delete cloudData.updatedAt;
        // Merge cloud data
        this.data = { ...this.data, ...cloudData };
        this.saveLocal(this.data);
        this.notify();
      } else {
        // Upload initial local data to cloud
        this.save();
      }
    }, err => {
      console.error("Cloud listener error:", err);
    });
  }

  updateSyncBadge(status) {
    const badge = document.getElementById('cloud-sync-status');
    if (!badge) return;
    
    if (status === 'online' || status === 'synced') {
      badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-green-500"></span><span class="text-green-600 dark:text-green-400 font-medium">Synced Everywhere</span>`;
    } else if (status === 'error') {
      badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-500"></span><span class="text-red-500 font-medium">Sync Error</span>`;
    } else {
      badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-blue-400"></span><span class="text-gray-500 dark:text-gray-400 font-medium">Local Offline Ready</span>`;
    }
  }

  showFirebaseConfigModal() {
    const modal = document.getElementById('firebase-config-modal');
    if (modal) modal.classList.remove('hidden');
  }

  hideFirebaseConfigModal() {
    const modal = document.getElementById('firebase-config-modal');
    if (modal) modal.classList.add('hidden');
  }

  saveFirebaseConfig(configObj) {
    try {
      localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(configObj));
      this.hideFirebaseConfigModal();
      alert("Firebase configuration saved! Initializing Google Auth...");
      this.initFirebase();
      if (this.auth) {
        this.signInWithGoogle();
      }
    } catch (e) {
      alert("Invalid JSON configuration format.");
    }
  }

  // --- DATA BACKUP & EXPORT/IMPORT ---
  exportBackup() {
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `gym_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  importBackup(fileContent) {
    try {
      const parsed = JSON.parse(fileContent);
      if (parsed.workouts && parsed.attendance && parsed.finances) {
        this.data = parsed;
        this.save();
        alert("Backup imported successfully!");
      } else {
        alert("File does not contain valid Gym Tracker data.");
      }
    } catch (e) {
      alert("Failed to parse backup JSON file.");
    }
  }

  resetToSample() {
    if (confirm("Reset all workouts, attendance, and plans to sample data?")) {
      this.data = JSON.parse(JSON.stringify(INITIAL_SAMPLE_DATA));
      this.save();
    }
  }
}

window.cloudStore = new CloudStore();
