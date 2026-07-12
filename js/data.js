// Data for Tshidi's Forever Garden

const WORDS = [
    // Love-themed words
    { word: 'LOVE', hint: 'What I feel for you' },
    { word: 'HEART', hint: 'It beats for you' },
    { word: 'SMILE', hint: "You make me ___" },
    { word: 'KISS', hint: 'A sweet gesture' },
    { word: 'HUG', hint: 'Warm embrace' },
    { word: 'FOREVER', hint: 'Always and ___' },
    { word: 'SWEET', hint: "You're so ___" },
    { word: 'ANGEL', hint: 'Heavenly being' },
    { word: 'DREAM', hint: "You're my ___" },
    { word: 'STAR', hint: 'Shining bright' },
    { word: 'MOON', hint: 'Night sky beauty' },
    { word: 'SUNSHINE', hint: 'Brightens my day' },
    { word: 'FLOWER', hint: 'Blooming beauty' },
    { word: 'BUTTERFLY', hint: 'Beautiful wings' },
    { word: 'RAINBOW', hint: 'Colors of love' },
    { word: 'GARDEN', hint: 'Where love grows' },
    { word: 'TSHIDI', hint: 'The most beautiful name 💕' },
    { word: 'BOO', hint: 'My pet name for you' },
    { word: 'PRECIOUS', hint: 'You are ___' },
    { word: 'WONDERFUL', hint: 'Full of wonder' }
];

const LOGIC_PUZZLES = [
    {
        question: "If I have 3 hearts and give you 2, how many hearts do I have left? ❤️",
        answer: "1"
    },
    {
        question: "What comes once in a minute, twice in a moment, but never in a thousand years?",
        answer: "m"
    },
    {
        question: "I have 5 fingers, but no hands. What am I?",
        answer: "glove"
    },
    {
        question: "What has keys but no locks, space but no room?",
        answer: "keyboard"
    },
    {
        question: "What can you hold in your left hand but not in your right?",
        answer: "elbow"
    },
    {
        question: "What has a head and a tail but no body?",
        answer: "coin"
    },
    {
        question: "What gets wetter as it dries?",
        answer: "towel"
    },
    {
        question: "What has many teeth but cannot bite?",
        answer: "comb"
    },
    {
        question: "What has words but never speaks?",
        answer: "book"
    },
    {
        question: "What runs but never walks, has a bed but never sleeps?",
        answer: "river"
    }
];

const FLOWERS = ['🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '💐', '🌿', '🍀', '🌺', '🌸', '🌻'];

// Generate Sudoku puzzles (simplified for prototype)
function generateSudokuPuzzle() {
    // Pre-generated solved board
    const solved = [
        [5,3,4,6,7,8,9,1,2],
        [6,7,2,1,9,5,3,4,8],
        [1,9,8,3,4,2,5,6,7],
        [8,5,9,7,6,1,4,2,3],
        [4,2,6,8,5,3,7,9,1],
        [7,1,3,9,2,4,8,5,6],
        [9,6,1,5,3,7,2,8,4],
        [2,8,7,4,1,9,6,3,5],
        [3,4,5,2,8,6,1,7,9]
    ];
    
    // Create puzzle by removing numbers
    const puzzle = solved.map(row => [...row]);
    const cellsToRemove = 40; // Easy difficulty
    let removed = 0;
    while (removed < cellsToRemove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (puzzle[row][col] !== 0) {
            puzzle[row][col] = 0;
            removed++;
        }
    }
    
    return { puzzle, solved };
}
