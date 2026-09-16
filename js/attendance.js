/**
 * Gym Attendance & Streak Tracker
 */

class AttendanceManager {
  constructor() {
    this.currentDate = new Date();
    this.selectedYear = this.currentDate.getFullYear();
    this.selectedMonth = this.currentDate.getMonth(); // 0-indexed
  }

  init() {
    this.render();
    cloudStore.subscribe(() => this.render());
  }

  render() {
    this.renderCalendar();
    this.renderStats();
    this.renderDashboardCard();
  }

  // Calculate current streak
  calculateStreak() {
    const attendance = cloudStore.data.attendance || {};
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStr = today.toISOString().split('T')[0];
    let checkDate = new Date(today);

    // If today is checked, count today. If not, start check from yesterday
    if (attendance[todayStr]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (attendance[yesterdayStr]) {
        streak++;
        checkDate = yesterday;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        return 0;
      }
    }

    // Check consecutive prior days
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (attendance[dateStr]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  renderStats() {
    const attendance = cloudStore.data.attendance || {};
    const streak = this.calculateStreak();
    
    // Count days this month
    const yearMonth = `${this.selectedYear}-${String(this.selectedMonth + 1).padStart(2, '0')}`;
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
    
    let thisMonthCount = 0;
    Object.keys(attendance).forEach(dateStr => {
      if (dateStr.startsWith(yearMonth) && attendance[dateStr]) {
        thisMonthCount++;
      }
    });

    const consistencyPct = Math.round((thisMonthCount / daysInMonth) * 100);

    // Total this year
    let thisYearCount = 0;
    const yearPrefix = `${this.selectedYear}-`;
    Object.keys(attendance).forEach(dateStr => {
      if (dateStr.startsWith(yearPrefix) && attendance[dateStr]) {
        thisYearCount++;
      }
    });

    const statsContainer = document.getElementById('attendance-stats-container');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div class="theme-card p-4">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">Current Streak</p>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-2xl font-bold font-lexend text-orange-500">${streak}</span>
              <span class="text-xs text-gray-500">days 🔥</span>
            </div>
          </div>
          <div class="theme-card p-4">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">This Month</p>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-2xl font-bold font-lexend text-emerald-600 dark:text-emerald-400">${thisMonthCount}</span>
              <span class="text-xs text-gray-500">/ ${daysInMonth} days</span>
            </div>
          </div>
          <div class="theme-card p-4">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">Consistency Rate</p>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-2xl font-bold font-lexend text-blue-600 dark:text-blue-400">${consistencyPct}%</span>
            </div>
          </div>
          <div class="theme-card p-4">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">${this.selectedYear} Total Gym Days</p>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-2xl font-bold font-lexend text-purple-600 dark:text-purple-400">${thisYearCount}</span>
              <span class="text-xs text-gray-500">sessions</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  renderCalendar() {
    const calendarContainer = document.getElementById('attendance-calendar-grid');
    const monthTitle = document.getElementById('calendar-month-title');
    if (!calendarContainer) return;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (monthTitle) {
      monthTitle.textContent = `${monthNames[this.selectedMonth]} ${this.selectedYear}`;
    }

    const firstDayIndex = new Date(this.selectedYear, this.selectedMonth, 1).getDay();
    const totalDays = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
    const prevMonthDays = new Date(this.selectedYear, this.selectedMonth, 0).getDate();

    const attendance = cloudStore.data.attendance || {};
    const todayStr = new Date().toISOString().split('T')[0];

    let html = '';

    // Day of week headers
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const headerRow = weekDays.map(d => `
      <div class="text-center font-bold text-[11px] text-gray-400 uppercase tracking-wider py-1.5">${d}</div>
    `).join('');

    // Previous month padding days
    let paddingHtml = '';
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      paddingHtml += `
        <div class="day-cell other-month p-2">
          <span class="text-xs text-gray-300 dark:text-gray-600 font-medium">${prevMonthDays - i}</span>
        </div>
      `;
    }

    // Current month days
    let daysHtml = '';
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${this.selectedYear}-${String(this.selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isAttended = Boolean(attendance[dateStr]);
      const isToday = dateStr === todayStr;

      daysHtml += `
        <div onclick="attendanceManager.toggleDate('${dateStr}')" 
             class="day-cell ${isAttended ? 'attended' : ''} ${isToday ? 'today' : ''} p-2 cursor-pointer select-none group"
             title="${dateStr}: Click to toggle attendance">
          <span class="text-xs font-semibold ${isAttended ? 'text-white' : 'text-gray-700 dark:text-gray-300'}">${day}</span>
          ${isAttended ? `
            <span class="text-[11px] mt-0.5 animate-scale">💪</span>
          ` : `
            <span class="text-[9px] text-gray-300 dark:text-gray-600 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 mt-0.5">+</span>
          `}
        </div>
      `;
    }

    calendarContainer.innerHTML = headerRow + paddingHtml + daysHtml;
  }

  renderDashboardCard() {
    const card = document.getElementById('dashboard-attendance-card');
    if (!card) return;

    const streak = this.calculateStreak();
    const todayStr = new Date().toISOString().split('T')[0];
    const isTodayChecked = Boolean((cloudStore.data.attendance || {})[todayStr]);

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">Gym Attendance Streak</p>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-2xl font-bold font-lexend text-orange-500">${streak}</span>
            <span class="text-xs font-medium text-gray-600 dark:text-gray-300">Days Consecutive 🔥</span>
          </div>
        </div>
        <button onclick="attendanceManager.toggleToday()" class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
          isTodayChecked 
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
        }">
          <span>${isTodayChecked ? '✓ Checked In (Click to Uncheck)' : '+ Check In Today'}</span>
        </button>
      </div>
    `;
  }

  prevMonth() {
    if (this.selectedMonth === 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.render();
  }

  nextMonth() {
    if (this.selectedMonth === 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.render();
  }

  goToToday() {
    const today = new Date();
    this.selectedYear = today.getFullYear();
    this.selectedMonth = today.getMonth();
    this.render();
  }

  toggleDate(dateStr) {
    if (!cloudStore.data.attendance) cloudStore.data.attendance = {};
    if (cloudStore.data.attendance[dateStr]) {
      delete cloudStore.data.attendance[dateStr];
    } else {
      cloudStore.data.attendance[dateStr] = true;
    }
    cloudStore.save();
    this.render();
  }

  toggleToday() {
    const todayStr = new Date().toISOString().split('T')[0];
    this.toggleDate(todayStr);
  }
}

window.attendanceManager = new AttendanceManager();
