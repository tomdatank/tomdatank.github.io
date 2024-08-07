const X_CLASS = 'x';
const O_CLASS = 'o';
const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const superBoardElement = document.querySelector('.super-board');
const boardElements = document.querySelectorAll('.board');
const statusElement = document.querySelector('.status');
const resetButton = document.getElementById('resetButton');
const increaseSizeButton = document.getElementById('increaseSizeButton');
const decreaseSizeButton = document.getElementById('decreaseSizeButton');
const container = document.querySelector('.container');
const title = container.querySelector('h1'); // Select the title element
const rulesButton = document.getElementById('rulesButton');
const modal = document.getElementById('rulesModal');
const closeModalButton = modal.querySelector('.close');

let oTurn; // Tracks whose turn it is
let gameEnded = false; // Tracks if the game has ended
let nextBoardIndex = null; // Tracks the index of the next board to play in
let scale = 1; // Tracks the scale of the game



// Event listeners for the buttons at the bottom
resetButton.addEventListener('click', startGame);
increaseSizeButton.addEventListener('click', () => adjustSize(0.1));
decreaseSizeButton.addEventListener('click', () => adjustSize(-0.1));


// Event listener to open the modal
rulesButton.addEventListener('click', () => {
    modal.style.display = 'block';
});

// Event listener to close the modal
closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Event listener to close the modal when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});



startGame();

//the startGame function to properly reset the game state
function startGame() {
    oTurn = false; // X always starts first
    gameEnded = false; // Reset game ended status
    nextBoardIndex = null; // Reset next board index
    boardElements.forEach(board => {
        board.innerHTML = ''; // Clear previous content
        board.classList.remove('won'); // Remove any won classes from previous games
        board.style.backgroundColor = ''; // Reset background color
        board.style.border = ''; // Reset border
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.cell = ''; // Mark the cell as a game cell
            cell.dataset.index = i; // Mark the cell with its index
            board.appendChild(cell);
            cell.addEventListener('click', handleClick); // Add click event listener to each cell
        }
    });
    setStatusMessage("Player X's turn");
    highlightNextBoard(); // Highlight the initial board
}


function handleClick(e) {
    if (gameEnded) return; // Prevent any moves if the game has ended
    const cell = e.target;
    const board = cell.parentElement;
    const currentClass = oTurn ? O_CLASS : X_CLASS;
    const cellIndex = parseInt(cell.dataset.index);

    // Only allow moves in the highlighted board unless it's already won
    if (nextBoardIndex !== null && board !== boardElements[nextBoardIndex] && !boardElements[nextBoardIndex].classList.contains('won')) {
        // Prevent marking the cell as played if it's not in the correct board
        e.stopImmediatePropagation(); // Prevent the click event from propagating
        return;
    } 
    if (cell.textContent != 'X' && cell.textContent != 'O' && !board.classList.contains('won')) { // Ensure the cell is empty and the board is not already won
        placeMark(cell, currentClass); // Place the current player's mark
        if (checkWin(currentClass, board)) {
            endGame(false, board, currentClass); // If current player wins, end the game for the board
        } else if (isDraw(board)) {
            endGame(true, board); // If it's a draw, end the game for the board
        } else {
            swapTurns(); // Swap turns only if the game continues
            setStatusMessage(`Player ${oTurn ? "O" : "X"}'s turn`);
        }
        nextBoardIndex = cellIndex; // Update the next board index based on the last move
        if (boardElements[nextBoardIndex].classList.contains('won')) {
            nextBoardIndex = null; // Allow move anywhere if the target board is already won
        }
        highlightNextBoard(); // Highlight the next board
    }
}

function endGame(draw, board, currentClass) {
    if (draw) {
        setStatusMessage('Draw!');
    } else {
        setStatusMessage(`Player ${oTurn ? "O" : "X"} wins!`);
        board.classList.add('won'); // Mark the board as won
        board.style.backgroundColor = '#2c2c2c'; // Set the background color to match the page background
        colorWinningCells(board, currentClass); // Color the winning cells
    }
    // Check for super win only if it was not a draw
    if (!draw && checkSuperWin(currentClass)) {
        console.log(`Super win detected for ${currentClass}`); // Debug statement
        setStatusMessage(`Player ${currentClass === X_CLASS ? "X" : "O"} wins the entire game!`);
        boardElements.forEach(board => board.classList.add('won')); // Mark all boards as won
        gameEnded = true; // End the game
    } else if (!draw) {
        swapTurns(); // Ensure the turn is swapped after a win or draw
        setStatusMessage(`Player ${oTurn ? "O" : "X"}'s turn`); // Update the status message to indicate the next player's turn
    }
}

function isDraw(board) {
    return [...board.children].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS); // Check if every cell is filled
    });
}

function placeMark(cell, currentClass) {
    cell.textContent = currentClass === X_CLASS ? 'X' : 'O'; // Place X or O in the cell
    cell.classList.add(currentClass); // Add the respective class
}

function swapTurns() {
    oTurn = !oTurn; // Swap the turn
}

function checkWin(currentClass, board) {
    const cells = board.children;
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return cells[index].classList.contains(currentClass); // Check if the current player has any winning combination
        });
    });
}

function colorWinningCells(board, currentClass) {
    const xShape = [0, 2, 4, 6, 8];
    const oShape = [1, 3, 5, 7];
    const cells = board.children;

    if (currentClass === X_CLASS) {
        xShape.forEach(index => {
            cells[index].style.backgroundColor = 'red'; // Color cells for X
        });
    } else {
        oShape.forEach(index => {
            cells[index].style.backgroundColor = 'rgb(70, 135, 255)'; // Color cells for O
        });
    }
}

function checkSuperWin(currentClass) {
    const superBoard = Array.from(boardElements).map(board => board.classList.contains('won') && checkWinningPlayer(board, currentClass));
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => superBoard[index]); // Check if the current player has won the super game
    });
}

function checkWinningPlayer(board, currentClass) {
    const winningCells = [...board.children].filter(cell => cell.classList.contains(currentClass));
    return winningCells.length >= 3; // Check if the player has at least three cells
}

function setStatusMessage(message) {
    statusElement.textContent = message; // Update the status message
}

function adjustSize(amount) {
    scale += amount;
    container.style.transform = `scale(${scale})`;
    adjustContainerPosition();
}

function adjustContainerPosition() {
    const offset = (scale - 1) * 50; // Adjust this value as needed
    container.style.marginTop = `${offset}px`;
    container.style.marginBottom = `${offset}px`;
    title.style.fontSize = `${scale * 2}em`; // Scale the title font size
}

function highlightNextBoard() {
    boardElements.forEach((board, index) => {
        if (index === nextBoardIndex) {
            board.style.border = '2px solid yellow'; // Highlight the next board
        } else {
            board.style.border = ''; // Remove the highlight from other boards
        }
    });
}