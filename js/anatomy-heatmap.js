/**
 * IronPulse Interactive Muscular Anatomy Heatmap
 * Visualizes weekly muscular volume and stimulus distribution using SVG data mapping.
 */

class AnatomyHeatmapManager {
  constructor() {
    this.currentView = 'front'; // 'front' or 'back'
    this.selectedMuscle = null;
    this.muscleData = {};
  }

  init() {
    this.calculateWeeklyVolume();
    this.renderHeatmap();
    if (window.cloudStore) {
      window.cloudStore.subscribe(() => {
        this.calculateWeeklyVolume();
        this.renderHeatmap();
      });
    }
  }

  // --- VOLUME AGGREGATION ALGORITHM ---
  calculateWeeklyVolume() {
    const workouts = (window.cloudStore && cloudStore.data.workouts) || [];
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Default structure for key muscle zones
    const zones = {
      chest: { name: 'Chest (Pectorals)', sets: 0, target: '12-18 sets', exercises: ['Bench Press', 'Incline DB Press', 'Chest Flyes'] },
      back: { name: 'Back & Lats (Latissimus Dorsi)', sets: 0, target: '14-20 sets', exercises: ['Lat Pulldowns', 'Barbell Rows', 'Pull-ups'] },
      shoulders: { name: 'Shoulders (Deltoids)', sets: 0, target: '12-16 sets', exercises: ['Overhead Press', 'Lateral Raises', 'Face Pulls'] },
      biceps: { name: 'Biceps (Brachii)', sets: 0, target: '10-14 sets', exercises: ['Barbell Curls', 'Incline Dumbbell Curls', 'Hammer Curls'] },
      triceps: { name: 'Triceps (Brachii)', sets: 0, target: '10-14 sets', exercises: ['Tricep Pushdowns', 'Skull Crushers', 'Dips'] },
      abs: { name: 'Core & Abdominals', sets: 0, target: '8-12 sets', exercises: ['Hanging Leg Raises', 'Cable Crunches', 'Planks'] },
      quads: { name: 'Quadriceps (Legs)', sets: 0, target: '12-18 sets', exercises: ['Barbell Squats', 'Leg Press', 'Bulgarian Split Squats'] },
      hamstrings: { name: 'Hamstrings & Glutes', sets: 0, target: '10-16 sets', exercises: ['Romanian Deadlifts', 'Leg Curls', 'Hip Thrusts'] },
      calves: { name: 'Calves (Gastrocnemius)', sets: 0, target: '8-12 sets', exercises: ['Standing Calf Raises', 'Seated Calf Raises'] },
      traps: { name: 'Trapezius & Upper Back', sets: 0, target: '8-12 sets', exercises: ['Deadlifts', 'Dumbbell Shrugs', 'Rack Pulls'] },
    };

    workouts.forEach(w => {
      const workoutDate = new Date(w.date);
      if (workoutDate >= sevenDaysAgo) {
        const mg = (w.muscleGroup || '').toLowerCase();
        const title = (w.title || '').toLowerCase();

        (w.exercises || []).forEach(ex => {
          const exName = (ex.name || '').toLowerCase();
          const setCount = Array.isArray(ex.setsData) ? ex.setsData.length : (Number(ex.sets) || 3);

          if (mg.includes('chest') || title.includes('chest') || exName.includes('bench') || exName.includes('chest') || exName.includes('push')) {
            zones.chest.sets += setCount;
          }
          if (mg.includes('back') || title.includes('back') || exName.includes('row') || exName.includes('pull') || exName.includes('lat')) {
            zones.back.sets += setCount;
          }
          if (mg.includes('shoulder') || title.includes('shoulder') || exName.includes('press') || exName.includes('delt')) {
            zones.shoulders.sets += setCount;
          }
          if (exName.includes('bicep') || exName.includes('curl')) {
            zones.biceps.sets += setCount;
          }
          if (exName.includes('tricep') || exName.includes('pushdown') || exName.includes('dip')) {
            zones.triceps.sets += setCount;
          }
          if (mg.includes('leg') || title.includes('leg') || exName.includes('squat') || exName.includes('quad')) {
            zones.quads.sets += setCount;
          }
          if (exName.includes('deadlift') || exName.includes('hamstring') || exName.includes('rdl') || exName.includes('glute')) {
            zones.hamstrings.sets += setCount;
          }
          if (exName.includes('calf') || exName.includes('calves')) {
            zones.calves.sets += setCount;
          }
          if (mg.includes('core') || exName.includes('ab') || exName.includes('plank')) {
            zones.abs.sets += setCount;
          }
          if (exName.includes('shrug') || exName.includes('trap')) {
            zones.traps.sets += setCount;
          }
        });
      }
    });

    this.muscleData = zones;
  }

  // Determine heat color gradient based on sets logged
  getHeatColor(sets) {
    if (sets === 0) return { fill: '#1b1b24', stroke: '#2e2e3e', glow: false, label: 'Dormant (0 sets)' };
    if (sets <= 6) return { fill: '#7a5a22', stroke: '#9b732d', glow: false, label: 'Low Stimulus' };
    if (sets <= 14) return { fill: '#b5893d', stroke: '#dab978', glow: false, label: 'Moderate Stimulus' };
    if (sets <= 22) return { fill: '#dab978', stroke: '#f7e8c5', glow: true, label: 'Optimal Hypertrophy 🔥' };
    return { fill: '#d9534f', stroke: '#ff6b6b', glow: true, label: 'High Fatigue Threshold ⚠️' };
  }

  toggleView() {
    this.currentView = this.currentView === 'front' ? 'back' : 'front';
    this.renderHeatmap();
  }

  selectMuscle(muscleKey) {
    this.selectedMuscle = muscleKey;
    const data = this.muscleData[muscleKey];
    if (!data) return;

    const infoEl = document.getElementById('heatmap-muscle-info');
    if (!infoEl) return;

    const heat = this.getHeatColor(data.sets);

    infoEl.innerHTML = `
      <div class="p-3.5 rounded-xl bg-stone-100 dark:bg-[#16161f] border border-stone-200 dark:border-[#dab978]/30 space-y-2 animate-spring-in">
        <div class="flex items-center justify-between">
          <h4 class="font-brand font-bold text-sm text-stone-900 dark:text-[#f8f7f4]">${data.name}</h4>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-luxury font-bold uppercase tracking-wider" style="background-color: ${heat.fill}33; color: ${heat.fill}; border: 1px solid ${heat.stroke}">
            ${heat.label}
          </span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold font-mono gold-gradient-text">${data.sets}</span>
          <span class="text-xs text-stone-400">sets completed past 7 days (Target: ${data.target})</span>
        </div>
        <div class="pt-1 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-400">
          <span class="font-medium text-stone-300 font-luxury uppercase tracking-wider text-[10px]">Optimal Compounds:</span>
          <span>${data.exercises.join(' • ')}</span>
        </div>
      </div>
    `;

    if (window.triggerHaptic) window.triggerHaptic('light');
  }

  renderHeatmap() {
    const container = document.getElementById('anatomy-heatmap-container');
    if (!container) return;

    const isFront = this.currentView === 'front';
    const c = this.muscleData;

    // Heat definitions
    const hChest = this.getHeatColor(c.chest ? c.chest.sets : 0);
    const hBack = this.getHeatColor(c.back ? c.back.sets : 0);
    const hShoulders = this.getHeatColor(c.shoulders ? c.shoulders.sets : 0);
    const hBiceps = this.getHeatColor(c.biceps ? c.biceps.sets : 0);
    const hTriceps = this.getHeatColor(c.triceps ? c.triceps.sets : 0);
    const hAbs = this.getHeatColor(c.abs ? c.abs.sets : 0);
    const hQuads = this.getHeatColor(c.quads ? c.quads.sets : 0);
    const hHamstrings = this.getHeatColor(c.hamstrings ? c.hamstrings.sets : 0);
    const hCalves = this.getHeatColor(c.calves ? c.calves.sets : 0);
    const hTraps = this.getHeatColor(c.traps ? c.traps.sets : 0);

    let svgHtml = '';

    if (isFront) {
      // ANTERIOR (FRONT) VIEW SVG
      svgHtml = `
        <svg viewBox="0 0 200 320" class="w-full max-w-[240px] mx-auto filter drop-shadow-md">
          <!-- Head / Neck -->
          <circle cx="100" cy="28" r="16" fill="#1e1e28" stroke="#333344" stroke-width="1.2" />
          <path d="M92 44 L108 44 L106 58 L94 58 Z" fill="#1e1e28" stroke="#333344" stroke-width="1" />

          <!-- Shoulders (Deltoids - Front) -->
          <g onclick="anatomyHeatmap.selectMuscle('shoulders')" class="cursor-pointer transition-opacity hover:opacity-80" title="Shoulders">
            <path d="M72 58 C62 60 52 70 54 86 C64 88 74 76 76 66 Z" fill="${hShoulders.fill}" stroke="${hShoulders.stroke}" stroke-width="1.2" />
            <path d="M128 58 C138 60 148 70 146 86 C136 88 126 76 124 66 Z" fill="${hShoulders.fill}" stroke="${hShoulders.stroke}" stroke-width="1.2" />
          </g>

          <!-- Chest (Pectorals) -->
          <g onclick="anatomyHeatmap.selectMuscle('chest')" class="cursor-pointer transition-opacity hover:opacity-80" title="Chest">
            <path d="M76 64 C86 64 96 70 98 88 C88 94 72 88 68 80 C68 70 72 64 76 64 Z" fill="${hChest.fill}" stroke="${hChest.stroke}" stroke-width="1.2" ${hChest.glow ? 'filter="drop-shadow(0 0 6px #dab978)"' : ''} />
            <path d="M124 64 C114 64 104 70 102 88 C112 94 128 88 132 80 C132 70 128 64 124 64 Z" fill="${hChest.fill}" stroke="${hChest.stroke}" stroke-width="1.2" ${hChest.glow ? 'filter="drop-shadow(0 0 6px #dab978)"' : ''} />
          </g>

          <!-- Biceps & Arms -->
          <g onclick="anatomyHeatmap.selectMuscle('biceps')" class="cursor-pointer transition-opacity hover:opacity-80" title="Biceps">
            <path d="M52 86 C46 96 46 112 52 122 C56 120 60 106 60 92 Z" fill="${hBiceps.fill}" stroke="${hBiceps.stroke}" stroke-width="1" />
            <path d="M148 86 C154 96 154 112 148 122 C144 120 140 106 140 92 Z" fill="${hBiceps.fill}" stroke="${hBiceps.stroke}" stroke-width="1" />
            <!-- Forearms -->
            <path d="M50 124 C44 136 40 152 46 164 C50 162 56 146 54 132 Z" fill="#22222e" stroke="#333344" stroke-width="1" />
            <path d="M150 124 C156 136 160 152 154 164 C150 162 144 146 146 132 Z" fill="#22222e" stroke="#333344" stroke-width="1" />
          </g>

          <!-- Core / Abdominals -->
          <g onclick="anatomyHeatmap.selectMuscle('abs')" class="cursor-pointer transition-opacity hover:opacity-80" title="Core">
            <rect x="86" y="92" width="12" height="12" rx="3" fill="${hAbs.fill}" stroke="${hAbs.stroke}" stroke-width="1" />
            <rect x="102" y="92" width="12" height="12" rx="3" fill="${hAbs.fill}" stroke="${hAbs.stroke}" stroke-width="1" />
            <rect x="86" y="108" width="12" height="12" rx="3" fill="${hAbs.fill}" stroke="${hAbs.stroke}" stroke-width="1" />
            <rect x="102" y="108" width="12" height="12" rx="3" fill="${hAbs.fill}" stroke="${hAbs.stroke}" stroke-width="1" />
            <rect x="88" y="124" width="11" height="12" rx="3" fill="${hAbs.fill}" stroke="${hAbs.stroke}" stroke-width="1" />
            <rect x="101" y="124" width="11" height="12" rx="3" fill="${hAbs.fill}" stroke="${hAbs.stroke}" stroke-width="1" />
          </g>

          <!-- Pelvis / Hips -->
          <path d="M80 140 L120 140 L114 160 L86 160 Z" fill="#1b1b24" stroke="#2e2e3e" stroke-width="1" />

          <!-- Quadriceps (Upper Legs) -->
          <g onclick="anatomyHeatmap.selectMuscle('quads')" class="cursor-pointer transition-opacity hover:opacity-80" title="Quads">
            <path d="M82 164 C70 178 68 214 74 238 C86 240 94 210 96 172 Z" fill="${hQuads.fill}" stroke="${hQuads.stroke}" stroke-width="1.2" ${hQuads.glow ? 'filter="drop-shadow(0 0 6px #dab978)"' : ''} />
            <path d="M118 164 C130 178 132 214 126 238 C114 240 106 210 104 172 Z" fill="${hQuads.fill}" stroke="${hQuads.stroke}" stroke-width="1.2" ${hQuads.glow ? 'filter="drop-shadow(0 0 6px #dab978)"' : ''} />
          </g>

          <!-- Knees & Calves -->
          <circle cx="82" cy="245" r="5" fill="#22222e" stroke="#333344" stroke-width="1" />
          <circle cx="118" cy="245" r="5" fill="#22222e" stroke="#333344" stroke-width="1" />

          <g onclick="anatomyHeatmap.selectMuscle('calves')" class="cursor-pointer transition-opacity hover:opacity-80" title="Calves">
            <path d="M78 252 C72 266 74 290 80 306 C84 306 88 285 86 256 Z" fill="${hCalves.fill}" stroke="${hCalves.stroke}" stroke-width="1" />
            <path d="M122 252 C128 266 126 290 120 306 C116 306 112 285 114 256 Z" fill="${hCalves.fill}" stroke="${hCalves.stroke}" stroke-width="1" />
          </g>
        </svg>
      `;
    } else {
      // POSTERIOR (BACK) VIEW SVG
      svgHtml = `
        <svg viewBox="0 0 200 320" class="w-full max-w-[240px] mx-auto filter drop-shadow-md">
          <!-- Head / Neck -->
          <circle cx="100" cy="28" r="16" fill="#1e1e28" stroke="#333344" stroke-width="1.2" />

          <!-- Traps & Upper Back -->
          <g onclick="anatomyHeatmap.selectMuscle('traps')" class="cursor-pointer transition-opacity hover:opacity-80" title="Trapezius">
            <path d="M92 44 L108 44 L126 62 L100 82 L74 62 Z" fill="${hTraps.fill}" stroke="${hTraps.stroke}" stroke-width="1.2" />
          </g>

          <!-- Rear Deltoids -->
          <g onclick="anatomyHeatmap.selectMuscle('shoulders')" class="cursor-pointer transition-opacity hover:opacity-80" title="Rear Delts">
            <path d="M72 60 C62 62 52 74 54 88 C64 88 74 78 76 68 Z" fill="${hShoulders.fill}" stroke="${hShoulders.stroke}" stroke-width="1" />
            <path d="M128 60 C138 62 148 74 146 88 C136 88 126 78 124 68 Z" fill="${hShoulders.fill}" stroke="${hShoulders.stroke}" stroke-width="1" />
          </g>

          <!-- Latissimus Dorsi (Lats) -->
          <g onclick="anatomyHeatmap.selectMuscle('back')" class="cursor-pointer transition-opacity hover:opacity-80" title="Lats">
            <path d="M74 66 C70 82 72 108 84 130 C90 130 96 100 100 84 Z" fill="${hBack.fill}" stroke="${hBack.stroke}" stroke-width="1.2" ${hBack.glow ? 'filter="drop-shadow(0 0 6px #dab978)"' : ''} />
            <path d="M126 66 C130 82 128 108 116 130 C110 130 104 100 100 84 Z" fill="${hBack.fill}" stroke="${hBack.stroke}" stroke-width="1.2" ${hBack.glow ? 'filter="drop-shadow(0 0 6px #dab978)"' : ''} />
          </g>

          <!-- Triceps -->
          <g onclick="anatomyHeatmap.selectMuscle('triceps')" class="cursor-pointer transition-opacity hover:opacity-80" title="Triceps">
            <path d="M52 86 C46 96 46 114 52 124 C56 120 60 108 60 92 Z" fill="${hTriceps.fill}" stroke="${hTriceps.stroke}" stroke-width="1" />
            <path d="M148 86 C154 96 154 114 148 124 C144 120 140 108 140 92 Z" fill="${hTriceps.fill}" stroke="${hTriceps.stroke}" stroke-width="1" />
          </g>

          <!-- Lower Back & Glutes -->
          <g onclick="anatomyHeatmap.selectMuscle('hamstrings')" class="cursor-pointer transition-opacity hover:opacity-80" title="Glutes">
            <path d="M84 132 L116 132 L118 166 C108 174 100 170 100 170 C100 170 92 174 82 166 Z" fill="${hHamstrings.fill}" stroke="${hHamstrings.stroke}" stroke-width="1.2" />
          </g>

          <!-- Hamstrings -->
          <g onclick="anatomyHeatmap.selectMuscle('hamstrings')" class="cursor-pointer transition-opacity hover:opacity-80" title="Hamstrings">
            <path d="M82 172 C72 188 70 216 76 238 C86 238 94 212 96 178 Z" fill="${hHamstrings.fill}" stroke="${hHamstrings.stroke}" stroke-width="1.2" />
            <path d="M118 172 C128 188 130 216 124 238 C114 238 106 212 104 178 Z" fill="${hHamstrings.fill}" stroke="${hHamstrings.stroke}" stroke-width="1.2" />
          </g>

          <!-- Calves (Back View Gastrocnemius) -->
          <g onclick="anatomyHeatmap.selectMuscle('calves')" class="cursor-pointer transition-opacity hover:opacity-80" title="Calves">
            <path d="M78 250 C68 266 72 292 80 306 C86 306 90 286 86 254 Z" fill="${hCalves.fill}" stroke="${hCalves.stroke}" stroke-width="1.2" />
            <path d="M122 250 C132 266 128 292 120 306 C114 306 110 286 114 254 Z" fill="${hCalves.fill}" stroke="${hCalves.stroke}" stroke-width="1.2" />
          </g>
        </svg>
      `;
    }

    container.innerHTML = `
      <div class="flex items-center justify-between pb-3 mb-3 border-b border-stone-200 dark:border-stone-800">
        <div class="flex items-center gap-2">
          <span class="text-lg">🗺️</span>
          <div>
            <h4 class="font-brand font-bold text-sm text-stone-900 dark:text-white">Muscular Anatomy Heatmap</h4>
            <p class="text-[10px] text-stone-400 font-luxury uppercase tracking-wider">7-Day Hypertrophy Volume Distribution</p>
          </div>
        </div>
        <button onclick="anatomyHeatmap.toggleView()" class="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#181822] hover:bg-[#dab978]/20 border border-stone-200 dark:border-[#dab978]/30 text-xs text-[#a88337] dark:text-[#dab978] font-luxury transition cursor-pointer flex items-center gap-1.5">
          <span>🔄</span>
          <span>View: ${isFront ? 'Back' : 'Front'}</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <!-- SVG Interactive Body -->
        <div class="p-3 rounded-2xl bg-stone-50/50 dark:bg-[#0c0c10] border border-stone-200 dark:border-stone-800 flex flex-col items-center">
          ${svgHtml}
          <div class="flex items-center gap-3 mt-3 text-[10px] text-stone-400 font-luxury flex-wrap justify-center">
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#1b1b24] border border-[#333]"></span> 0 sets</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#856a31]"></span> 1-6</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#dab978] shadow-xs shadow-[#dab978]"></span> 12-18 (Optimal 🔥)</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#d9534f]"></span> >20</span>
          </div>
        </div>

        <!-- Muscle Info & Breakdown -->
        <div class="space-y-3">
          <div id="heatmap-muscle-info">
            <div class="p-3.5 rounded-xl bg-stone-100/60 dark:bg-[#16161f] border border-stone-200 dark:border-stone-800 text-center py-6">
              <span class="text-2xl mb-1 block">👆</span>
              <p class="text-xs text-stone-400 font-sans">Tap any highlighted muscle zone on the body map to audit weekly stimulus volume.</p>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-stone-50 dark:bg-[#13131a] border border-stone-200 dark:border-stone-800 text-xs space-y-1.5">
            <div class="flex justify-between items-center text-[11px] font-luxury text-stone-400">
              <span>Weekly Stimulus Quotient</span>
              <span class="text-[#dab978] font-bold">Volume Balanced</span>
            </div>
            <p class="text-[11px] text-stone-400 font-sans font-light leading-relaxed">
              Based on Dr. Mike Israetel's Hypertrophy Volume Landmarks (MEV / MAV / MRV). Target 12–18 sets per week for peak progressive overload.
            </p>
          </div>
        </div>
      </div>
    `;
  }
}

window.anatomyHeatmap = new AnatomyHeatmapManager();

document.addEventListener('DOMContentLoaded', () => {
  window.anatomyHeatmap.init();
});
