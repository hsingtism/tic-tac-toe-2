const EVALUATION_MODE = true
const DEBUG = false

if (EVALUATION_MODE) {
    console.log('evaluation mode is enabled, make a valid call to interaction.user.makeMove or click a random cell to start')
}

if (DEBUG == false) {
    console.log = Function.prototype
    console.time = Function.prototype
    console.timeEnd = Function.prototype
}

function init() {
    for (let i = 0; i < 9; i++) {
        document.getElementById('board').innerHTML += `<div class="boardSpot" onclick="interaction.user.makeMove(${i})"><div id="board${i.toString()}" class="gamePieceImaginary gamePieceX gamePieceCenter"></div>`
    }
    document.getElementById('1player').onclick = () => interaction.user.playerCountSet(1)
    document.getElementById('2player').onclick = () => interaction.user.playerCountSet(2)
    scoreBoard.init()
}

const forceDisplayUpdate = () => new Promise(resolve => setTimeout(resolve, 0))

const x = 1
const o = -1 // COMPUTER ALWAYS O
const min = Math.min
const max = Math.max

const GameInfo = {
    gameMode: 1,
    moveCount: 0,
    nextMove: x,

    restart: () => {
        Board = Array(9).fill(0)
        GameInfo.moveCount = 0
        UIManagement.drawBoard()
        if (GameInfo.gameMode == 1 && GameInfo.nextMove == o && GameInfo.moveCount == 0) {
            interaction.computer.user = true
            interaction.computer.deny = false
            interaction.computer.promptMove()
        }
        if (EVALUATION_MODE) {
            evaluationManager()
        }
    },
    handleEnd: async (winner) => {
        if (winner === 0) scoreBoard.data.draw++
        if (winner == x) { scoreBoard.data.playerX++; scoreBoard.data.human++ }
        if (winner == o) { scoreBoard.data.playerO++; scoreBoard.data.computer++ }

        scoreBoard.updateScore()
        interaction.user.deny = true
        await forceDisplayUpdate()
        interaction.user.deny = false
        if (!EVALUATION_MODE) {
            if (winner === 0) {
                alert('Draw')
            } else {
                alert(
                    (GameInfo.gameMode == 1) ?
                        `You ${(winner == o) ? 'lose' : 'win'}`
                        :
                        `Player ${(winner == o) ? 'O' : 'X'} wins`
                )
            }
        }
        GameInfo.restart()
    }
}

let Board = Array(9).fill(0)
Board.linesSum = Array(8).fill(0)
Board.emptyCells = []

const scoreBoard = {

    data: {},

    updateScore: () => {
        // can't use ?? because of NaN created from the use of ++ above, but 0 has to be accounted
        document.getElementById('scoreL').innerHTML = Math.floor(scoreBoard.data.human + 0.1 || scoreBoard.data.playerX + 0.1).toString()
        document.getElementById('scoreM').innerHTML = (scoreBoard.data.draw).toString()
        document.getElementById('scoreR').innerHTML = Math.floor(scoreBoard.data.computer + 0.1 || scoreBoard.data.playerO + 0.1).toString()
    },

    init: () => {
        scoreBoard.data = (GameInfo.gameMode == 1) ? {
            human: 0,
            computer: 0,
            draw: 0
        } : {
            playerX: 0,
            playerO: 0,
            draw: 0
        }
        document.getElementById('scoreLabel0').innerHTML = (GameInfo.gameMode == 1) ? 'You' : 'Player X'
        document.getElementById('scoreLabel1').innerHTML = (GameInfo.gameMode == 1) ? 'Computer' : 'Player O'
        scoreBoard.updateScore()
    }
}

const interaction = {

    user: {
        deny: false,

        playerCountSet: (mode) => {
            GameInfo.gameMode = mode
            scoreBoard.init()
            GameInfo.restart()
            UIManagement.playerCountSelectionUpdate(mode)
        },

        makeMove: (position) => {
            if (Board[position] != 0 || interaction.user.deny) return
            Board[position] = GameInfo.nextMove
            if (interaction.updateAndCheckWin()) return
            if (GameInfo.gameMode == 1 && GameInfo.nextMove == o) {
                interaction.user.deny = true
                interaction.computer.deny = false
                interaction.computer.promptMove()
            }
        }

    },

    computer: {
        deny: true,

        promptMove: () => {
            console.time('move')
            const position = moveGeneration()
            if (Board[position] != 0 || interaction.computer.deny) {
                console.error(`computer tried to make an illegal ot denied move; position ${position}`)
                console.log(interaction.computer.deny)
                console.trace()
                alert("COMPUTER TRIED TO MAKE AN ILLEGAL OR DENIED MOVE. CHECK CONSOLE OR RELOAD PAGE")
                return
            }
            Board[position] = GameInfo.nextMove
            interaction.computer.deny = true
            interaction.user.deny = false
            interaction.updateAndCheckWin()
            if(EVALUATION_MODE) evaluationManager()
            console.timeEnd('move')
        }
    },

    updateAndCheckWin() {
        GameInfo.nextMove *= -1
        GameInfo.moveCount++
        UIManagement.drawBoard()
        if (BoardSup.checkWin()) {
            GameInfo.handleEnd(BoardSup.checkWin())
            return true
        }
        if (GameInfo.moveCount == 9) {
            GameInfo.handleEnd(0)
            return true
        }
    }

}

const UIManagement = {

    playerCountSelectionUpdate: (mode) => {
        const selectionClasses = [null, '1player', '2player']
        const selectedClass = 'firstMoveSelected'
        document.getElementById(selectionClasses[mode]).classList.add(selectedClass)
        document.getElementById(selectionClasses[mode - 1] || selectionClasses[mode + 1]).classList.remove(selectedClass)
    },

    drawBoard: () => {
        if (EVALUATION_MODE) return
        for (let i = 0; i < 9; i++) {
            const activeElement = document.getElementById(`board${i.toString()}`)
            activeElement.classList = 'gamePieceCenter'
            switch (Board[i]) {
                case x:
                    activeElement.classList.add('gamePieceDisplay')
                    activeElement.classList.add('gamePieceX')
                    break
                case o:
                    activeElement.classList.add('gamePieceDisplay')
                    activeElement.classList.add('gamePieceO')
                    break
                case 0:
                    activeElement.classList.add('gamePieceImaginary')
                    activeElement.classList.add(
                        (GameInfo.nextMove == x) ? 'gamePieceX' : 'gamePieceO'
                    )
                    break
            }
        }
    },
}

const BoardSup = {
    linesSumIndex: [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ],

    // use false or empty for main board, else only input valid board array
    updateData: (board) => {
        const wBoard = (board) ? board : Board
        const wi = {linesSum: []}
        for (let i = 0; i < 8; i++) {
            const workingIndices = BoardSup.linesSumIndex[i]
            const wbd = [wBoard[workingIndices[0]], wBoard[workingIndices[1]], wBoard[workingIndices[2]]]//working board data
            wi.linesSum[i] = wbd[0] + wbd[1] + wbd[2]
        }
        wi.emptyCells = BoardSup.listEmptyCells(wBoard)
        if (board) return wi
        Board.emptyCells = wi.emptyCells
        Board.linesSum = wi.linesSum
    },

    checkWin: (board) => {
        const wBoard = (board) ? board : Board
        const lsa = BoardSup.updateData(wBoard).linesSum
        if (max(...lsa) == 3) return 1
        if (min(...lsa) == -3) return -1
        return 0
    },

    listEmptyCells: (board) => {
        let l = []
        for (let i = 0; i < 9; i++) {
            if (board[i] === 0) l.push(i)
        }
        return l
    }
}

const Random = {
    rint: r => Math.floor(Math.random() * r),
    corners: () => [0, 2, 6, 8][Random.rint(4)],
    sides: () => Random.rint(4) * 2 + 1,
    center: () => 4,
    uniform: () => Random.rint(8)
}

function moveGeneration() {
    BoardSup.updateData()
    const empty = Board.emptyCells

    let board = Array(9); let n = 9 // data must be cleaned for downstream functions
    while (n--) board[n] = Board[n]

    if (GameInfo.moveCount < 2) { // optional optimization
        const userPos = board.indexOf(-GameInfo.nextMove)
        if (userPos == 4 || userPos == -1) return Random.corners()
        return Random.center()
    }

    let tempEval = Infinity
    let bestPos
    let tempBoard = board
    for (let i = 0; i < empty.length; i++) {
        tempBoard[empty[i]] = GameInfo.nextMove
        let ec = eval(tempBoard, false, GameInfo.moveCount) // preevnt multiple calls
        tempBoard[empty[i]] = 0
        if (ec < tempEval) {
            tempEval = ec
            bestPos = empty[i]
        }
    }
    console.log('function calls', evalcalls); evalcalls = 0
    return bestPos

}

let evalcalls = 0
// because of the way the cells are enumerated, the computer will aim for the lowest evaluation score
function eval(board, maximizingplayer, moveCount) {
    evalcalls++
    const win = BoardSup.checkWin(board)
    if (win) return win
    const empty = BoardSup.listEmptyCells(board)
    if (empty.length == 0) return 0
    let filterFunction, tempEval

    if (maximizingplayer) {
        tempEval = Infinity
        filterFunction = min
    } else {
        tempEval = -Infinity
        filterFunction = max
    }

    let tempBoard = board
    for (let i = 0; i < empty.length; i++) {
        tempBoard[empty[i]] = maximizingplayer ? GameInfo.nextMove : -GameInfo.nextMove
        tempEval = filterFunction(tempEval, eval(tempBoard, !maximizingplayer, moveCount + 1))
        tempBoard[empty[i]] = 0
    }

    return tempEval
}

function evaluationManager() {
    BoardSup.updateData()
    interaction.user.makeMove(Board.emptyCells[Random.rint(Board.emptyCells.length)])
} 

const res = () => scoreBoard.data.computer / scoreBoard.data.draw
