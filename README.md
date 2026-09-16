# IronPulse | Gym, Workout, Attendance & Nutrition Tracker

A comprehensive, cloud-synced, multi-device fitness tracking application designed for dedicated athletes. Built with clean responsive design, Day/Night mode, custom typography (**Lexend** & **Advercase**), live clock, rest interval timer, and Firebase Google Cloud synchronization.

---

## ⚡ Key Features

1. **Workouts, Sets & Reps**:
   - Log exercises, custom sets, reps, and weights (kg/lbs).
   - Real-time calculation of total volume lifted and sets completed.
   - Fast search and muscle group filters (Chest, Back, Legs, Shoulders, Arms, Core, Full Body).
2. **Gym Attendance & Streaks**:
   - Monthly interactive attendance calendar with month-to-month navigation.
   - 1-click "Check In Today" toggle.
   - Consecutive attendance streak counter (🔥) and monthly consistency percentage.
3. **Gym Fees + Meals & Nutrition Tracker**:
   - Separate expense tracking for **Gym Fees** (memberships, personal trainer, lockers) vs. **Meals Fees** (protein powders, groceries, meal preps).
   - Visual ratio progress bar comparing gym expenses vs. nutrition expenses.
   - Status tracking (`Paid`, `Pending`, `Overdue`).
4. **Yearly, Monthly & Weekly Plans**:
   - 3-tier planning framework (Annual transformation benchmarks, monthly milestones, weekly splits).
   - Interactive milestone checklists that automatically update goal progress percentages (% complete).
5. **Universal Multi-Device Access & Google Account Login**:
   - Cloud-synced via Firebase Authentication (Google Sign-In) and Cloud Firestore.
   - Offline-first fallback engine with LocalStorage ensures data persists and works without internet connection.
6. **Dedicated Multi-Page Router**:
   - Clean Single Page Application (SPA) architecture with distinct views for Dashboard, Workouts, Attendance, Finances, Plans, Timer, and Settings.
   - Responsive design with desktop navigation tabs and mobile slide-out drawer.
7. **Motivational Quotes on Every Refresh**:
   - Curated library of 24+ high-impact fitness and discipline quotes that automatically displays a new quote on each page refresh or button tap.
8. **Day Mode & Night Mode**:
   - Athletic high-contrast dark theme and crisp daytime light mode with local persistence.
9. **Built-in Clock, Date & Training Timers**:
   - Persistent live digital clock with seconds (12h/24h toggle) and full date display.
   - Workout rest countdown timer with Web Audio API synthesized chimes.
   - Training stopwatch with lap split recording.

---

## ☁️ Cloud Sync & Deployment

### Firebase Deployment
1. Install Firebase tools:
   ```powershell
   npm install -g firebase-tools
   ```
2. Deploy to global hosting:
   ```powershell
   firebase login
   firebase deploy
   ```

---

## 📄 License
OPEN SOURCE. 
Built with ❤️ for athletes.
