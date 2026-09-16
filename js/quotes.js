/**
 * Motivational Quotes Engine
 * Generates inspiring fitness, discipline, and perseverance quotes on each refresh or on demand.
 */

const MOTIVATIONAL_QUOTES = [
  {
    text: "We don't rise to the level of our expectations, we fall to the level of our training.",
    author: "Archilochus"
  },
  {
    text: "The body achieves what the mind believes.",
    author: "Napoleon Hill"
  },
  {
    text: "Action isn't just the effect of motivation; it's also the cause of it.",
    author: "Mark Manson"
  },
  {
    text: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln"
  },
  {
    text: "The clock is ticking. Are you becoming the person you want to be?",
    author: "Greg Plitt"
  },
  {
    text: "Success isn't always about greatness. It's about consistency. Consistent hard work leads to success. Greatness will come.",
    author: "Dwayne Johnson"
  },
  {
    text: "No citizen has a right to be an amateur in the matter of physical training. What a disgrace it is for a man to grow old without seeing the beauty and strength of which his body is capable.",
    author: "Socrates"
  },
  {
    text: "If you think lifting weights is dangerous, try being weak. Being weak is dangerous.",
    author: "Bret Contreras"
  },
  {
    text: "You don't have to be extreme, just consistent.",
    author: "Anonymous"
  },
  {
    text: "The hard days are the best days. That is where champions are made.",
    author: "Gabby Douglas"
  },
  {
    text: "It never gets easier, you just get better.",
    author: "Greg LeMond"
  },
  {
    text: "Don't count the days, make the days count.",
    author: "Muhammad Ali"
  },
  {
    text: "Strength does not come from physical capacity. It comes from an indomitable will.",
    author: "Mahatma Gandhi"
  },
  {
    text: "The last three or four reps is what makes the muscle grow. This area of pain divides a champion from someone who is not a champion.",
    author: "Arnold Schwarzenegger"
  },
  {
    text: "Today I will do what others won't, so tomorrow I can accomplish what others can't.",
    author: "Jerry Rice"
  },
  {
    text: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.",
    author: "John C. Maxwell"
  },
  {
    text: "Whether you think you can, or you think you can't – you're right.",
    author: "Henry Ford"
  },
  {
    text: "Fuel your body like an athlete, not a garbage disposal.",
    author: "Fitness Proverb"
  },
  {
    text: "Look in the mirror. That's your only competition.",
    author: "John C. Collins"
  },
  {
    text: "Your workout is our reward, your diet is your key, your consistency is your gateway to greatness.",
    author: "Gym Tracker Motto"
  },
  {
    text: "Motivation gets you going, but discipline keeps you growing.",
    author: "John C. Maxwell"
  },
  {
    text: "Take care of your body. It's the only place you have to live.",
    author: "Jim Rohn"
  },
  {
    text: "Fall in love with the process, and the results will come.",
    author: "Eric Thomas"
  },
  {
    text: "Do something today that your future self will thank you for.",
    author: "Sean Patrick Flanery"
  }
];

function getRandomQuote() {
  const index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[index];
}

function renderQuote(containerId = 'motivational-quote-container') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const quote = getRandomQuote();
  container.innerHTML = `
    <div class="quote-banner p-4 md:p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
      <div class="flex items-start gap-3">
        <span class="text-3xl text-blue-500 font-serif leading-none select-none">“</span>
        <div>
          <p class="text-base md:text-lg font-medium tracking-tight text-gray-900 dark:text-gray-100 font-advercase italic">
            ${quote.text}
          </p>
          <p class="text-xs md:text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1 font-lexend">
            — ${quote.author}
          </p>
        </div>
      </div>
      <button onclick="renderQuote()" title="Refresh quote" class="self-end md:self-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700 transition shadow-xs cursor-pointer">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <span>New Quote</span>
      </button>
    </div>
  `;
}

// Export functions to global scope
window.getRandomQuote = getRandomQuote;
window.renderQuote = renderQuote;
