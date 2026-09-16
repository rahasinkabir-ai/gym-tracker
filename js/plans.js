/**
 * Yearly, Monthly & Weekly Plans & Progress Tracker
 */

class PlansManager {
  constructor() {
    this.activeTab = 'weekly'; // 'weekly', 'monthly', 'yearly'
    this.currentEditingId = null;
    this.currentEditingTier = null;
  }

  init() {
    this.render();
    cloudStore.subscribe(() => this.render());
  }

  render() {
    this.renderTierPlans('weekly');
    this.renderTierPlans('monthly');
    this.renderTierPlans('yearly');
    this.renderDashboardGoals();
  }

  renderTierPlans(tier) {
    const container = document.getElementById(`plans-${tier}-container`);
    if (!container) return;

    const plans = (cloudStore.data.plans && cloudStore.data.plans[tier]) || [];

    if (plans.length === 0) {
      container.innerHTML = `
        <div class="theme-card p-10 text-center text-gray-400">
          <p class="font-medium text-sm">No ${tier} plans established yet.</p>
          <button onclick="plansManager.openCreateModal('${tier}')" class="mt-3 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
            + Add First ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = plans.map(p => {
      const checklist = p.checklist || [];
      const doneCount = checklist.filter(c => c.done).length;
      const totalCount = checklist.length;
      const calculatedPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : (p.progress || 0);

      const checklistHtml = checklist.map((item, idx) => `
        <label class="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300 py-1 cursor-pointer select-none">
          <input type="checkbox" ${item.done ? 'checked' : ''} 
                 onchange="plansManager.toggleChecklistItem('${tier}', '${p.id}', ${idx})" 
                 class="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer" />
          <span class="${item.done ? 'line-through text-gray-400 dark:text-gray-500' : 'font-medium'}">${item.text}</span>
        </label>
      `).join('');

      return `
        <div class="theme-card p-5 mb-4 hover:shadow-md transition">
          <div class="flex items-start justify-between gap-3 mb-2">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                  ${tier.toUpperCase()}
                </span>
                ${p.targetDate ? `<span class="text-xs text-gray-400">Target: ${p.targetDate}</span>` : ''}
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mt-1 font-advercase">
                ${p.title}
              </h3>
            </div>
            <div class="flex items-center gap-1.5">
              <button onclick="plansManager.openEditModal('${tier}', '${p.id}')" class="px-2.5 py-1 text-xs font-semibold rounded bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition">
                Edit
              </button>
              <button onclick="plansManager.deletePlan('${tier}', '${p.id}')" class="px-2.5 py-1 text-xs font-semibold rounded text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 transition">
                ✕
              </button>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="my-3">
            <div class="flex justify-between items-center text-xs mb-1">
              <span class="font-medium text-gray-500 dark:text-gray-400">Progress</span>
              <span class="font-bold text-blue-600 dark:text-blue-400 font-mono">${calculatedPct}%</span>
            </div>
            <div class="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div style="width: ${calculatedPct}%" class="h-full bg-linear-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-300"></div>
            </div>
          </div>

          <!-- Checklist -->
          ${checklist.length > 0 ? `
            <div class="mt-3 pt-2 border-t border-gray-100 dark:border-slate-800 space-y-1">
              <div class="flex justify-between items-center text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                <span>Milestones (${doneCount}/${totalCount})</span>
              </div>
              ${checklistHtml}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  renderDashboardGoals() {
    const card = document.getElementById('dashboard-active-goals');
    if (!card) return;

    const weekly = (cloudStore.data.plans && cloudStore.data.plans.weekly) || [];
    const monthly = (cloudStore.data.plans && cloudStore.data.plans.monthly) || [];
    const all = [...weekly, ...monthly];

    if (all.length === 0) {
      card.innerHTML = `<p class="text-xs text-gray-400 text-center py-4">No active targets set.</p>`;
      return;
    }

    const topGoals = all.slice(0, 2);
    card.innerHTML = topGoals.map(g => {
      const checklist = g.checklist || [];
      const doneCount = checklist.filter(c => c.done).length;
      const pct = checklist.length > 0 ? Math.round((doneCount / checklist.length) * 100) : (g.progress || 0);

      return `
        <div class="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 mb-2">
          <div class="flex justify-between items-center text-xs">
            <span class="font-bold text-gray-900 dark:text-white font-advercase truncate pr-2">${g.title}</span>
            <span class="font-mono font-bold text-blue-600 dark:text-blue-400">${pct}%</span>
          </div>
          <div class="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
            <div style="width: ${pct}%" class="h-full bg-blue-600"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  switchTab(tier) {
    this.activeTab = tier;
    ['weekly', 'monthly', 'yearly'].forEach(t => {
      const tabBtn = document.getElementById(`tab-btn-${t}`);
      const section = document.getElementById(`plans-section-${t}`);
      if (t === tier) {
        if (tabBtn) {
          tabBtn.classList.add('bg-blue-600', 'text-white');
          tabBtn.classList.remove('text-gray-600', 'dark:text-gray-400', 'hover:bg-gray-100', 'dark:hover:bg-slate-800');
        }
        if (section) section.classList.remove('hidden');
      } else {
        if (tabBtn) {
          tabBtn.classList.remove('bg-blue-600', 'text-white');
          tabBtn.classList.add('text-gray-600', 'dark:text-gray-400', 'hover:bg-gray-100', 'dark:hover:bg-slate-800');
        }
        if (section) section.classList.add('hidden');
      }
    });
  }

  toggleChecklistItem(tier, planId, itemIdx) {
    const plans = cloudStore.data.plans[tier];
    if (!plans) return;
    const plan = plans.find(p => p.id === planId);
    if (!plan || !plan.checklist || !plan.checklist[itemIdx]) return;

    plan.checklist[itemIdx].done = !plan.checklist[itemIdx].done;
    
    // Update progress percentage
    const done = plan.checklist.filter(c => c.done).length;
    plan.progress = Math.round((done / plan.checklist.length) * 100);

    cloudStore.save();
  }

  openCreateModal(tier = this.activeTab) {
    this.currentEditingId = null;
    this.currentEditingTier = tier;
    document.getElementById('plan-modal-title').textContent = `New ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`;
    document.getElementById('plan-form-tier').value = tier;
    document.getElementById('plan-form-title').value = "";
    document.getElementById('plan-form-target-date').value = "";
    
    const checklistContainer = document.getElementById('plan-checklist-inputs');
    checklistContainer.innerHTML = "";
    this.addChecklistInputRow("Step 1 milestone");
    this.addChecklistInputRow("Step 2 milestone");

    document.getElementById('plan-modal').classList.remove('hidden');
  }

  openEditModal(tier, id) {
    const plans = (cloudStore.data.plans && cloudStore.data.plans[tier]) || [];
    const plan = plans.find(p => p.id === id);
    if (!plan) return;

    this.currentEditingId = id;
    this.currentEditingTier = tier;
    document.getElementById('plan-modal-title').textContent = `Edit ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`;
    document.getElementById('plan-form-tier').value = tier;
    document.getElementById('plan-form-title').value = plan.title;
    document.getElementById('plan-form-target-date').value = plan.targetDate || "";

    const checklistContainer = document.getElementById('plan-checklist-inputs');
    checklistContainer.innerHTML = "";
    if (plan.checklist && plan.checklist.length > 0) {
      plan.checklist.forEach(c => this.addChecklistInputRow(c.text, c.done));
    } else {
      this.addChecklistInputRow("");
    }

    document.getElementById('plan-modal').classList.remove('hidden');
  }

  closeModal() {
    document.getElementById('plan-modal').classList.add('hidden');
    this.currentEditingId = null;
    this.currentEditingTier = null;
  }

  addChecklistInputRow(text = "", done = false) {
    const container = document.getElementById('plan-checklist-inputs');
    const rowId = 'check-row-' + Date.now() + '-' + Math.floor(Math.random()*1000);
    const div = document.createElement('div');
    div.id = rowId;
    div.className = "flex items-center gap-2 mb-2";
    div.innerHTML = `
      <input type="checkbox" ${done ? 'checked' : ''} class="plan-check-done w-4 h-4 rounded text-blue-600" />
      <input type="text" placeholder="Milestone / action item" value="${text}" class="plan-check-text input-theme text-xs flex-1 py-1 px-2" required />
      <button type="button" onclick="document.getElementById('${rowId}').remove()" class="text-red-500 hover:text-red-700 text-sm font-bold">✕</button>
    `;
    container.appendChild(div);
  }

  saveModalForm() {
    const tier = document.getElementById('plan-form-tier').value;
    const title = document.getElementById('plan-form-title').value.trim();
    const targetDate = document.getElementById('plan-form-target-date').value;

    if (!title) {
      alert("Please enter a plan title.");
      return;
    }

    const rows = document.querySelectorAll('#plan-checklist-inputs > div');
    const checklist = [];
    rows.forEach(r => {
      const text = r.querySelector('.plan-check-text').value.trim();
      const done = r.querySelector('.plan-check-done').checked;
      if (text) checklist.push({ text, done });
    });

    const doneCount = checklist.filter(c => c.done).length;
    const progress = checklist.length > 0 ? Math.round((doneCount / checklist.length) * 100) : 0;

    if (!cloudStore.data.plans) cloudStore.data.plans = { yearly: [], monthly: [], weekly: [] };
    if (!cloudStore.data.plans[tier]) cloudStore.data.plans[tier] = [];

    if (this.currentEditingId) {
      const idx = cloudStore.data.plans[tier].findIndex(p => p.id === this.currentEditingId);
      if (idx !== -1) {
        cloudStore.data.plans[tier][idx] = {
          ...cloudStore.data.plans[tier][idx],
          title,
          targetDate,
          checklist,
          progress
        };
      }
    } else {
      const newPlan = {
        id: `p${tier[0]}-` + Date.now(),
        title,
        targetDate,
        checklist,
        progress,
        status: 'active'
      };
      cloudStore.data.plans[tier].unshift(newPlan);
    }

    cloudStore.save();
    this.closeModal();
  }

  deletePlan(tier, id) {
    if (confirm("Delete this plan?")) {
      cloudStore.data.plans[tier] = (cloudStore.data.plans[tier] || []).filter(p => p.id !== id);
      cloudStore.save();
    }
  }
}

window.plansManager = new PlansManager();
