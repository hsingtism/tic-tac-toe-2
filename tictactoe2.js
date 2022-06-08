function init() {
    for (let i = 0; i < 9; i++) {
        document.getElementById('board').innerHTML += `<div class="boardSpot" onclick="interaction.user.makeMove(${i})"><div id="board${i.toString()}" class="gamePieceImaginary gamePieceX gamePieceCenter"></div>`
    }
    document.getElementById('1player').onclick = () => interaction.user.playerCountSet(1)
    document.getElementById('2player').onclick = () => interaction.user.playerCountSet(2)
    scoreBoard.clear()
}

let GameInfo = {
    gameActive: false,
    gameMode: 1,
    nextMove: null,
}

let Board = Array(9).fill(0)

let scoreBoard = {

    data: {},

    updateLabels: () => {
        document.getElementById('scoreLabel0').innerHTML = (GameInfo.gameMode == 1) ? 'You' : 'Player X'
        document.getElementById('scoreLabel1').innerHTML = (GameInfo.gameMode == 1) ? 'Computer' : 'Player O'
    },

    updateScore: () => {
        document.getElementById('scoreL').innerHTML = (scoreBoard.data.human ?? scoreBoard.data.playerX).toString()
        document.getElementById('scoreM').innerHTML = (scoreBoard.data.draw).toString()
        document.getElementById('scoreR').innerHTML = (scoreBoard.data.computer ?? scoreBoard.data.playerO).toString() 
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
    }

}

let interaction = {
    user: {

        playerCountSet: (mode) => {
            GameInfo.gameMode = mode
            scoreBoard.updateLabels()
            scoreBoard.clear()
            UIManagement.playerCountSelectionUpdate(mode)
        },

        makeMove: (position) => {
            return //TODO
        }

    }
}

let UIManagement = {

    playerCountSelectionUpdate: (mode) => {
        let selectionClasses = [null, '1player', '2player']
        let selectedClass = 'firstMoveSelected'
        document.getElementById(selectionClasses[mode]).classList.add(selectedClass)
        document.getElementById(selectionClasses[mode - 1] || selectionClasses[mode + 1]).classList.remove(selectedClass)
    },

    drawBoard: () => {
        console.log('called')
    }

}
