/**
 * Workouts & Exercise Sets Tracker
 * Enhanced with Time, Day of Week, Multi-set Logging, and Day-by-Day Split View
 */

class WorkoutsManager {
  constructor() {
    this.currentEditingId = null;
    this.activeFilter = 'All';
    this.dayFilter = 'all'; // 'all' | 'today' | 'week'
    this.searchQuery = '';
  }

  init() {
    this.render();
    cloudStore.subscribe(() => this.render());
  }

  getDayName(dateStr) {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr + 'T00:00:00');
    return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  }

  getRelativeDayLabel(dateStr) {
    if (!dateStr) return '';
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    if (dateStr === todayStr) return 'Today';

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (dateStr === yesterdayStr) return 'Yesterday';

    const dateObj = new Date(dateStr + 'T00:00:00');
    const diffTime = today.setHours(0,0,0,0) - dateObj.setHours(0,0,0,0);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays < 7) {
      return `${diffDays} days ago`;
    }
    return '';
  }

  formatTimeDisplay(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 => 12
    return `${hours}:${minutes} ${ampm}`;
  }

  updateDayBadge() {
    const dateInput = document.getElementById('workout-form-date');
    const badge = document.getElementById('workout-form-day-badge');
    if (dateInput && badge) {
      const val = dateInput.value;
      if (val) {
        badge.textContent = this.getDayName(val);
      } else {
        badge.textContent = '--';
      }
    }
  }

  quickSetTitle(title) {
    const titleInput = document.getElementById('workout-form-title');
    if (titleInput) {
      titleInput.value = title;
    }
  }

  setDayFilter(filter) {
    this.dayFilter = filter;
    document.querySelectorAll('.day-filter-btn').forEach(btn => {
      if (btn.dataset.dayFilter === filter) {
        btn.classList.add('bg-blue-600', 'text-white');
        btn.classList.remove('text-gray-600', 'dark:text-gray-400');
      } else {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('text-gray-600', 'dark:text-gray-400');
      }
    });
    this.render();
  }

  setFilter(filter) {
    this.activeFilter = filter;
    document.querySelectorAll('.workout-filter-btn').forEach(btn => {
      if (btn.dataset.filter === filter) {
        btn.classList.add('bg-blue-600', 'text-white');
        btn.classList.remove('bg-gray-100', 'dark:bg-slate-800', 'text-gray-700', 'dark:text-gray-300');
      } else {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-100', 'dark:bg-slate-800', 'text-gray-700', 'dark:text-gray-300');
      }
    });
    this.render();
  }

  setSearch(q) {
    this.searchQuery = q;
    this.render();
  }

  getWorkoutsThisWeekCount(workouts) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    return workouts.filter(w => {
      const wDate = new Date(w.date + 'T00:00:00');
      return wDate >= monday;
    }).length;
  }

  render() {
    const listContainer = document.getElementById('workouts-list-container');
    const statsContainer = document.getElementById('workouts-stats-container');
    const dashboardRecent = document.getElementById('dashboard-recent-workouts');
    
    const workouts = cloudStore.data.workouts || [];

    // Render Stats
    const totalWorkouts = workouts.length;
    let totalSets = 0;
    let totalVolume = 0;
    
    workouts.forEach(w => {
      (w.exercises || []).forEach(ex => {
        const setsCount = Number(ex.sets) || 0;
        const repsCount = Number(ex.reps) || 0;
        const weightVal = Number(ex.weight) || 0;
        totalSets += setsCount;
        totalVolume += (setsCount * repsCount * weightVal);
      });
    });

    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="theme-card p-4">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Workouts</p>
            <p class="text-2xl font-bold font-lexend mt-1 text-blue-600 dark:text-blue-400">${totalWorkouts}</p>
          </div>
          <div class="theme-card p-4">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Sets Logged</p>
            <p class="text-2xl font-bold font-lexend mt-1 text-emerald-600 dark:text-emerald-400">${totalSets}</p>
          </div>
          <div class="theme-card p-4">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Volume Lifted</p>
            <p class="text-2xl font-bold font-lexend mt-1 text-purple-600 dark:text-purple-400">${totalVolume.toLocaleString()} <span class="text-xs text-gray-500">${cloudStore.data.profile.weightUnit || 'kg'}</span></p>
          </div>
          <div class="theme-card p-4">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">This Week</p>
            <p class="text-2xl font-bold font-lexend mt-1 text-amber-500">${this.getWorkoutsThisWeekCount(workouts)} <span class="text-xs text-gray-500">sessions</span></p>
          </div>
        </div>
      `;
    }

    // Filter by Date (Day Split Filter)
    const todayStr = new Date().toISOString().split('T')[0];
    let filtered = [...workouts].sort((a, b) => {
      // Sort primarily by date desc, then by time desc
      const dateCmp = new Date(b.date) - new Date(a.date);
      if (dateCmp !== 0) return dateCmp;
      return (b.time || '').localeCompare(a.time || '');
    });

    if (this.dayFilter === 'today') {
      filtered = filtered.filter(w => w.date === todayStr);
    } else if (this.dayFilter === 'week') {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);
      filtered = filtered.filter(w => new Date(w.date + 'T00:00:00') >= monday);
    }

    // Filter by Muscle Group
    if (this.activeFilter !== 'All') {
      filtered = filtered.filter(w => (w.muscleGroup || '').toLowerCase() === this.activeFilter.toLowerCase());
    }

    // Filter by Search Query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(w => 
        (w.title && w.title.toLowerCase().includes(q)) ||
        (w.muscleGroup && w.muscleGroup.toLowerCase().includes(q)) ||
        (w.exercises && w.exercises.some(e => e.name && e.name.toLowerCase().includes(q)))
      );
    }

    // Render Workouts Grouped by Days (Day Split View)
    if (listContainer) {
      if (filtered.length === 0) {
        listContainer.innerHTML = `
          <div class="theme-card p-12 text-center text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <p class="font-medium text-base">No workouts found for this selection.</p>
            <p class="text-xs text-gray-500 mt-1">Log your workout session with time, day, and multiple sets using the button above.</p>
          </div>
        `;
      } else {
        // Group workouts by date
        const groupsByDate = {};
        filtered.forEach(w => {
          const d = w.date || 'Unknown Date';
          if (!groupsByDate[d]) groupsByDate[d] = [];
          groupsByDate[d].push(w);
        });

        const sortedDates = Object.keys(groupsByDate).sort((a, b) => new Date(b) - new Date(a));

        listContainer.innerHTML = sortedDates.map(dateStr => {
          const dayWorkouts = groupsByDate[dateStr];
          const dayName = this.getDayName(dateStr);
          const relativeLabel = this.getRelativeDayLabel(dateStr);
          
          let daySets = 0;
          let dayVolume = 0;
          dayWorkouts.forEach(w => {
            (w.exercises || []).forEach(ex => {
              const s = Number(ex.sets) || 0;
              const r = Number(ex.reps) || 0;
              const wt = Number(ex.weight) || 0;
              daySets += s;
              dayVolume += (s * r * wt);
            });
          });

          const unit = cloudStore.data.profile.weightUnit || 'kg';

          return `
            <div class="day-split-group space-y-3 pt-2 pb-4">
              <!-- Day Split Section Header -->
              <div class="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-slate-800/90 dark:to-indigo-950/30 border border-blue-100/80 dark:border-slate-700/80">
                <div class="flex items-center gap-2.5">
                  <span class="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    📅
                  </span>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="font-bold text-sm text-gray-900 dark:text-white font-lexend">${dayName}</h3>
                      <span class="text-xs font-mono text-gray-500 dark:text-gray-400">(${dateStr})</span>
                      ${relativeLabel ? `
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${relativeLabel === 'Today' ? 'bg-emerald-500 text-white' : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'}">
                          ${relativeLabel}
                        </span>
                      ` : ''}
                    </div>
                    <p class="text-[11px] text-gray-500 dark:text-gray-400">
                      ${dayWorkouts.length} ${dayWorkouts.length === 1 ? 'Session' : 'Sessions'} completed
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2 text-xs">
                  <div class="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium border border-gray-200/50 dark:border-slate-700">
                    <span class="font-bold text-blue-600 dark:text-blue-400">${daySets}</span> Sets
                  </div>
                  <div class="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium border border-gray-200/50 dark:border-slate-700">
                    <span class="font-bold text-purple-600 dark:text-purple-400">${dayVolume.toLocaleString()}</span> ${unit} Vol
                  </div>
                </div>
              </div>

              <!-- Workouts inside this Day -->
              <div class="space-y-3 pl-1 sm:pl-3 border-l-2 border-blue-200 dark:border-slate-700 ml-3">
                ${dayWorkouts.map(w => this.renderWorkoutCard(w)).join('')}
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Render Dashboard Snippet (Latest 2 workouts)
    if (dashboardRecent) {
      const recentTwo = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 2);
      if (recentTwo.length === 0) {
        dashboardRecent.innerHTML = `<p class="text-xs text-gray-400 text-center py-4">No recent workouts logged.</p>`;
      } else {
        dashboardRecent.innerHTML = recentTwo.map(w => `
          <div class="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  ${w.muscleGroup || 'Full Body'}
                </span>
                <span class="text-xs text-gray-400">
                  ${this.getDayName(w.date)}, ${w.date} ${w.time ? '• ⏰ ' + this.formatTimeDisplay(w.time) : ''}
                </span>
              </div>
              <h4 class="font-bold text-sm text-gray-900 dark:text-white mt-1 font-advercase">${w.title}</h4>
              <p class="text-xs text-gray-500 mt-0.5">
                ${(w.exercises || []).length} exercises • ${(w.exercises || []).reduce((acc, ex) => acc + (Number(ex.sets)||0), 0)} total sets
              </p>
            </div>
            <button onclick="workoutsManager.openEditModal('${w.id}')" class="text-xs text-blue-600 dark:text-blue-400 font-semibold px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-slate-700 transition">
              View
            </button>
          </div>
        `).join('');
      }
    }
  }

  renderWorkoutCard(w) {
    const unit = cloudStore.data.profile.weightUnit || 'kg';
    const dayName = this.getDayName(w.date);
    const timeFormatted = this.formatTimeDisplay(w.time || '10:00');

    const exercisesHtml = (w.exercises || []).map((ex, idx) => `
      <div class="py-2 px-3 rounded-lg bg-gray-50/70 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">
            ${idx + 1}
          </span>
          <span class="font-semibold text-gray-800 dark:text-gray-200">${ex.name}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-2 py-0.5 rounded bg-white dark:bg-slate-700 font-mono font-bold text-gray-700 dark:text-gray-300">
            ${ex.sets} sets × ${ex.reps} reps
          </span>
          <span class="font-mono text-blue-600 dark:text-blue-400 font-bold">
            ${ex.weight} ${unit}
          </span>
          <button onclick="clockTimer.startRestTimer(90)" title="Start 90s Rest Timer" class="text-orange-500 hover:text-orange-600 p-1 rounded hover:bg-orange-50 dark:hover:bg-slate-700 transition cursor-pointer">
            ⏱️
          </button>
        </div>
      </div>
    `).join('');

    return `
      <div class="theme-card p-5 mb-2 hover:shadow-md transition">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-slate-800">
          <div>
            <div class="flex items-center flex-wrap gap-2">
              <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                ${w.muscleGroup || 'Full Body'}
              </span>
              <span class="text-xs text-gray-500 font-semibold flex items-center gap-1">
                <span>🗓️</span> ${dayName}, ${w.date}
              </span>
              ${w.time ? `
                <span class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 flex items-center gap-1">
                  <span>⏰</span> ${timeFormatted}
                </span>
              ` : ''}
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mt-1 font-advercase tracking-tight">
              ${w.title}
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="workoutsManager.openEditModal('${w.id}')" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition">
              Edit
            </button>
            <button onclick="workoutsManager.deleteWorkout('${w.id}')" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 transition">
              Delete
            </button>
          </div>
        </div>

        <div class="space-y-2 mt-3.5">
          ${exercisesHtml}
        </div>

        ${w.notes ? `
          <div class="mt-3 pt-2 text-xs text-gray-500 dark:text-gray-400 italic">
            💭 "${w.notes}"
          </div>
        ` : ''}
      </div>
    `;
  }

  getCurrentTimeHHMM() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  openCreateModal() {
    this.currentEditingId = null;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    document.getElementById('workout-modal-title').textContent = "Log New Workout";
    document.getElementById('workout-form-date').value = todayStr;
    document.getElementById('workout-form-time').value = this.getCurrentTimeHHMM();
    document.getElementById('workout-form-title').value = "";
    document.getElementById('workout-form-muscle').value = "Chest";
    document.getElementById('workout-form-notes').value = "";
    this.updateDayBadge();

    // Clear and add 1 default exercise row
    const exercisesContainer = document.getElementById('workout-exercises-input-list');
    exercisesContainer.innerHTML = "";
    this.addExerciseInputRow("Barbell Bench Press", 4, 8, 70);

    document.getElementById('workout-modal').classList.remove('hidden');
  }

  openEditModal(id) {
    const workout = (cloudStore.data.workouts || []).find(w => w.id === id);
    if (!workout) return;

    this.currentEditingId = id;
    document.getElementById('workout-modal-title').textContent = "Edit Workout";
    document.getElementById('workout-form-date').value = workout.date;
    document.getElementById('workout-form-time').value = workout.time || this.getCurrentTimeHHMM();
    document.getElementById('workout-form-title').value = workout.title;
    document.getElementById('workout-form-muscle').value = workout.muscleGroup || "Chest";
    document.getElementById('workout-form-notes').value = workout.notes || "";
    this.updateDayBadge();

    const exercisesContainer = document.getElementById('workout-exercises-input-list');
    exercisesContainer.innerHTML = "";
    if (workout.exercises && workout.exercises.length > 0) {
      workout.exercises.forEach(ex => {
        this.addExerciseInputRow(ex.name, ex.sets, ex.reps, ex.weight);
      });
    } else {
      this.addExerciseInputRow("", 3, 10, 20);
    }

    document.getElementById('workout-modal').classList.remove('hidden');
  }

  closeModal() {
    document.getElementById('workout-modal').classList.add('hidden');
    this.currentEditingId = null;
  }

  addExerciseInputRow(name = "", sets = 3, reps = 10, weight = 20) {
    const container = document.getElementById('workout-exercises-input-list');
    const rowId = 'ex-row-' + Date.now() + '-' + Math.floor(Math.random()*1000);
    const div = document.createElement('div');
    div.id = rowId;
    div.className = "grid grid-cols-12 gap-2 items-center p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700";
    div.innerHTML = `
      <div class="col-span-5">
        <input type="text" placeholder="Exercise name" value="${name}" class="ex-name-input input-theme w-full text-xs py-1 px-2" required />
      </div>
      <div class="col-span-2">
        <input type="number" min="1" placeholder="Sets" value="${sets}" class="ex-sets-input input-theme w-full text-xs py-1 px-2 text-center" required />
      </div>
      <div class="col-span-2">
        <input type="number" min="1" placeholder="Reps" value="${reps}" class="ex-reps-input input-theme w-full text-xs py-1 px-2 text-center" required />
      </div>
      <div class="col-span-2">
        <input type="number" step="0.5" min="0" placeholder="Weight" value="${weight}" class="ex-weight-input input-theme w-full text-xs py-1 px-2 text-center" required />
      </div>
      <div class="col-span-1 text-center">
        <button type="button" onclick="document.getElementById('${rowId}').remove()" class="text-red-500 hover:text-red-700 text-sm font-bold">✕</button>
      </div>
    `;
    container.appendChild(div);
  }

  saveModalForm() {
    const date = document.getElementById('workout-form-date').value;
    const time = document.getElementById('workout-form-time').value || this.getCurrentTimeHHMM();
    const title = document.getElementById('workout-form-title').value.trim() || 'Workout Session';
    const muscleGroup = document.getElementById('workout-form-muscle').value;
    const notes = document.getElementById('workout-form-notes').value.trim();

    const rows = document.querySelectorAll('#workout-exercises-input-list > div');
    const exercises = [];
    rows.forEach(row => {
      const name = row.querySelector('.ex-name-input').value.trim();
      const sets = parseInt(row.querySelector('.ex-sets-input').value, 10) || 1;
      const reps = parseInt(row.querySelector('.ex-reps-input').value, 10) || 1;
      const weight = parseFloat(row.querySelector('.ex-weight-input').value) || 0;
      if (name) {
        exercises.push({ name, sets, reps, weight, completed: true });
      }
    });

    if (exercises.length === 0) {
      alert("Please add at least one exercise with sets and reps.");
      return;
    }

    if (!cloudStore.data.workouts) cloudStore.data.workouts = [];

    if (this.currentEditingId) {
      // Update
      const index = cloudStore.data.workouts.findIndex(w => w.id === this.currentEditingId);
      if (index !== -1) {
        cloudStore.data.workouts[index] = {
          ...cloudStore.data.workouts[index],
          date,
          time,
          title,
          muscleGroup,
          notes,
          exercises
        };
      }
    } else {
      // Create new
      const newWorkout = {
        id: 'w-' + Date.now(),
        date,
        time,
        title,
        muscleGroup,
        notes,
        exercises
      };
      cloudStore.data.workouts.unshift(newWorkout);

      // Automatically mark attendance for that date if not already marked!
      if (!cloudStore.data.attendance) cloudStore.data.attendance = {};
      cloudStore.data.attendance[date] = true;
    }

    cloudStore.save();
    this.closeModal();
  }

  deleteWorkout(id) {
    if (confirm("Are you sure you want to delete this workout?")) {
      cloudStore.data.workouts = (cloudStore.data.workouts || []).filter(w => w.id !== id);
      cloudStore.save();
    }
  }
}

window.workoutsManager = new WorkoutsManager();
