// Number Mode - Sudoku

import { state, saveState, updateStats, addFlowerToGarden } from './app.js';

let currentSudoku = null;
let selectedCell = null;
let sudokuBoard = [];
let sudokuSolution = [];
let sudokuErrors = 0;

function initSudoku() {
    newSudoku();
}

function newSudoku() {
    const data = generateSudokuPuzzle();
    sudokuBoard = data.puzzle;
    sudokuSolution = data.solved;
    sudokuErrors = 0;
    selectedCell = null;
    
    renderSudoku();
    document.getElementById('sudoku-feedback').textContent = '';
    updateSudokuStats();
}

function renderSudoku() {
    const board = document.getElementById('sudoku-board');
    board.innerHTML = '';
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            const value = sudokuBoard[row][col];
            if (value !== 0) {
                cell.textContent = value;
                cell.classList.add('given');
            }
            
            cell.addEventListener('click', () => {
                selectCell(row, col);
            });
            
            board.appendChild(cell);
        }
    }
}

function selectCell(row, col) {
    // Only allow editing if cell is empty
    if (sudokuBoard[row][col] !== 0) return;
    
    // Clear previous selection
    document.querySelectorAll('.sudoku-cell.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    selectedCell = { row, col };
    const cells = document.querySelectorAll('.sudoku-cell');
    const index = row * 9 + col;
    cells[index].classList.add('selected');
}

function fillNumber(num) {
    if (!selectedCell) {
        document.getElementById('sudoku-feedback').textContent = '👆 Select an empty cell first!';
        return;
    }
    
    const { row, col } = selectedCell;
    
    // Check if correct
    if (num === sudokuSolution[row][col]) {
        sudokuBoard[row][col] = num;
        renderSudoku();
        
        // Check if complete
        if (isSudokuComplete()) {
            document.getElementById('sudoku-feedback').textContent = '🎉 Amazing, Tshidi! You solved it!';
            const points = 100;
            state.scores.number += points;
            state.scores.total += points;
            addFlowerToGarden();
            updateStats();
            saveState();
            setTimeout(() => newSudoku(), 3000);
        } else {
            document.getElementById('sudoku-feedback').textContent = '✅ Correct! Keep going!';
            selectedCell = null;
        }
    } else {
        // Wrong
        sudokuErrors++;
        document.getElementById('sudoku-feedback').textContent = `❌ Not quite, love! Try again. (${sudokuErrors} errors)`;
        
        if (sudokuErrors >= 3) {
            document.getElementById('sudoku-feedback').textContent = '💪 You got this, Tshidi! Here\'s a hint:';
            // Highlight correct number
            const cells = document.querySelectorAll('.sudoku-cell');
            const index = row * 9 + col;
            cells[index].classList.add('wrong');
            setTimeout(() => cells[index].classList.remove('wrong'), 2000);
        }
    }
    
    updateSudokuStats();
}

function clearCell() {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (sudokuBoard[row][col] !== 0) {
        sudokuBoard[row][col] = 0;
        renderSudoku();
        document.getElementById('sudoku-feedback').textContent = 'Cell cleared';
    }
}

function isSudokuComplete() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (sudokuBoard[row][col] === 0) return false;
        }
    }
    return true;
}

function updateSudokuStats() {
    const level = document.getElementById('num-level');
    if (level) {
        level.textContent = Math.floor(state.scores.number / 100) + 1;
    }
}

// Global functions
window.newSudoku = newSudoku;
window.fillNumber = fillNumber;
window.clearCell = clearCell;
window.initSudoku = initSudoku;

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    // Will be called on navigation
});
