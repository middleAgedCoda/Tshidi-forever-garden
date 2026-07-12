// Logic Mode - Logic Petals

import { state, saveState, updateStats, addFlowerToGarden } from './app.js';

let currentLogicIndex = 0;
let usedLogicIndices = [];
let logicScore = 0;

function initLogicMode() {
    document.getElementById('logic-level').textContent = Math.floor(state.scores.logic / 50) + 1;
    document.getElementById('logic-score').textContent = state.scores.logic;
    newLogic();
}

function newLogic() {
    // Find unused puzzle
    const available = LOGIC_PUZZLES.filter((_, i) => !usedLogicIndices.includes(i));
    if (available.length === 0) {
        usedLogicIndices = [];
        document.getElementById('logic-feedback').textContent = '🎉 You solved all puzzles! Starting again!';
        setTimeout(() => newLogic(), 2000);
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * available.length);
    const puzzle = available[randomIndex];
    const originalIndex = LOGIC_PUZZLES.indexOf(puzzle);
    usedLogicIndices.push(originalIndex);
    
    currentLogicIndex = originalIndex;
    
    // Display puzzle
    document.getElementById('logic-puzzle').innerHTML = `
        <div style="text-align:center;">
            <div style="font-size:1.4rem; margin-bottom:12px;">🤔 Think carefully...</div>
            <div style="font-size:1.1rem; line-height:1.8;">${puzzle.question}</div>
        </div>
    `;
    
    document.getElementById('logic-answer').value = '';
    document.getElementById('logic-answer').focus();
    document.getElementById('logic-feedback').textContent = '';
}

function checkLogic() {
    const input = document.getElementById('logic-answer');
    const feedback = document.getElementById('logic-feedback');
    const answer = input.value.trim().toLowerCase();
    
    if (!answer) {
        showFeedback(feedback, 'Please type your answer!', false);
        return;
    }
    
    const puzzle = LOGIC_PUZZLES[currentLogicIndex];
    const isCorrect = answer === puzzle.answer.toLowerCase();
    
    if (isCorrect) {
        const points = 50;
        logicScore += points;
        state.scores.logic += points;
        state.scores.total += points;
        
        showFeedback(feedback, `🧠 Brilliant, Tshidi! +${points} points!`, true);
        addFlowerToGarden();
        state.streak++;
        
        document.getElementById('logic-score').textContent = state.scores.logic;
        updateStats();
        saveState();
        
        setTimeout(() => newLogic(), 1500);
    } else {
        showFeedback(feedback, `❌ Not quite, love! Think again. 💕`, false);
        state.streak = 0;
        updateStats();
        saveState();
        
        // Give a small hint after wrong answer
        setTimeout(() => {
            const hint = puzzle.answer.length > 1 ? 
                `💡 Hint: It's ${puzzle.answer.length} letters long` : 
                `💡 Hint: It starts with "${puzzle.answer[0]}"`;
            showFeedback(feedback, hint, false);
        }, 1000);
    }
}

// Global functions
window.newLogic = newLogic;
window.checkLogic = checkLogic;
window.initLogicMode = initLogicMode;
