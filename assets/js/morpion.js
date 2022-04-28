const GAMES = {
    cpu: "X",
    you: "O",
    youScore: 0,
    cpuScore: 0,
    reset: false,
    moveCounter: 0,
    firstStart: true,
    playagain: false,
    board: [0, 1, 2, 3, 4, 5, 6, 7, 8]
};

const color = {
    cpu: "",
    player: ""
}
let turn = GAMES.firstStart; // true = you; false=cpu

document.addEventListener('load', showOverlay());

// Affiche ou Cahche l'overlay
function showOverlay() {
    document.querySelector("#overlay").classList.toggle("d-none")
}

function showLayer() {
    document.querySelector(".layer").classList.toggle("d-none");
}

function showLayer2() {
    document.querySelector(".layer2").classList.toggle("d-none");
}

// Récupération des cases à clicker
const items = document.getElementsByClassName('grid-item');

function choosePawn(id) {
    if (id == "idX") {
        GAMES.you = "X";
        GAMES.cpu = "O"
        color.you = "color1"
        color.cpu = "color2"
    } else {
        GAMES.you = "O";
        GAMES.cpu = "X"
        color.you = "color2"
        color.cpu = "color1"
    }
    showLayer()
    showOverlay()
    if (GAMES.playagain) {
        playAgain();
    }
}


// Mise a jour du tableau représentatant le jeu 
function updateBoard(id, player) {
    let index = parseInt(id[4]) - 1;
    GAMES.board[index] = player;
}


// Marquage d'un case
function markSquare(id, player) {
    let square = document.querySelector("#" + id)

    if (player == GAMES.cpu) {
        square.textContent = player;
        square.classList.add(color.cpu)
    } else {
        square.textContent = player;
        square.classList.add(color.you)
    }
}

// Verifie s'il y a un gagnant
function boardSatus(board, player) {
    let result = {
            isWinner: false,
            who: player
        },
        LINE = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8]
        ],
        COL = [
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8]
        ],
        DIAG = [
            [0, 4, 8],
            [2, 4, 6]
        ],
        i = 0,
        winPattern = player.repeat(3),
        now = "";
    // Verifier les lignes
    for (i = 0; i < LINE.length; i++) {
        now = board[LINE[i][0]] + board[LINE[i][1]] + board[LINE[i][2]];
        if (now === winPattern) {
            result.isWinner = true;
            return result;
        }
    }
    // Verifier les colones
    for (i = 0; i < COL.length; i++) {
        now = board[COL[i][0]] + board[COL[i][1]] + board[COL[i][2]];
        if (now === winPattern) {
            result.isWinner = true;
            return result;
        }
    }
    // verifier les diagonales
    for (i = 0; i < DIAG.length; i++) {
        now = board[DIAG[i][0]] + board[DIAG[i][1]] + board[DIAG[i][2]];
        if (now === winPattern) {
            result.isWinner = true;
            return result;
        }
    }
    return result;
}

// Alterne le marqueur de tour
function switchTurn() {
    document.querySelector(".cpu-turn").classList.toggle("turn");
    document.querySelector(".player-turn").classList.toggle("turn");
}


// Le cpu joue
function cpuMove() {
    /* Algorithme Minimax  pour trouver 
     * le meilleur emplacemnt pour le pion du cpu 
     */
    function miniMax(board, player) {
        var emptyIndex = getEmptySquares();
        if (boardSatus(board, GAMES.you).isWinner) {
            return { score: -10 };
        } else if (boardSatus(board, GAMES.cpu).isWinner) {
            return { score: 10 };
        } else if (emptyIndex.length === 0) {
            return { score: 0 };
        }
        var moves = [];
        for (var i = 0; i < emptyIndex.length; i++) {
            var move = {};
            move.index = board[emptyIndex[i]];
            board[emptyIndex[i]] = player;
            if (player == GAMES.cpu) {
                var result = miniMax(board, GAMES.you);
                move.score = result.score;
            } else {
                var result = miniMax(board, GAMES.cpu);
                move.score = result.score;
            }
            board[emptyIndex[i]] = move.index;
            moves.push(move);
        }

        var bestMove;
        if (player === GAMES.cpu) {
            var bestScore = -10000;
            for (var i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            var bestScore = 10000;
            for (var i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }
        return moves[bestMove];
    }

    console.log("find move")
        // Marque la case  retourné par l'algo MiniMax
    let move = miniMax(GAMES.board, GAMES.cpu),
        id = "item" + (move.index + 1);
    console.log(move)
    markSquare(id, GAMES.cpu)
    updateBoard(id, GAMES.cpu);
    if (boardSatus(GAMES.board, GAMES.cpu).isWinner) {
        showResult("cpu");
    } else {
        if (getEmptySquares().length == 0) {
            showResult("draw");
        } else {
            switchTurn();
            turn = true;
        }
    }
}



// Verifie si la case cliqué est vide
function isEmpty(id) {
    let index = parseInt(id[4]) - 1;
    return (typeof GAMES.board[index] === "number") ? true : false;
}


/* Marque la case choisie par l'utilisateur s'il est vide
 * et alterne le tour.
 */
function choiseCase(id) {
    if (isEmpty(id)) {
        if (turn) {
            markSquare(id, GAMES.you);
            updateBoard(id, GAMES.you);
            GAMES.moveCounter++;
            turn = false;
            if (boardSatus(GAMES.board, GAMES.you).isWinner) {
                showResult("player")
            } else {
                if (getEmptySquares().length == 0) {
                    showResult("draw");
                } else {
                    switchTurn();
                    setTimeout(cpuMove, 500);
                }
            }
        }
    }
}



// Lister les emplacement vide
function getEmptySquares() {
    return GAMES.board.filter(item => typeof item === "number")
}

// Mise à jour du leaderboard
function updateScore(result) {
    switch (result) {
        case "player":
            document.querySelector(".you-score").textContent = GAMES.youScore;
            break;
        case "cpu":
            document.querySelector(".cpu-score").textContent = GAMES.cpuScore;
            break;
        default:
            break;
    }
}



// Affichage du resultat
function showResult(result) {
    showOverlay();
    let text = "";
    if (result == "player") {
        GAMES.youScore++;
        text = "Win <br> Score +1"
    } else {
        if (result == "cpu") {
            text = "Defeat <br> CPU Score +1"
            GAMES.cpuScore++;
        } else {
            if (result == "draw") {
                text = "DRAW"
            }
        }
    }
    document.querySelector(".layer2 > .game-result").innerHTML = text;
    showLayer2()
    updateScore(result);
}



// Réjoué une partie
function playAgain() {
    console.log("Play Now")
    GAMES.reset ? {} : turn = !(GAMES.firstStart);
    GAMES.firstStart = turn;
    if (turn) {
        if (document.querySelector(".cpu-turn").classList.contains("turn")) {
            document.querySelector(".cpu-turn").classList.toggle("turn");
            document.querySelector(".player-turn").classList.toggle("turn");

        }

    } else {
        console.log("Cpu Turn")
        if (document.querySelector(".player-turn").classList.contains("turn")) {
            document.querySelector(".player-turn").classList.toggle("turn");
            document.querySelector(".cpu-turn").classList.toggle("turn");
        }
        setTimeout(cpuMove, 700)
    }

}

// Nouvelle partie;
function again() {
    reset();
    GAMES.playagain = true;
    GAMES.reset ? {} : showLayer2();
    showLayer();
}

// Vide le contenu de toute les cases
function reset() {
    for (var i = 0; i < items.length; i++) {
        items[i].textContent = ''
        if (items[i].classList.contains("color1")) {
            items[i].classList.remove("color1")
        }
        if (items[i].classList.contains("color2")) {
            items[i].classList.remove("color2")
        }
    }
    GAMES.board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    GAMES.moveCounter = 0;
}

// Réinitialise le jeux
function resetGame() {
    console.log("game reset")
    GAMES.youScore = 0;
    GAMES.cpuScore = 0;
    GAMES.moveCounter = 0;
    GAMES.firstStart = true;
    turn = GAMES.firstStart;
    GAMES.reset = true;
    updateScore("player");
    updateScore("cpu");
    showOverlay();
    again();
}