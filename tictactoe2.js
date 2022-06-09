function init() {
    for (let i = 0; i < 9; i++) {
        document.getElementById('board').innerHTML += `<div class="boardSpot" onclick="interaction.user.makeMove(${i})"><div id="board${i.toString()}" class="gamePieceImaginary gamePieceX gamePieceCenter"></div>`
    }
    document.getElementById('1player').onclick = () => interaction.user.playerCountSet(1)
    document.getElementById('2player').onclick = () => interaction.user.playerCountSet(2)
    scoreBoard.init()
}

/* originally this was to add a delay so the alerts for game end will not
   send after the board stops updating, but for some reason even a delay
   of zero allows for the board to finish drawing. i do not understand async
   js and all this stuff */
const ALERT_DELAY = 0 
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const x = 1
const o = -1 // COMPUTER ALWAYS O
const abs = Math.abs
const sgn = Math.sign
const min = Math.min
const max = Math.max

const GameInfo = {
    gameMode: 1,
    moveCount: 0,
    nextMove: x,

    restart : () => {
        Board = Array(9).fill(0)
        GameInfo.moveCount = 0
        UIManagement.drawBoard()
        if (GameInfo.gameMode == 1 && GameInfo.nextMove == o && GameInfo.moveCount == 0) {
            interaction.computer.promptMove()
        }
    },
    switchActive : () => {
        GameInfo.nextMove *= -1
        GameInfo.moveCount++
    },
    handleEnd: (winner) => {
        if(winner === 0) scoreBoard.data.draw++
        if(winner == x) {scoreBoard.data.playerX++; scoreBoard.data.human++}
        if(winner == o) {scoreBoard.data.playerO++; scoreBoard.data.computer++}

        scoreBoard.updateScore() 
        interaction.announce.gameEnd(winner)
    }
}

let Board = Array(9).fill(0)
Board.linesSum = Array(8).fill(0)
Board.linesOccup = Array(8).fill(0)
Board.lastEmpty = Array(8).fill(null) // with respect to linesSumIndex

const scoreBoard = {

    data: {},

    updateLabels: () => {
        document.getElementById('scoreLabel0').innerHTML = (GameInfo.gameMode == 1) ? 'You' : 'Player X'
        document.getElementById('scoreLabel1').innerHTML = (GameInfo.gameMode == 1) ? 'Computer' : 'Player O'
    },

    updateScore: () => {
        // can't use ?? because of NaN created from the use of ++ above, but 0 has to be accounted
        document.getElementById('scoreL').innerHTML = Math.floor(scoreBoard.data.human + 0.1 || scoreBoard.data.playerX + 0.1).toString() 
        document.getElementById('scoreM').innerHTML = (scoreBoard.data.draw).toString()
        document.getElementById('scoreR').innerHTML = Math.floor(scoreBoard.data.computer + 0.1 || scoreBoard.data.playerO + 0.1).toString() 
    },

    clear: () => {
        scoreBoard.data = (GameInfo.gameMode == 1) ? {
            human: 0,
            computer: 0,
            draw: 0
        } : {
            playerX : 0,
            playerO : 0,
            draw: 0
        }
    },
    
    init: () => {
        scoreBoard.clear()
        scoreBoard.updateLabels()
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
                interaction.computer.promptMove()
            }
        }

    },

    computer: {
        deny: false,

        makeMove: (position) => {
            if (Board[position] != 0 || interaction.computer.deny) {
                console.error(`computer tried to make an illegal ot denied move; position ${position}`)
                console.trace()
                alert("COMPUTER TRIED TO MAKE AN ILLEGAL OR DENIED MOVE. CHECK CONSOLE OR RELOAD PAGE")
                return
            }
            Board[position] = GameInfo.nextMove
            interaction.updateAndCheckWin()
        },

        promptMove: moveGeneration
    },

    announce: {
        gameEnd: async (player) => {
            interaction.user.deny = true
            await sleep(ALERT_DELAY)
            interaction.user.deny = false
            if (player === 0) {
                alert('Draw')
            } else {
                alert(
                    (GameInfo.gameMode == 1)?
                    `You ${(player == o) ? 'lose' : 'win'}`
                    :
                    `Player ${(player == o) ? 'O' : 'X'} wins`
                    )
            }
            GameInfo.restart()
        }
    },

    updateAndCheckWin() {
        GameInfo.switchActive()
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
        for(let i = 0; i < 9; i++) {
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
        const wi = {
            linesSum: [], linesOccup: [], lastEmpty: []
        }
        for(let i = 0; i < 8; i++) {
            const workingIndices = BoardSup.linesSumIndex[i]
            const wbd = [wBoard[workingIndices[0]], wBoard[workingIndices[1]], wBoard[workingIndices[2]]]//working board data
            wi.linesSum[i] = wbd[0] + wbd[1] + wbd[2]
            wi.linesOccup[i] = abs(wbd[0]) + abs(wbd[1]) + abs(wbd[2])
            wi.lastEmpty[i] = (wi.linesOccup[i] == 2) ? wbd.indexOf(0) : null
        }
        if (board) return wi
        Board.linesSum = wi.linesSum
        Board.linesOccup = wi.linesOccup
        Board.lastEmpty = wi.lastEmpty
    },

    checkWin: (board) => {
        const wBoard = (board) ? board : Board
        const lsa = BoardSup.updateData(wBoard).linesSum
        if (max(...lsa) == 3) return 1
        if (min(...lsa) == -3) return -1
        return 0
    }
}

function moveGeneration() {
    interaction.computer.makeMove(Board.indexOf(0))
}
