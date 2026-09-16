/**
 * Gym Fees & Meal Expense Tracker
 */

class FinancesManager {
  constructor() {
    this.currentEditingId = null;
    this.categoryFilter = 'all'; // 'all', 'gym', 'meal'
    this.statusFilter = 'all';   // 'all', 'paid', 'pending', 'overdue'
  }

  init() {
    this.render();
    cloudStore.subscribe(() => this.render());
  }

  render() {
    this.renderStats();
    this.renderList();
    this.renderDashboardSummary();
  }

  getCurrentMonthPrefix() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  renderStats() {
    const finances = cloudStore.data.finances || [];
    const currency = cloudStore.data.profile.currency || '$';
    const currentMonth = this.getCurrentMonthPrefix();

    let thisMonthGym = 0;
    let thisMonthMeal = 0;
    let thisMonthPending = 0;

    finances.forEach(f => {
      const amount = Number(f.amount) || 0;
      const isThisMonth = f.date && f.date.startsWith(currentMonth);

      if (isThisMonth) {
        if (f.category === 'gym') thisMonthGym += amount;
        if (f.category === 'meal') thisMonthMeal += amount;
        if (f.status === 'pending' || f.status === 'overdue') thisMonthPending += amount;
      }
    });

    const thisMonthTotal = thisMonthGym + thisMonthMeal;
    const gymPercent = thisMonthTotal > 0 ? Math.round((thisMonthGym / thisMonthTotal) * 100) : 0;
    const mealPercent = thisMonthTotal > 0 ? Math.round((thisMonthMeal / thisMonthTotal) * 100) : 0;

    const statsContainer = document.getElementById('finances-stats-container');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div class="theme-card p-4">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Spent This Month</p>
            <p class="text-2xl font-bold font-lexend mt-1 text-gray-900 dark:text-white">${currency}${thisMonthTotal.toFixed(2)}</p>
          </div>
          <div class="theme-card p-4 border-l-4 border-blue-500">
            <p class="text-xs font-semibold text-blue-600 dark:text-blue-400">🏋️ Gym Fees Total</p>
            <p class="text-2xl font-bold font-lexend mt-1 text-blue-600 dark:text-blue-400">${currency}${thisMonthGym.toFixed(2)}</p>
            <span class="text-[11px] text-gray-500">${gymPercent}% of total</span>
          </div>
          <div class="theme-card p-4 border-l-4 border-orange-500">
            <p class="text-xs font-semibold text-orange-600 dark:text-orange-400">🥗 Meals & Diet Fees</p>
            <p class="text-2xl font-bold font-lexend mt-1 text-orange-600 dark:text-orange-400">${currency}${thisMonthMeal.toFixed(2)}</p>
            <span class="text-[11px] text-gray-500">${mealPercent}% of total</span>
          </div>
          <div class="theme-card p-4 border-l-4 border-amber-500">
            <p class="text-xs font-semibold text-amber-600 dark:text-amber-400">⏳ Pending / Due</p>
            <p class="text-2xl font-bold font-lexend mt-1 text-amber-500">${currency}${thisMonthPending.toFixed(2)}</p>
            <span class="text-[11px] text-gray-500">Awaiting payment</span>
          </div>
        </div>

        <!-- Budget Visual Ratio Bar -->
        ${thisMonthTotal > 0 ? `
          <div class="theme-card p-3 mb-6">
            <div class="flex justify-between items-center text-xs font-semibold mb-1.5">
              <span class="text-blue-600 dark:text-blue-400">Gym Fees: ${gymPercent}%</span>
              <span class="text-orange-600 dark:text-orange-400">Meals & Diet: ${mealPercent}%</span>
            </div>
            <div class="w-full h-3 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden flex">
              <div style="width: ${gymPercent}%" class="bg-blue-600 transition-all duration-500"></div>
              <div style="width: ${mealPercent}%" class="bg-orange-500 transition-all duration-500"></div>
            </div>
          </div>
        ` : ''}
      `;
    }
  }

  renderList() {
    const listContainer = document.getElementById('finances-list-container');
    if (!listContainer) return;

    let finances = [...(cloudStore.data.finances || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    const currency = cloudStore.data.profile.currency || '$';

    if (this.categoryFilter !== 'all') {
      finances = finances.filter(f => f.category === this.categoryFilter);
    }
    if (this.statusFilter !== 'all') {
      finances = finances.filter(f => f.status === this.statusFilter);
    }

    if (finances.length === 0) {
      listContainer.innerHTML = `
        <div class="theme-card p-12 text-center text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="font-medium text-base">No fee logs found for this filter.</p>
          <p class="text-xs text-gray-500 mt-1">Record a gym membership or meal expense with the button above.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = finances.map(f => {
      const isGym = f.category === 'gym';
      const badgeClass = f.status === 'paid' ? 'badge-paid' : (f.status === 'pending' ? 'badge-pending' : 'badge-overdue');
      const statusLabel = f.status.charAt(0).toUpperCase() + f.status.slice(1);

      return `
        <div class="theme-card p-4 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
              isGym ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-600'
            }">
              ${isGym ? '🏋️' : '🥗'}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isGym ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400' : 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400'
                }">
                  ${isGym ? 'Gym Fee' : 'Meals Fee'}
                </span>
                <span class="text-xs text-gray-400">📅 ${f.date}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClass}">
                  ${statusLabel}
                </span>
              </div>
              <h4 class="font-bold text-base text-gray-900 dark:text-white mt-1 font-advercase">
                ${f.title}
              </h4>
              ${f.notes ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">💬 ${f.notes}</p>` : ''}
            </div>
          </div>

          <div class="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 dark:border-slate-800">
            <span class="text-xl font-bold font-lexend text-gray-900 dark:text-white">
              ${currency}${Number(f.amount).toFixed(2)}
            </span>
            <div class="flex items-center gap-1.5">
              <button onclick="financesManager.toggleStatus('${f.id}')" title="Toggle Paid/Pending" class="px-2.5 py-1 rounded text-xs font-semibold bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition">
                Mark ${f.status === 'paid' ? 'Pending' : 'Paid'}
              </button>
              <button onclick="financesManager.openEditModal('${f.id}')" class="px-2 py-1 rounded text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition">
                Edit
              </button>
              <button onclick="financesManager.deleteFee('${f.id}')" class="px-2 py-1 rounded text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 transition">
                ✕
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderDashboardSummary() {
    const card = document.getElementById('dashboard-finances-summary');
    if (!card) return;

    const finances = cloudStore.data.finances || [];
    const currency = cloudStore.data.profile.currency || '$';
    const currentMonth = this.getCurrentMonthPrefix();

    let thisMonthGym = 0;
    let thisMonthMeal = 0;

    finances.forEach(f => {
      if (f.date && f.date.startsWith(currentMonth)) {
        if (f.category === 'gym') thisMonthGym += Number(f.amount) || 0;
        if (f.category === 'meal') thisMonthMeal += Number(f.amount) || 0;
      }
    });

    const total = thisMonthGym + thisMonthMeal;

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">Monthly Fitness Expenses</p>
          <p class="text-2xl font-bold font-lexend text-gray-900 dark:text-white mt-0.5">${currency}${total.toFixed(2)}</p>
        </div>
        <div class="text-right text-xs">
          <p class="text-blue-600 dark:text-blue-400 font-semibold">Gym: ${currency}${thisMonthGym.toFixed(2)}</p>
          <p class="text-orange-600 dark:text-orange-400 font-semibold mt-0.5">Meals: ${currency}${thisMonthMeal.toFixed(2)}</p>
        </div>
      </div>
    `;
  }

  setCategoryFilter(cat) {
    this.categoryFilter = cat;
    document.querySelectorAll('.fee-cat-btn').forEach(btn => {
      if (btn.dataset.cat === cat) {
        btn.classList.add('bg-blue-600', 'text-white');
        btn.classList.remove('bg-gray-100', 'dark:bg-slate-800', 'text-gray-700', 'dark:text-gray-300');
      } else {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-100', 'dark:bg-slate-800', 'text-gray-700', 'dark:text-gray-300');
      }
    });
    this.renderList();
  }

  openCreateModal(preselectedCategory = 'gym') {
    this.currentEditingId = null;
    document.getElementById('fee-modal-title').textContent = "Record New Expense";
    document.getElementById('fee-form-category').value = preselectedCategory;
    document.getElementById('fee-form-title').value = "";
    document.getElementById('fee-form-amount').value = "";
    document.getElementById('fee-form-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('fee-form-status').value = "paid";
    document.getElementById('fee-form-notes').value = "";
    document.getElementById('fee-modal').classList.remove('hidden');
  }

  openEditModal(id) {
    const fee = (cloudStore.data.finances || []).find(f => f.id === id);
    if (!fee) return;

    this.currentEditingId = id;
    document.getElementById('fee-modal-title').textContent = "Edit Expense";
    document.getElementById('fee-form-category').value = fee.category;
    document.getElementById('fee-form-title').value = fee.title;
    document.getElementById('fee-form-amount').value = fee.amount;
    document.getElementById('fee-form-date').value = fee.date;
    document.getElementById('fee-form-status').value = fee.status || "paid";
    document.getElementById('fee-form-notes').value = fee.notes || "";
    document.getElementById('fee-modal').classList.remove('hidden');
  }

  closeModal() {
    document.getElementById('fee-modal').classList.add('hidden');
    this.currentEditingId = null;
  }

  saveModalForm() {
    const category = document.getElementById('fee-form-category').value;
    const title = document.getElementById('fee-form-title').value.trim();
    const amount = parseFloat(document.getElementById('fee-form-amount').value);
    const date = document.getElementById('fee-form-date').value;
    const status = document.getElementById('fee-form-status').value;
    const notes = document.getElementById('fee-form-notes').value.trim();

    if (!title || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid title and amount.");
      return;
    }

    if (!cloudStore.data.finances) cloudStore.data.finances = [];

    if (this.currentEditingId) {
      const idx = cloudStore.data.finances.findIndex(f => f.id === this.currentEditingId);
      if (idx !== -1) {
        cloudStore.data.finances[idx] = {
          ...cloudStore.data.finances[idx],
          category,
          title,
          amount,
          date,
          status,
          notes
        };
      }
    } else {
      const newFee = {
        id: 'f-' + Date.now(),
        category,
        title,
        amount,
        date,
        status,
        notes
      };
      cloudStore.data.finances.unshift(newFee);
    }

    cloudStore.save();
    this.closeModal();
  }

  toggleStatus(id) {
    const fee = (cloudStore.data.finances || []).find(f => f.id === id);
    if (!fee) return;
    fee.status = fee.status === 'paid' ? 'pending' : 'paid';
    cloudStore.save();
  }

  deleteFee(id) {
    if (confirm("Delete this fee record?")) {
      cloudStore.data.finances = (cloudStore.data.finances || []).filter(f => f.id !== id);
      cloudStore.save();
    }
  }
}

window.financesManager = new FinancesManager();
