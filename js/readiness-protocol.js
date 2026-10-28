/**
 * IronPulse Athletic Readiness & Daily Circadian Protocol Timeline
 * Combines subjective neuromuscular fatigue assessment with daily athlete habit scheduling.
 */

class ReadinessProtocolManager {
  constructor() {
    this.defaultProtocols = [
      { id: 'proto-hydrate', time: '07:30 AM', icon: '💧', title: 'Hydration & Electrolytes', hint: '500ml filtered water + pinch of sea salt for adrenal priming.' },
      { id: 'proto-fuel', time: '12:30 PM', icon: '🥗', title: 'Pre-Workout Nutrient Loading', hint: 'Clean complex carbohydrates + 30g lean protein.' },
      { id: 'proto-prime', time: '04:30 PM', icon: '⚡', title: 'Neuromuscular Warmup & Priming', hint: 'Dynamic joint mobility & optional clean pre-workout.' },
      { id: 'proto-lift', time: '05:30 PM', icon: '🏋️', title: 'Scheduled Strength Session', hint: 'Execute planned routine with active rest intervals.', action: 'log-workout' },
      { id: 'proto-protein', time: '07:00 PM', icon: '🥤', title: 'Post-Workout Anabolic Synthesis', hint: 'Fast-acting whey isolate / high leucine meal window.' },
      { id: 'proto-sleep', time: '11:00 PM', icon: '🌙', title: 'Deep Sleep & Hypertrophy Recovery', hint: 'Dark cool room, 8 hours recovery for testosterone & GH release.' },
    ];
  }

  init() {
    this.renderDashboardTimeline();
    this.renderReadinessWidget();
  }

  getTodayDateStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // --- DAILY PROTOCOL CONTROLLER ---
  toggleProtocolItem(protoId) {
    if (!window.cloudStore) return;
    if (!cloudStore.data.dailyProtocol) cloudStore.data.dailyProtocol = {};

    const todayStr = this.getTodayDateStr();
    if (!cloudStore.data.dailyProtocol[todayStr]) cloudStore.data.dailyProtocol[todayStr] = {};

    const cur = Boolean(cloudStore.data.dailyProtocol[todayStr][protoId]);
    cloudStore.data.dailyProtocol[todayStr][protoId] = !cur;

    if (!cur) {
      if (window.triggerHaptic) window.triggerHaptic('light');

      // Check if all protocols are completed
      const allDone = this.defaultProtocols.every(p => cloudStore.data.dailyProtocol[todayStr][p.id]);
      if (allDone && window.triggerCelebration) {
        window.triggerCelebration();
      }
    }

    cloudStore.save();
    this.renderDashboardTimeline();
  }

  renderDashboardTimeline() {
    const container = document.getElementById('dashboard-circadian-timeline');
    if (!container) return;

    const todayStr = this.getTodayDateStr();
    const completedMap = (window.cloudStore && cloudStore.data.dailyProtocol && cloudStore.data.dailyProtocol[todayStr]) || {};

    let doneCount = 0;
    this.defaultProtocols.forEach(p => {
      if (completedMap[p.id]) doneCount++;
    });

    const pct = Math.round((doneCount / this.defaultProtocols.length) * 100);

    const itemsHtml = this.defaultProtocols.map(p => {
      const isDone = Boolean(completedMap[p.id]);
      return `
        <div onclick="readinessProtocol.toggleProtocolItem('${p.id}')" 
             class="flex items-center justify-between p-3 rounded-xl transition cursor-pointer border ${
               isDone 
                 ? 'bg-[#dab978]/15 dark:bg-[#dab978]/10 border-[#dab978]/50 text-stone-900 dark:text-[#f8f7f4]' 
                 : 'bg-stone-50 dark:bg-[#15151e] border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-700'
             }">
          <div class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold border transition ${
              isDone 
                ? 'bg-[#dab978] text-[#08080a] border-[#dab978]' 
                : 'bg-stone-100 dark:bg-[#1e1e28] text-stone-400 border-stone-300 dark:border-stone-700'
            }">
              ${isDone ? '✓' : ''}
            </span>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm">${p.icon}</span>
                <p class="font-medium text-xs font-sans ${isDone ? 'line-through text-stone-400' : ''}">${p.title}</p>
              </div>
              <p class="text-[10px] text-stone-400 font-sans font-light mt-0.5">${p.hint}</p>
            </div>
          </div>
          <span class="font-mono text-[11px] font-bold text-[#a88337] dark:text-[#dab978] whitespace-nowrap pl-2">
            ${p.time}
          </span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="flex items-center justify-between pb-3 mb-3 border-b border-stone-200 dark:border-stone-800">
        <div class="flex items-center gap-2">
          <span class="text-lg">⏱️</span>
          <div>
            <h4 class="font-brand font-bold text-sm text-stone-900 dark:text-white">Daily Athlete Circadian Protocol</h4>
            <p class="text-[10px] text-stone-400 font-luxury uppercase tracking-wider">Circadian Lifestyle & Performance Flow</p>
          </div>
        </div>
        <div class="flex items-center gap-2 text-xs font-luxury">
          <span class="text-[10px] text-stone-400 uppercase">Adherence:</span>
          <span class="font-mono font-bold text-[#dab978]">${doneCount}/${this.defaultProtocols.length} (${pct}%)</span>
        </div>
      </div>

      <!-- Protocol Progress Bar -->
      <div class="w-full h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden mb-3">
        <div class="h-full bg-gradient-to-r from-[#dfba75] to-[#b5893d] transition-all duration-500" style="width: ${pct}%"></div>
      </div>

      <div class="space-y-2">
        ${itemsHtml}
      </div>
    `;
  }

  // --- ATHLETIC READINESS CONTROLLER ---
  openReadinessModal() {
    const modal = document.getElementById('readiness-check-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
  }

  closeReadinessModal() {
    const modal = document.getElementById('readiness-check-modal');
    if (!modal) return;
    modal.classList.add('hidden');
  }

  calculateReadiness(sleep = 8, freshness = 8, energy = 8) {
    const s = Math.max(1, Math.min(10, parseFloat(sleep) || 8));
    const f = Math.max(1, Math.min(10, parseFloat(freshness) || 8));
    const e = Math.max(1, Math.min(10, parseFloat(energy) || 8));

    // Weighted Formula: 40% Sleep, 35% Muscle Freshness, 25% Subjective Energy
    const rawScore = (s * 0.40 + f * 0.35 + e * 0.25) * 10;
    const finalScore = Math.round(rawScore);

    let level = 'optimal';
    let label = 'Peak CNS Readiness';
    let recommendation = 'Optimal autonomic recovery. Prime condition for heavy compound PR attempts and maximum intensity overload.';
    let color = 'text-[#dab978]';
    let badgeBg = 'bg-[#dab978]/20 text-[#dab978] border-[#dab978]/40';

    if (finalScore >= 85) {
      level = 'peak';
      label = 'Peak CNS Readiness 🚀';
      recommendation = 'Optimal central nervous system state. Heavy compound PR attempts (1-5 rep range) and high volume overload recommended.';
      color = 'text-[#dab978]';
      badgeBg = 'bg-[#dab978]/20 text-[#dab978] border-[#dab978]/40';
    } else if (finalScore >= 70) {
      level = 'optimal';
      label = 'Optimal Hypertrophy Stimulus ⚡';
      recommendation = 'Solid neuromuscular capacity. Execute standard hypertrophy protocols (8-12 reps) with progressive overload.';
      color = 'text-blue-400';
      badgeBg = 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    } else if (finalScore >= 50) {
      level = 'moderate';
      label = 'Moderate Recovery Capacity ⚖️';
      recommendation = 'Mild systemic fatigue detected. Favor machine isolation movements over heavy spinal loading today.';
      color = 'text-amber-400';
      badgeBg = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    } else {
      level = 'deload';
      label = 'Active Recovery Protocol 🛡️';
      recommendation = 'Elevated neuromuscular fatigue. Recommend active mobility, light cardio, foam rolling, and nutrient re-feed.';
      color = 'text-red-400';
      badgeBg = 'bg-red-500/20 text-red-400 border-red-500/40';
    }

    return { score: finalScore, level, label, recommendation, color, badgeBg, sleep: s, freshness: f, energy: e };
  }

  saveReadiness() {
    const sleepVal = document.getElementById('readiness-sleep-slider').value;
    const freshVal = document.getElementById('readiness-freshness-slider').value;
    const energyVal = document.getElementById('readiness-energy-slider').value;

    const data = this.calculateReadiness(sleepVal, freshVal, energyVal);
    const todayStr = this.getTodayDateStr();

    if (!cloudStore.data.readiness) cloudStore.data.readiness = {};
    cloudStore.data.readiness[todayStr] = data;
    cloudStore.save();

    this.closeReadinessModal();
    this.renderReadinessWidget();

    if (window.triggerHaptic) window.triggerHaptic('success');
  }

  renderReadinessWidget() {
    const container = document.getElementById('dashboard-readiness-card');
    if (!container) return;

    const todayStr = this.getTodayDateStr();
    const stored = (window.cloudStore && cloudStore.data.readiness && cloudStore.data.readiness[todayStr]) || this.calculateReadiness(8, 8, 8);

    container.innerHTML = `
      <div class="flex items-center justify-between pb-3 mb-3 border-b border-stone-200 dark:border-stone-800">
        <div class="flex items-center gap-2">
          <span class="text-lg">⚡</span>
          <div>
            <h4 class="font-brand font-bold text-sm text-stone-900 dark:text-white">Athletic Readiness Score</h4>
            <p class="text-[10px] text-stone-400 font-luxury uppercase tracking-wider">Daily Neuromuscular Recovery Index</p>
          </div>
        </div>
        <button onclick="readinessProtocol.openReadinessModal()" class="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#181822] hover:bg-[#dab978]/20 border border-stone-200 dark:border-[#dab978]/30 text-xs text-[#a88337] dark:text-[#dab978] font-luxury transition cursor-pointer">
          Audit Today ✎
        </button>
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-4">
        <!-- Radial Gauge Indicator -->
        <div class="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path class="text-stone-200 dark:text-stone-800" stroke-width="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path class="text-[#dab978] transition-all duration-1000 ease-out" stroke-dasharray="${stored.score}, 100" stroke-width="3.5" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-xl font-bold font-mono text-stone-900 dark:text-[#f8f7f4] leading-none">${stored.score}%</span>
            <span class="text-[9px] uppercase tracking-wider text-[#dab978] font-luxury font-bold mt-0.5">READINESS</span>
          </div>
        </div>

        <div class="space-y-1.5 flex-1">
          <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-luxury font-bold border ${stored.badgeBg}">
            ${stored.label}
          </span>
          <p class="text-xs text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
            ${stored.recommendation}
          </p>
          <div class="flex items-center gap-3 text-[11px] text-stone-400 font-mono pt-0.5">
            <span>Sleep: ${stored.sleep}/10</span>
            <span>•</span>
            <span>Freshness: ${stored.freshness}/10</span>
            <span>•</span>
            <span>Energy: ${stored.energy}/10</span>
          </div>
        </div>
      </div>
    `;
  }
}

window.readinessProtocol = new ReadinessProtocolManager();

document.addEventListener('DOMContentLoaded', () => {
  window.readinessProtocol.init();
});
