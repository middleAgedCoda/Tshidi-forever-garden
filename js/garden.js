// Garden Mode - Tshidi's Love Garden

import { state, saveState, updateStats } from './app.js';

// Initialize garden view
function initGarden() {
    renderFullGarden();
    updateGardenStats();
    updateLoveNote();
}

function renderFullGarden() {
    const gardenContainer = document.getElementById('full-garden');
    if (!gardenContainer) return;
    
    gardenContainer.innerHTML = '';
    
    // Show all flowers in the garden
    if (state.garden.flowers.length === 0) {
        gardenContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px 0; color: #999;">
                <div style="font-size: 3rem;">🌱</div>
                <p style="margin-top: 12px;">No flowers yet!<br>Solve puzzles to grow your garden 💕</p>
            </div>
        `;
        return;
    }
    
    // Display flowers in a grid
    state.garden.flowers.forEach((flower, index) => {
        const flowerEl = document.createElement('div');
        flowerEl.className = 'garden-flower';
        flowerEl.textContent = flower;
        flowerEl.style.animationDelay = `${index * 0.05}s`;
        
        // Add tooltip with bloom order
        flowerEl.title = `Bloomed #${index + 1}`;
        gardenContainer.appendChild(flowerEl);
    });
    
    // Fill remaining slots with seeds
    const currentCount = state.garden.flowers.length;
    const totalSlots = 24; // Show more in full garden
    if (currentCount < totalSlots) {
        for (let i = currentCount; i < totalSlots; i++) {
            const seedEl = document.createElement('div');
            seedEl.className = 'garden-flower';
            seedEl.textContent = '🌱';
            seedEl.style.opacity = '0.2';
            seedEl.title = 'Plant a seed by solving puzzles!';
            gardenContainer.appendChild(seedEl);
        }
    }
}

function updateGardenStats() {
    const countEl = document.getElementById('garden-count');
    const scoreEl = document.getElementById('garden-score');
    
    if (countEl) {
        countEl.textContent = state.garden.totalBloomed || 0;
    }
    if (scoreEl) {
        scoreEl.textContent = state.scores.total || 0;
    }
}

function updateLoveNote() {
    const noteEl = document.getElementById('love-note');
    if (!noteEl) return;
    
    // Different love notes based on flowers bloomed
    const notes = [
        "Every puzzle you solve brings us closer. You're my greatest adventure, Tshidi. Forever and always. ❤️",
        "With every flower that blooms, my love for you grows stronger. You make my world beautiful. 🌸",
        "You're the sunshine in my garden, the love in my heart. Each puzzle is a petal of our love story. 💕",
        "Tshidi, you're not just my love - you're my home. This garden is just a tiny reflection of how much you mean to me. 🌺",
        "Forever isn't long enough with you. Every moment, every puzzle, every flower - all for you, my love. 💖"
    ];
    
    const flowerCount = state.garden.totalBloomed || 0;
    let noteIndex = 0;
    
    if (flowerCount > 20) noteIndex = 4;
    else if (flowerCount > 15) noteIndex = 3;
    else if (flowerCount > 10) noteIndex = 2;
    else if (flowerCount > 5) noteIndex = 1;
    
    noteEl.textContent = notes[noteIndex];
}

// Celebrate milestone achievements
function celebrateMilestone(flowers) {
    if (flowers % 10 === 0 && flowers > 0) {
        // Every 10 flowers, show a special celebration
        setTimeout(() => {
            const celebrations = [
                '🎉 10 Flowers! You\'re amazing, Tshidi!',
                '🌸 20 Flowers! Our garden is blooming with love!',
                '💐 30 Flowers! You make my heart full!',
                '🌺 40 Flowers! Forever growing, forever loving!',
                '🌻 50 Flowers! Tshidi, you\'re incredible!'
            ];
            const index = Math.min(Math.floor(flowers / 10) - 1, celebrations.length - 1);
            const message = celebrations[index] || `🌹 ${flowers} Flowers! Our love is infinite!`;
            
            // Show a beautiful popup
            showMilestonePopup(message);
        }, 500);
    }
}

function showMilestonePopup(message) {
    // Create a temporary popup
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 999;
        text-align: center;
        animation: bounceIn 0.6s ease;
        max-width: 90%;
    `;
    popup.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 16px;">💐</div>
        <h2 style="color: #FF6B8A; margin-bottom: 12px;">${message}</h2>
        <p style="color: #666; margin-bottom: 20px;">You're growing a beautiful garden of love! 🌸</p>
        <button onclick="this.parentElement.remove()" style="
            padding: 12px 30px;
            background: #FF6B8A;
            color: white;
            border: none;
            border-radius: 30px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
        ">Continue Growing 💕</button>
    `;
    document.body.appendChild(popup);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (popup.parentElement) popup.remove();
    }, 5000);
}

// Export functions for use in other modules
export { 
    initGarden, 
    renderFullGarden, 
    updateGardenStats, 
    updateLoveNote,
    celebrateMilestone 
};
