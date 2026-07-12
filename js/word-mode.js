// Word Mode - Word Blossom

import { state, saveState, updateStats, addFlowerToGarden } from './app.js';

let currentWordIndex = 0;
let currentWord = null;
let wordScore = 0;
let foundWords = 0;
let usedWords = [];

function initWordMode() {
    // Reset or continue
    const wordLevel = document.getElementById('word-level');
    if (wordLevel) {
        wordLevel.textContent = Math.floor(state.scores.word / 100) + 1;
    }
    
    // Get first word
    getNewWord();
    
    // Update display
    document.getElementById('word-score').textContent = state.scores.word;
    document.getElementById('word-found').textContent = foundWords;
    document.getElementById('word-total').textContent = WORDS.length;
}

function getNewWord() {
    // Find unused word
    const available = WORDS.filter((_, i) => !usedWords.includes(i));
    if (available.length === 0) {
        // Reset if all words used
        usedWords = [];
        document.getElementById('word-feedback').textContent = '🎉 You found all words! Starting again!';
        setTimeout(() => getNewWord(), 2000);
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * available.length);
    const wordObj = available[randomIndex];
    const originalIndex = WORDS.indexOf(wordObj);
    usedWords.push(originalIndex);
    
    currentWord = wordObj;
    currentWordIndex = originalIndex;
    
    // Display scrambled word
    const scrambled = shuffleWord(wordObj.word);
    document.getElementById('word-scrambled').textContent = scrambled;
    document.getElementById('word-hint').textContent = `💡 ${wordObj.hint}`;
    document.getElementById('word-input').value = '';
    document.getElementById('word-input').focus();
    document.getElementById('word-feedback').textContent = '';
}

function checkWord() {
    const input = document.getElementById('word-input');
    const feedback = document.getElementById('word-feedback');
    const answer = input.value.toUpperCase().trim();
    
    if (!answer) {
        showFeedback(feedback, 'Please type an answer!', false);
        return;
    }
    
    if (answer === currentWord.word) {
        // Correct!
        const points = currentWord.word.length * 10;
        wordScore += points;
        state.scores.word += points;
        state.scores.total += points;
        foundWords++;
        
        showFeedback(feedback, `🌸 Perfect! +${points} points!`, true);
        
        // Add flower to garden
        addFlowerToGarden();
        
        // Update streak
        state.streak++;
        
        // Update display
        document.getElementById('word-score').textContent = state.scores.word;
        document.getElementById('word-found').textContent = foundWords;
        updateStats();
        saveState();
        
        // New word after delay
        setTimeout(() => getNewWord(), 1500);
    } else {
        showFeedback(feedback, `❌ Try again, Tshidi! You can do it!`, false);
        state.streak = 0;
        updateStats();
        saveState();
    }
}

// Global functions
window.checkWord = checkWord;
window.getNewWord = getNewWord;
window.initWordMode = initWordMode;

// Auto-init when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('word')) {
        // Will be called when navigated
    }
});
