/**
 * Workouts & Exercise Sets Tracker
 */

class WorkoutsManager {
  constructor() {
    this.currentEditingId = null;
    this.activeFilter = 'All';
    this.searchQuery = '';
  }

  init() {
    this.render();
    cloudStore.subscribe(() => this.render());
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

    // Filter & Search
    let filtered = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (this.activeFilter !== 'All') {
      filtered = filtered.filter(w => (w.muscleGroup || '').toLowerCase() === this.activeFilter.toLowerCase());
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(w => 
        (w.title && w.title.toLowerCase().includes(q)) ||
        (w.exercises && w.exercises.some(e => e.name && e.name.toLowerCase().includes(q)))
      );
    }

    // Render Workouts List
    if (listContainer) {
      if (filtered.length === 0) {
        listContainer.innerHTML = `
          <div class="theme-card p-12 text-center text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <p class="font-medium text-base">No workouts found.</p>
            <p class="text-xs text-gray-500 mt-1">Log your workout, sets, and reps using the button above.</p>
          </div>
        `;
      } else {
        listContainer.innerHTML = filtered.map(w => this.renderWorkoutCard(w)).join('');
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
                <span class="text-xs text-gray-400">${w.date}</span>
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

  getWorkoutsThisWeekCount(workouts) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    return workouts.filter(w => {
      const wDate = new Date(w.date);
      return wDate >= monday;
    }).length;
  }

  renderWorkoutCard(w) {
    const unit = cloudStore.data.profile.weightUnit || 'kg';
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
      <div class="theme-card p-5 mb-4 hover:shadow-md transition">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                ${w.muscleGroup || 'Full Body'}
              </span>
              <span class="text-xs text-gray-500 font-medium">📅 ${w.date}</span>
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

  openCreateModal() {
    this.currentEditingId = null;
    document.getElementById('workout-modal-title').textContent = "Log New Workout";
    document.getElementById('workout-form-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('workout-form-title').value = "";
    document.getElementById('workout-form-muscle').value = "Chest";
    document.getElementById('workout-form-notes').value = "";
    
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
    document.getElementById('workout-form-title').value = workout.title;
    document.getElementById('workout-form-muscle').value = workout.muscleGroup || "Chest";
    document.getElementById('workout-form-notes').value = workout.notes || "";

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
