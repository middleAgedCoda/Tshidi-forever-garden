// Main Application Logic

// State Management
const state = {
    currentPage: 'home',
    scores: {
        word: 0,
        number: 0,
        logic: 0,
        total: 0
    },
    garden: {
        flowers: [],
        totalBloomed: 0
    },
    streak: 0,
    lastPlayed: null
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    setupNavigation();
    updateGarden();
    updateStats();
    showDailyPuzzle();
    hideLoadingScreen();
    checkForEasterEgg();
});

// Navigation
function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-btn[data-page="${page}"]`)?.classList.add('active');
    
    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(page);
    if (targetPage) {
        targetPage.classList.add('active');
        state.currentPage = page;
        
        // Initialize game modes when navigated
        if (page === 'word') initWordMode();
        if (page === 'numbers') initSudoku();
        if (page === 'logic') initLogicMode();
        if (page === 'garden') updateGarden();
    }
}

// State Management
function loadState() {
    try {
        const saved = localStorage.getItem('tshidiGardenState');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(state, parsed);
        }
    } catch (e) {
        console.log('No saved state found');
    }
}

function saveState() {
    try {
        localStorage.setItem('tshidiGardenState', JSON.stringify(state));
    } catch (e) {
        console.log('Could not save state');
    }
}

function updateStats() {
    document.getElementById('total-score').textContent = `⭐ ${state.scores.total}`;
    document.getElementById('love-streak').textContent = `❤️ ${state.streak}`;
    if (document.getElementById('garden-count')) {
        document.getElementById('garden-count').textContent = state.garden.totalBloomed;
    }
    if (document.getElementById('garden-score')) {
        document.getElementById('garden-score').textContent = state.scores.total;
    }
}

// Garden System
function addFlowerToGarden() {
    const flower = FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
    state.garden.flowers.push(flower);
    state.garden.totalBloomed++;
    updateGarden();
    saveState();
}

function updateGarden() {
    const gardenContainer = document.getElementById('full-garden') || document.getElementById('mini-garden');
    if (gardenContainer) {
        gardenContainer.innerHTML = state.garden.flowers.map(f => 
            `<div class="garden-flower">${f}</div>`
        ).join('');
        
        // Add empty slots if less than 12
        const currentCount = state.garden.flowers.length;
        if (currentCount < 12) {
            const emptySlots = 12 - currentCount;
            for (let i = 0; i < emptySlots; i++) {
                gardenContainer.innerHTML += `<div class="garden-flower" style="opacity:0.2;">🌱</div>`;
            }
        }
    }
    updateStats();
}

// Daily Challenge
function showDailyPuzzle() {
    const preview = document.getElementById('daily-puzzle-preview');
    if (preview) {
        const today = new Date().getDate();
        const wordIndex = today % WORDS.length;
        const word = WORDS[wordIndex];
        preview.innerHTML = `
            <div style="text-align:center; padding:12px;">
                <div style="font-size:1.8rem; letter-spacing:4px; color:var(--primary);">
                    ${shuffleWord(word.word)}
                </div>
                <div style="font-size:0.9rem; opacity:0.7; margin-top:4px;">
                    💡 ${word.hint}
                </div>
            </div>
        `;
    }
}

// Helper Functions
function shuffleWord(word) {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

function showFeedback(element, message, isSuccess) {
    element.textContent = message;
    element.style.color = isSuccess ? '#28a745' : '#dc3545';
    setTimeout(() => {
        element.textContent = '';
    }, 3000);
}

// Loading Screen
function hideLoadingScreen() {
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1500);
}

// Easter Egg
function checkForEasterEgg() {
    // Secret: Click the logo 5 times
    let clicks = 0;
    const logo = document.querySelector('header h1');
    if (logo) {
        logo.addEventListener('dblclick', () => {
            clicks++;
            if (clicks >= 3) {
                showEasterEgg();
                clicks = 0;
            }
        });
    }
}

function showEasterEgg() {
    const egg = document.getElementById('easter-egg');
    if (egg) {
        egg.style.display = 'flex';
    }
}

function closeEasterEgg() {
    document.getElementById('easter-egg').style.display = 'none';
}

// Global Functions for onclick
window.navigateTo = navigateTo;
window.addFlowerToGarden = addFlowerToGarden;
window.showEasterEgg = showEasterEgg;
window.closeEasterEgg = closeEasterEgg;

// Export for other modules
export { state, saveState, updateStats, addFlowerToGarden, navigateTo };
