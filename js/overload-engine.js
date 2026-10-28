/**
 * IronPulse Biomechanical 1-Rep Max (1RM) & Progressive Overload Engine
 * Algorithmic modeling based on Epley, Brzycki & Lombardi equations.
 */

class OverloadEngineManager {
  constructor() {
    this.currentWeight = 80;
    this.currentReps = 8;
    this.currentExercise = 'Barbell Bench Press';
    this.currentCategory = 'upper'; // 'upper' or 'lower'
  }

  init() {
    this.renderDashboardWidget();
  }

  // --- ALGORITHMIC COMPUTATION ---
  calculate1RM(weight, reps) {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps) || 0;

    if (w <= 0 || r <= 0) return { epley: 0, brzycki: 0, lombardi: 0, consensus: 0 };
    if (r === 1) return { epley: w, brzycki: w, lombardi: w, consensus: w };

    // Epley Formula: w * (1 + r / 30)
    const epley = w * (1 + r / 30);

    // Brzycki Formula: w * (36 / (37 - r)) for r < 37
    const brzycki = r < 37 ? w * (36 / (37 - r)) : epley;

    // Lombardi Formula: w * (r ^ 0.10)
    const lombardi = w * Math.pow(r, 0.10);

    // Consensus Average (Weighted 50% Epley, 50% Brzycki)
    const consensus = (epley + brzycki) / 2;

    return {
      epley: Math.round(epley * 10) / 10,
      brzycki: Math.round(brzycki * 10) / 10,
      lombardi: Math.round(lombardi * 10) / 10,
      consensus: Math.round(consensus * 10) / 10
    };
  }

  // Calculate percentage working zones based on 1RM
  calculateZones(oneRM) {
    const percentages = [
      { pct: 95, reps: '1-2 Reps', focus: 'Max Effort PR', color: 'text-red-400' },
      { pct: 90, reps: '3-4 Reps', focus: 'Heavy Strength', color: 'text-orange-400' },
      { pct: 85, reps: '5-6 Reps', focus: 'Functional Power', color: 'text-amber-400' },
      { pct: 80, reps: '7-8 Reps', focus: 'Hypertrophy Core', color: 'text-[#dab978]' },
      { pct: 75, reps: '9-10 Reps', focus: 'Muscle Volume', color: 'text-yellow-300' },
      { pct: 70, reps: '10-12 Reps', focus: 'Hypertrophy Pump', color: 'text-blue-400' },
      { pct: 60, reps: '15-20 Reps', focus: 'Endurance / Metabolic', color: 'text-emerald-400' },
    ];

    return percentages.map(z => ({
      ...z,
      weight: Math.round((oneRM * (z.pct / 100)) * 2) / 2 // round to nearest 0.5
    }));
  }

  // Progressive Overload Next-Session Projection
  calculateOverloadProjection(weight, reps, category = 'upper') {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps) || 0;
    const isLower = category === 'lower';

    // Standard progressive overload step: +2.5kg for upper, +5kg for lower
    const increment = isLower ? 5.0 : 2.5;
    const targetWeight = w + increment;
    const fatigueVolume = w * r;
    const projectedVolume = targetWeight * Math.max(1, r - 1); // target 1 less rep with heavier weight

    return {
      increment,
      targetWeight,
      currentVolume: fatigueVolume,
      projectedVolume: Math.round(projectedVolume),
      stimulusIncrease: Math.round(((targetWeight / (w || 1)) - 1) * 100)
    };
  }

  // --- MODAL CONTROLLER ---
  openModal(prefillExercise = null, prefillWeight = null, prefillReps = null) {
    const modal = document.getElementById('overload-engine-modal');
    if (!modal) return;

    if (prefillExercise) this.currentExercise = prefillExercise;
    if (prefillWeight) this.currentWeight = prefillWeight;
    if (prefillReps) this.currentReps = prefillReps;

    const exInput = document.getElementById('overload-exercise-name');
    const wtInput = document.getElementById('overload-weight-input');
    const rpInput = document.getElementById('overload-reps-input');

    if (exInput) exInput.value = this.currentExercise;
    if (wtInput) wtInput.value = this.currentWeight;
    if (rpInput) rpInput.value = this.currentReps;

    modal.classList.remove('hidden');
    this.recalculateUI();
  }

  closeModal() {
    const modal = document.getElementById('overload-engine-modal');
    if (modal) modal.classList.add('hidden');
  }

  setPreset(exerciseName, weight, reps, category = 'upper') {
    this.currentExercise = exerciseName;
    this.currentWeight = weight;
    this.currentReps = reps;
    this.currentCategory = category;

    const exInput = document.getElementById('overload-exercise-name');
    const wtInput = document.getElementById('overload-weight-input');
    const rpInput = document.getElementById('overload-reps-input');

    if (exInput) exInput.value = exerciseName;
    if (wtInput) wtInput.value = weight;
    if (rpInput) rpInput.value = reps;

    this.recalculateUI();
  }

  recalculateUI() {
    const wtInput = document.getElementById('overload-weight-input');
    const rpInput = document.getElementById('overload-reps-input');

    const weight = parseFloat(wtInput ? wtInput.value : this.currentWeight) || 0;
    const reps = parseInt(rpInput ? rpInput.value : this.currentReps) || 0;
    const unit = (window.cloudStore && cloudStore.data.profile.weightUnit) || 'kg';

    const rm = this.calculate1RM(weight, reps);
    const zones = this.calculateZones(rm.consensus);
    const proj = this.calculateOverloadProjection(weight, reps, this.currentCategory);

    // Update Consensus 1RM
    const main1RMEl = document.getElementById('overload-main-1rm');
    if (main1RMEl) main1RMEl.textContent = `${rm.consensus} ${unit}`;

    // Update Epley & Brzycki Badges
    const epleyEl = document.getElementById('overload-epley-stat');
    const brzyckiEl = document.getElementById('overload-brzycki-stat');
    if (epleyEl) epleyEl.textContent = `${rm.epley} ${unit}`;
    if (brzyckiEl) brzyckiEl.textContent = `${rm.brzycki} ${unit}`;

    // Update Next Overload Target
    const targetEl = document.getElementById('overload-next-target');
    const stimulusEl = document.getElementById('overload-stimulus-pct');
    if (targetEl) targetEl.textContent = `+${proj.increment} ${unit} (${proj.targetWeight} ${unit})`;
    if (stimulusEl) stimulusEl.textContent = `+${proj.stimulusIncrease}% Intensity`;

    // Render Working Zones Table
    const zonesContainer = document.getElementById('overload-zones-list');
    if (zonesContainer) {
      zonesContainer.innerHTML = zones.map(z => `
        <div class="flex items-center justify-between p-2 rounded-xl bg-stone-100/70 dark:bg-[#16161f] border border-stone-200 dark:border-stone-800 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-10 text-center font-mono font-bold ${z.color}">${z.pct}%</span>
            <div>
              <p class="font-medium text-stone-900 dark:text-stone-200 font-sans leading-none">${z.focus}</p>
              <p class="text-[10px] text-stone-400 font-sans">${z.reps}</p>
            </div>
          </div>
          <span class="font-mono font-bold text-sm text-[#a88337] dark:text-[#dab978]">
            ${z.weight} <span class="text-xs text-stone-400">${unit}</span>
          </span>
        </div>
      `).join('');
    }
  }

  // --- DASHBOARD EMBEDDED WIDGET ---
  renderDashboardWidget() {
    const container = document.getElementById('dashboard-overload-widget');
    if (!container) return;

    const unit = (window.cloudStore && cloudStore.data.profile.weightUnit) || 'kg';
    const rm = this.calculate1RM(this.currentWeight, this.currentReps);
    const proj = this.calculateOverloadProjection(this.currentWeight, this.currentReps, 'upper');

    container.innerHTML = `
      <div class="flex items-center justify-between mb-3 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div class="flex items-center gap-2">
          <span class="text-lg">🧬</span>
          <div>
            <h4 class="font-brand font-bold text-sm text-stone-900 dark:text-white">1RM & Overload Algorithmic Engine</h4>
            <p class="text-[10px] text-stone-400 font-luxury uppercase tracking-wider">Epley-Brzycki Biomechanical Model</p>
          </div>
        </div>
        <button onclick="overloadEngine.openModal()" class="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#181822] hover:bg-[#dab978]/20 border border-stone-200 dark:border-[#dab978]/30 text-xs text-[#a88337] dark:text-[#dab978] font-luxury transition cursor-pointer">
          Launch Engine →
        </button>
      </div>

      <div class="grid grid-cols-3 gap-2.5 text-center">
        <div class="p-2.5 rounded-xl bg-stone-50 dark:bg-[#16161e] border border-stone-200 dark:border-stone-800">
          <p class="text-[10px] text-stone-400 font-luxury uppercase">Consensus 1RM</p>
          <p class="text-xl font-bold font-mono gold-gradient-text mt-0.5">${rm.consensus} ${unit}</p>
        </div>
        <div class="p-2.5 rounded-xl bg-stone-50 dark:bg-[#16161e] border border-stone-200 dark:border-stone-800">
          <p class="text-[10px] text-stone-400 font-luxury uppercase">Next PR Target</p>
          <p class="text-xl font-bold font-mono text-emerald-500 mt-0.5">${proj.targetWeight} ${unit}</p>
        </div>
        <div class="p-2.5 rounded-xl bg-stone-50 dark:bg-[#16161e] border border-stone-200 dark:border-stone-800">
          <p class="text-[10px] text-stone-400 font-luxury uppercase">Hypertrophy (75%)</p>
          <p class="text-xl font-bold font-mono text-blue-400 mt-0.5">${Math.round(rm.consensus * 0.75)} ${unit}</p>
        </div>
      </div>
    `;
  }
}

window.overloadEngine = new OverloadEngineManager();

document.addEventListener('DOMContentLoaded', () => {
  window.overloadEngine.init();
});
