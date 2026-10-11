/**
 * Yearly, Monthly & Weekly Plans & Progress Tracker
 * Enhanced with 3, 4, 5, 6, 7-day customizable splits, editable exercises,
 * and 1-click "Log to Workout Tracker" button so athletes don't need to type everything daily.
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

  // Pre-configured split templates for 3, 4, 5, 6, and 7 days
  getSplitPresets(days) {
    switch (days) {
      case 3:
        return {
          title: "3-Day Full Body Frequency Split",
          daysCount: 3,
          checklist: [
            {
              text: "Day 1: Full Body Heavy (Squat, Bench Press, Barbell Row, Overhead Press)",
              muscle: "Full Body",
              exercises: [
                { name: "Barbell Back Squat", sets: 3, reps: 8, weight: 80, setsData: [{reps:8, weight:80},{reps:8, weight:80},{reps:8, weight:80}] },
                { name: "Barbell Flat Bench Press", sets: 3, reps: 8, weight: 70, setsData: [{reps:8, weight:70},{reps:8, weight:70},{reps:8, weight:70}] },
                { name: "Bent-Over Barbell Row", sets: 3, reps: 10, weight: 60, setsData: [{reps:10, weight:60},{reps:10, weight:60},{reps:10, weight:60}] },
                { name: "Standing Overhead Press", sets: 3, reps: 8, weight: 45, setsData: [{reps:8, weight:45},{reps:8, weight:45},{reps:8, weight:45}] }
              ],
              done: false
            },
            {
              text: "Day 2: Full Body Hypertrophy (Deadlift, Incline DB Press, Lat Pulldown, Lunges)",
              muscle: "Full Body",
              exercises: [
                { name: "Conventional Deadlift", sets: 3, reps: 6, weight: 110, setsData: [{reps:6, weight:110},{reps:6, weight:110},{reps:6, weight:110}] },
                { name: "Incline DB Bench Press", sets: 3, reps: 10, weight: 26, setsData: [{reps:10, weight:26},{reps:10, weight:26},{reps:10, weight:26}] },
                { name: "Wide-Grip Lat Pulldown", sets: 3, reps: 12, weight: 55, setsData: [{reps:12, weight:55},{reps:12, weight:55},{reps:12, weight:55}] },
                { name: "Walking DB Lunges", sets: 3, reps: 12, weight: 16, setsData: [{reps:12, weight:16},{reps:12, weight:16},{reps:12, weight:16}] }
              ],
              done: false
            },
            {
              text: "Day 3: Full Body Power & Arms (Front Squat, Dips, Pull-Ups, Biceps/Triceps)",
              muscle: "Full Body",
              exercises: [
                { name: "Front Squat / Leg Press", sets: 3, reps: 10, weight: 70, setsData: [{reps:10, weight:70},{reps:10, weight:70},{reps:10, weight:70}] },
                { name: "Bodyweight Dips", sets: 3, reps: 12, weight: 0, setsData: [{reps:12, weight:0},{reps:12, weight:0},{reps:12, weight:0}] },
                { name: "Pull-Ups / Chin-Ups", sets: 3, reps: 8, weight: 0, setsData: [{reps:8, weight:0},{reps:8, weight:0},{reps:8, weight:0}] },
                { name: "EZ-Bar Bicep Curl", sets: 3, reps: 12, weight: 30, setsData: [{reps:12, weight:30},{reps:12, weight:30},{reps:12, weight:30}] }
              ],
              done: false
            }
          ]
        };
      case 4:
        return {
          title: "4-Day Upper / Lower Split",
          daysCount: 4,
          checklist: [
            {
              text: "Day 1: Upper Strength (Bench Press, Barbell Row, Shoulder Press, Lat Pulldown)",
              muscle: "Chest",
              exercises: [
                { name: "Flat Barbell Bench Press", sets: 4, reps: 6, weight: 80, setsData: [{reps:6, weight:80},{reps:6, weight:80},{reps:6, weight:80},{reps:6, weight:80}] },
                { name: "Chest-Supported Row", sets: 4, reps: 8, weight: 65, setsData: [{reps:8, weight:65},{reps:8, weight:65},{reps:8, weight:65},{reps:8, weight:65}] },
                { name: "DB Overhead Press", sets: 3, reps: 10, weight: 22, setsData: [{reps:10, weight:22},{reps:10, weight:22},{reps:10, weight:22}] }
              ],
              done: false
            },
            {
              text: "Day 2: Lower Strength (Squat, Romanian Deadlift, Leg Extensions, Calf Raises)",
              muscle: "Legs",
              exercises: [
                { name: "Barbell Back Squat", sets: 4, reps: 6, weight: 95, setsData: [{reps:6, weight:95},{reps:6, weight:95},{reps:6, weight:95},{reps:6, weight:95}] },
                { name: "Romanian Deadlift", sets: 3, reps: 8, weight: 80, setsData: [{reps:8, weight:80},{reps:8, weight:80},{reps:8, weight:80}] },
                { name: "Leg Press", sets: 3, reps: 12, weight: 140, setsData: [{reps:12, weight:140},{reps:12, weight:140},{reps:12, weight:140}] }
              ],
              done: false
            },
            {
              text: "Day 3: Upper Hypertrophy (Incline DB, Cable Row, Lateral Raises, Arms)",
              muscle: "Back",
              exercises: [
                { name: "Incline DB Press", sets: 3, reps: 10, weight: 28, setsData: [{reps:10, weight:28},{reps:10, weight:28},{reps:10, weight:28}] },
                { name: "Seated Cable Row", sets: 3, reps: 12, weight: 60, setsData: [{reps:12, weight:60},{reps:12, weight:60},{reps:12, weight:60}] },
                { name: "DB Lateral Raises", sets: 4, reps: 15, weight: 12, setsData: [{reps:15, weight:12},{reps:15, weight:12},{reps:15, weight:12},{reps:15, weight:12}] }
              ],
              done: false
            },
            {
              text: "Day 4: Lower Hypertrophy (Deadlift, Bulgarian Split Squats, Hamstring Curls)",
              muscle: "Legs",
              exercises: [
                { name: "Trap Bar / Conventional Deadlift", sets: 3, reps: 6, weight: 120, setsData: [{reps:6, weight:120},{reps:6, weight:120},{reps:6, weight:120}] },
                { name: "Bulgarian Split Squats", sets: 3, reps: 10, weight: 18, setsData: [{reps:10, weight:18},{reps:10, weight:18},{reps:10, weight:18}] },
                { name: "Lying Leg Curls", sets: 3, reps: 12, weight: 45, setsData: [{reps:12, weight:45},{reps:12, weight:45},{reps:12, weight:45}] }
              ],
              done: false
            }
          ]
        };
      case 5:
        return {
          title: "5-Day Classic Muscle Bro Split",
          daysCount: 5,
          checklist: [
            {
              text: "Day 1: Chest Day (Flat Bench, Incline DB, Cable Flyes, Dips)",
              muscle: "Chest",
              exercises: [
                { name: "Barbell Bench Press", sets: 4, reps: 8, weight: 75, setsData: [{reps:8, weight:75},{reps:8, weight:75},{reps:8, weight:75},{reps:8, weight:75}] },
                { name: "Incline DB Press", sets: 3, reps: 10, weight: 26, setsData: [{reps:10, weight:26},{reps:10, weight:26},{reps:10, weight:26}] },
                { name: "Cable Chest Flyes", sets: 3, reps: 15, weight: 15, setsData: [{reps:15, weight:15},{reps:15, weight:15},{reps:15, weight:15}] }
              ],
              done: false
            },
            {
              text: "Day 2: Back Day (Deadlifts, Pull-Ups, Barbell Rows, Lat Pulldown)",
              muscle: "Back",
              exercises: [
                { name: "Deadlifts", sets: 3, reps: 6, weight: 120, setsData: [{reps:6, weight:120},{reps:6, weight:120},{reps:6, weight:120}] },
                { name: "Barbell Rows", sets: 4, reps: 8, weight: 65, setsData: [{reps:8, weight:65},{reps:8, weight:65},{reps:8, weight:65},{reps:8, weight:65}] },
                { name: "Wide Lat Pulldown", sets: 3, reps: 12, weight: 60, setsData: [{reps:12, weight:60},{reps:12, weight:60},{reps:12, weight:60}] }
              ],
              done: false
            },
            {
              text: "Day 3: Shoulder Day (Overhead Press, Lateral Raises, Rear Delt Flyes)",
              muscle: "Shoulders",
              exercises: [
                { name: "Overhead Military Press", sets: 4, reps: 8, weight: 50, setsData: [{reps:8, weight:50},{reps:8, weight:50},{reps:8, weight:50},{reps:8, weight:50}] },
                { name: "Dumbbell Lateral Raises", sets: 4, reps: 15, weight: 12, setsData: [{reps:15, weight:12},{reps:15, weight:12},{reps:15, weight:12},{reps:15, weight:12}] },
                { name: "Face Pulls", sets: 3, reps: 15, weight: 25, setsData: [{reps:15, weight:25},{reps:15, weight:25},{reps:15, weight:25}] }
              ],
              done: false
            },
            {
              text: "Day 4: Leg Day (Squats, Leg Press, Romanian Deadlift, Calves)",
              muscle: "Legs",
              exercises: [
                { name: "Barbell Back Squats", sets: 4, reps: 8, weight: 90, setsData: [{reps:8, weight:90},{reps:8, weight:90},{reps:8, weight:90},{reps:8, weight:90}] },
                { name: "Leg Press Machine", sets: 3, reps: 12, weight: 160, setsData: [{reps:12, weight:160},{reps:12, weight:160},{reps:12, weight:160}] },
                { name: "Romanian Deadlifts", sets: 3, reps: 10, weight: 75, setsData: [{reps:10, weight:75},{reps:10, weight:75},{reps:10, weight:75}] }
              ],
              done: false
            },
            {
              text: "Day 5: Arms & Core (Barbell Curls, Tricep Pushdowns, Hammer Curls, Planks)",
              muscle: "Arms",
              exercises: [
                { name: "Barbell Bicep Curls", sets: 3, reps: 10, weight: 32, setsData: [{reps:10, weight:32},{reps:10, weight:32},{reps:10, weight:32}] },
                { name: "Tricep Cable Pushdown", sets: 3, reps: 12, weight: 30, setsData: [{reps:12, weight:30},{reps:12, weight:30},{reps:12, weight:30}] },
                { name: "DB Hammer Curls", sets: 3, reps: 12, weight: 16, setsData: [{reps:12, weight:16},{reps:12, weight:16},{reps:12, weight:16}] }
              ],
              done: false
            }
          ]
        };
      case 6:
        return {
          title: "6-Day Push-Pull-Legs (PPL) Split",
          daysCount: 6,
          checklist: [
            {
              text: "Day 1: Push A (Heavy Flat Bench, OHP, Incline DB, Triceps)",
              muscle: "Chest",
              exercises: [
                { name: "Barbell Bench Press", sets: 4, reps: 6, weight: 80, setsData: [{reps:6, weight:80},{reps:6, weight:80},{reps:6, weight:80},{reps:6, weight:80}] },
                { name: "Overhead DB Press", sets: 3, reps: 10, weight: 24, setsData: [{reps:10, weight:24},{reps:10, weight:24},{reps:10, weight:24}] },
                { name: "Tricep Skullcrushers", sets: 3, reps: 12, weight: 30, setsData: [{reps:12, weight:30},{reps:12, weight:30},{reps:12, weight:30}] }
              ],
              done: false
            },
            {
              text: "Day 2: Pull A (Deadlift, Barbell Row, Lat Pulldown, Biceps)",
              muscle: "Back",
              exercises: [
                { name: "Conventional Deadlift", sets: 3, reps: 5, weight: 130, setsData: [{reps:5, weight:130},{reps:5, weight:130},{reps:5, weight:130}] },
                { name: "Barbell Row", sets: 4, reps: 8, weight: 70, setsData: [{reps:8, weight:70},{reps:8, weight:70},{reps:8, weight:70},{reps:8, weight:70}] },
                { name: "Incline DB Bicep Curls", sets: 3, reps: 12, weight: 14, setsData: [{reps:12, weight:14},{reps:12, weight:14},{reps:12, weight:14}] }
              ],
              done: false
            },
            {
              text: "Day 3: Legs A (Squats, Romanian Deadlift, Leg Extensions, Calves)",
              muscle: "Legs",
              exercises: [
                { name: "Barbell Back Squats", sets: 4, reps: 6, weight: 100, setsData: [{reps:6, weight:100},{reps:6, weight:100},{reps:6, weight:100},{reps:6, weight:100}] },
                { name: "Romanian Deadlift", sets: 3, reps: 8, weight: 85, setsData: [{reps:8, weight:85},{reps:8, weight:85},{reps:8, weight:85}] },
                { name: "Standing Calf Raises", sets: 4, reps: 15, weight: 40, setsData: [{reps:15, weight:40},{reps:15, weight:40},{reps:15, weight:40},{reps:15, weight:40}] }
              ],
              done: false
            },
            {
              text: "Day 4: Push B (Incline Barbell, DB Flat, Lateral Raises, Cable Pushdown)",
              muscle: "Chest",
              exercises: [
                { name: "Incline Barbell Bench", sets: 4, reps: 8, weight: 70, setsData: [{reps:8, weight:70},{reps:8, weight:70},{reps:8, weight:70},{reps:8, weight:70}] },
                { name: "DB Lateral Raises", sets: 5, reps: 15, weight: 12, setsData: [{reps:15, weight:12},{reps:15, weight:12},{reps:15, weight:12},{reps:15, weight:12},{reps:15, weight:12}] },
                { name: "Overhead Rope Tricep Ext", sets: 3, reps: 12, weight: 25, setsData: [{reps:12, weight:25},{reps:12, weight:25},{reps:12, weight:25}] }
              ],
              done: false
            },
            {
              text: "Day 5: Pull B (Pull-Ups, Seated Cable Row, Rear Delt Fly, Hammer Curls)",
              muscle: "Back",
              exercises: [
                { name: "Weighted Pull-Ups", sets: 3, reps: 6, weight: 10, setsData: [{reps:6, weight:10},{reps:6, weight:10},{reps:6, weight:10}] },
                { name: "Seated Cable Row", sets: 4, reps: 10, weight: 65, setsData: [{reps:10, weight:65},{reps:10, weight:65},{reps:10, weight:65},{reps:10, weight:65}] },
                { name: "Preacher Curls", sets: 3, reps: 12, weight: 28, setsData: [{reps:12, weight:28},{reps:12, weight:28},{reps:12, weight:28}] }
              ],
              done: false
            },
            {
              text: "Day 6: Legs B (Front Squats, Bulgarian Split Squats, Lying Leg Curls)",
              muscle: "Legs",
              exercises: [
                { name: "Front Squats / Hack Squats", sets: 3, reps: 8, weight: 75, setsData: [{reps:8, weight:75},{reps:8, weight:75},{reps:8, weight:75}] },
                { name: "Bulgarian Split Squats", sets: 3, reps: 10, weight: 20, setsData: [{reps:10, weight:20},{reps:10, weight:20},{reps:10, weight:20}] },
                { name: "Lying Leg Curls", sets: 4, reps: 12, weight: 45, setsData: [{reps:12, weight:45},{reps:12, weight:45},{reps:12, weight:45},{reps:12, weight:45}] }
              ],
              done: false
            }
          ]
        };
      case 7:
        return {
          title: "7-Day Athletic Grind Split (Daily Action)",
          daysCount: 7,
          checklist: [
            { text: "Mon: Chest & Triceps (Heavy Push)", muscle: "Chest", exercises: [{ name: "Flat Bench Press", sets: 4, reps: 8, weight: 75 }], done: false },
            { text: "Tue: Back & Biceps (Heavy Pull)", muscle: "Back", exercises: [{ name: "Barbell Rows", sets: 4, reps: 8, weight: 65 }], done: false },
            { text: "Wed: Leg Hypertrophy & Calves", muscle: "Legs", exercises: [{ name: "Squats", sets: 4, reps: 8, weight: 90 }], done: false },
            { text: "Thu: Shoulders & Abs Hypertrophy", muscle: "Shoulders", exercises: [{ name: "Overhead Press", sets: 4, reps: 8, weight: 50 }], done: false },
            { text: "Fri: Arms Specialization (Bi & Tri Superset)", muscle: "Arms", exercises: [{ name: "Bicep & Tricep Superset", sets: 4, reps: 12, weight: 25 }], done: false },
            { text: "Sat: Lower Body Posterior & Deadlifts", muscle: "Legs", exercises: [{ name: "Deadlifts", sets: 3, reps: 6, weight: 120 }], done: false },
            { text: "Sun: Active Recovery, Mobility & Core", muscle: "Core", exercises: [{ name: "Hanging Leg Raises & Foam Roll", sets: 3, reps: 15, weight: 0 }], done: false }
          ]
        };
      default:
        return null;
    }
  }

  createSplitFromPreset(days) {
    const preset = this.getSplitPresets(days);
    if (!preset) return;

    if (!cloudStore.data.plans) cloudStore.data.plans = { yearly: [], monthly: [], weekly: [] };
    if (!cloudStore.data.plans.weekly) cloudStore.data.plans.weekly = [];

    const newPlan = {
      id: 'pw-' + Date.now(),
      title: preset.title,
      targetDate: '',
      checklist: preset.checklist,
      progress: 0,
      status: 'active'
    };

    cloudStore.data.plans.weekly.unshift(newPlan);
    cloudStore.save();
    this.renderTierPlans('weekly');
    alert(`Successfully loaded ${days}-Day Split! You can customize any day or click "+ Log to Tracker" to instantly log today's workout without typing.`);
  }

  loadSplitPreset(days) {
    const preset = this.getSplitPresets(days);
    if (!preset) return;

    document.getElementById('plan-form-title').value = preset.title;
    const checklistContainer = document.getElementById('plan-checklist-inputs');
    checklistContainer.innerHTML = "";

    preset.checklist.forEach(item => {
      this.addChecklistInputRow(item.text, false, item.muscle || 'Full Body', item.exercises || []);
    });
  }

  onTierChange() {
    const tier = document.getElementById('plan-form-tier').value;
    const presetsBox = document.getElementById('plan-split-presets-container');
    if (presetsBox) {
      if (tier === 'weekly') {
        presetsBox.classList.remove('hidden');
      } else {
        presetsBox.classList.add('hidden');
      }
    }
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
          <button onclick="plansManager.openCreateModal('${tier}')" class="mt-3 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer">
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

      const checklistHtml = checklist.map((item, idx) => {
        // Quick log button for each workout in the split
        return `
          <div class="flex items-center justify-between gap-2 py-2 px-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition select-none">
            <label class="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
              <input type="checkbox" ${item.done ? 'checked' : ''} 
                     onchange="plansManager.toggleChecklistItem('${tier}', '${p.id}', ${idx})" 
                     class="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer" />
              <span class="${item.done ? 'line-through text-gray-400 dark:text-gray-500 font-medium' : 'font-semibold text-gray-900 dark:text-gray-100'}">${item.text}</span>
            </label>

            <!-- 1-Click Quick Log Workout Button -->
            <button type="button" onclick="plansManager.logSplitWorkoutToTracker('${tier}', '${p.id}', ${idx})" 
                    class="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-600 text-blue-600 dark:text-blue-300 hover:text-white text-[11px] font-bold shadow-2xs transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    title="Instantly open in Workout Logger without typing">
              <span>⚡</span> Log Workout
            </button>
          </div>
        `;
      }).join('');

      return `
        <div class="theme-card p-5 mb-4 hover:shadow-md transition">
          <div class="flex items-start justify-between gap-3 mb-2">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                  ${tier.toUpperCase()} PLAN
                </span>
                ${p.targetDate ? `<span class="text-xs text-gray-400">Target: ${p.targetDate}</span>` : ''}
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mt-1 font-advercase">
                ${p.title}
              </h3>
            </div>
            <div class="flex items-center gap-1.5">
              <button onclick="plansManager.openEditModal('${tier}', '${p.id}')" class="px-2.5 py-1 text-xs font-semibold rounded bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition cursor-pointer">
                Edit
              </button>
              <button onclick="plansManager.deletePlan('${tier}', '${p.id}')" class="px-2.5 py-1 text-xs font-semibold rounded text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 transition cursor-pointer">
                ✕
              </button>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="my-3">
            <div class="flex justify-between items-center text-xs mb-1">
              <span class="font-medium text-gray-500 dark:text-gray-400">Weekly Completion</span>
              <span class="font-bold text-blue-600 dark:text-blue-400 font-mono">${calculatedPct}%</span>
            </div>
            <div class="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div style="width: ${calculatedPct}%" class="h-full bg-linear-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-300"></div>
            </div>
          </div>

          <!-- Checklist of Workouts -->
          ${checklist.length > 0 ? `
            <div class="mt-3 pt-2 border-t border-gray-100 dark:border-slate-800 space-y-1">
              <div class="flex justify-between items-center text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">
                <span>Split Sessions (${doneCount}/${totalCount})</span>
                <span class="text-blue-500 font-normal">Tap "⚡ Log Workout" to record today</span>
              </div>
              ${checklistHtml}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  /**
   * Directly transfers a routine item from the weekly plan into the Workout Logger modal
   */
  logSplitWorkoutToTracker(tier, planId, itemIdx) {
    const plans = cloudStore.data.plans[tier];
    if (!plans) return;
    const plan = plans.find(p => p.id === planId);
    if (!plan || !plan.checklist || !plan.checklist[itemIdx]) return;

    const item = plan.checklist[itemIdx];

    // Determine title & muscle
    let title = item.text.split('(')[0].trim();
    if (!title) title = item.text;

    let muscle = item.muscle || "Full Body";
    if (!item.muscle) {
      if (title.toLowerCase().includes('chest') || title.toLowerCase().includes('push')) muscle = 'Chest';
      else if (title.toLowerCase().includes('back') || title.toLowerCase().includes('pull')) muscle = 'Back';
      else if (title.toLowerCase().includes('leg')) muscle = 'Legs';
      else if (title.toLowerCase().includes('shoulder')) muscle = 'Shoulders';
      else if (title.toLowerCase().includes('arm')) muscle = 'Arms';
    }

    // Navigate to workouts and open modal
    if (window.app) window.app.navigateTo('workouts');

    setTimeout(() => {
      if (window.workoutsManager) {
        window.workoutsManager.openCreateModal({
          title,
          muscleGroup: muscle,
          exercises: item.exercises || []
        });
      }
    }, 150);
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
    this.onTierChange();

    const checklistContainer = document.getElementById('plan-checklist-inputs');
    checklistContainer.innerHTML = "";
    if (tier === 'weekly') {
      this.loadSplitPreset(5); // Default to popular 5-day split
    } else {
      this.addChecklistInputRow("Hit 160g daily protein target");
      this.addChecklistInputRow("Drink 3.5L water daily");
    }

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
    this.onTierChange();

    const checklistContainer = document.getElementById('plan-checklist-inputs');
    checklistContainer.innerHTML = "";
    if (plan.checklist && plan.checklist.length > 0) {
      plan.checklist.forEach(c => this.addChecklistInputRow(c.text, c.done, c.muscle, c.exercises));
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

  addChecklistInputRow(text = "", done = false, muscle = "Full Body", exercises = []) {
    const container = document.getElementById('plan-checklist-inputs');
    const rowId = 'check-row-' + Date.now() + '-' + Math.floor(Math.random()*1000);
    const div = document.createElement('div');
    div.id = rowId;
    div.className = "flex items-center gap-2 mb-2 p-1 rounded-lg bg-gray-50/50 dark:bg-slate-800/50";
    div.dataset.muscle = muscle;
    div.dataset.exercises = JSON.stringify(exercises);

    div.innerHTML = `
      <input type="checkbox" ${done ? 'checked' : ''} class="plan-check-done w-4 h-4 rounded text-blue-600 cursor-pointer" />
      <input type="text" placeholder="Daily routine / milestone description" value="${text}" class="plan-check-text input-theme text-xs flex-1 py-1 px-2" required />
      <button type="button" onclick="document.getElementById('${rowId}').remove()" class="text-red-500 hover:text-red-700 text-sm font-bold px-1">✕</button>
    `;
    container.appendChild(div);
  }

  saveModalForm() {
    const tier = document.getElementById('plan-form-tier').value;
    const title = document.getElementById('plan-form-title').value.trim();
    const targetDate = document.getElementById('plan-form-target-date').value;

    if (!title) {
      alert("Please enter a plan or routine title.");
      return;
    }

    const rows = document.querySelectorAll('#plan-checklist-inputs > div');
    const checklist = [];
    rows.forEach(r => {
      const text = r.querySelector('.plan-check-text').value.trim();
      const done = r.querySelector('.plan-check-done').checked;
      const muscle = r.dataset.muscle || "Full Body";
      let exercises = [];
      try {
        exercises = JSON.parse(r.dataset.exercises || "[]");
      } catch(e) {
        exercises = [];
      }
      if (text) {
        checklist.push({ text, done, muscle, exercises });
      }
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
