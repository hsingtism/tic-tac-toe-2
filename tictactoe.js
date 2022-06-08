let board //array of 3 3 long arrays
let moveCount //positive integer
let boardSum = [] //horizontal 1 - 3, then vertical 1 - 3, then slant pos and slant neg

let boardSumIndexes = [
    [[0,0],[0,1],[0,2]],
    [[1,0],[1,1],[1,2]],
    [[2,0],[2,1],[2,2]],
    [[0,0],[1,0],[2,0]],
    [[0,1],[1,1],[2,1]],
    [[0,2],[1,2],[2,2]],
    [[2,0],[1,1],[0,2]],
    [[0,0],[1,1],[2,2]]
]

//starts or restarts game whenever called
function initGame() {
    board = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ]
    moveCount = 0
    boardUpdate()
    if (firstMove == -1 && playerCount == 1) {
        moveGenerationManager()
    }
}

//also manages wins and draws
function boardSumSum() {
    //horizontal 1 - 3, then vertical 1 - 3, then slant pos and slant neg
    boardSum[0] = board[0][0] + board[0][1] + board[0][2]
    boardSum[1] = board[1][0] + board[1][1] + board[1][2]
    boardSum[2] = board[2][0] + board[2][1] + board[2][2]
    boardSum[3] = board[0][0] + board[1][0] + board[2][0]
    boardSum[4] = board[0][1] + board[1][1] + board[2][1]
    boardSum[5] = board[0][2] + board[1][2] + board[2][2]
    boardSum[6] = board[2][0] + board[1][1] + board[0][2]
    boardSum[7] = board[0][0] + board[1][1] + board[2][2]
    let max = Math.max(...boardSum)
    let min = Math.min(...boardSum)
    let maxAbs = Math.max(max, Math.abs(min))
    if(maxAbs == 3){
        lineDetection()
        return
    } 
    if(moveCount == 9){ //draw
        alert('draw')
        scoreboardUpdate(0)
        initGame()
    }
}

//detect wins
function lineDetection() {
    let posWin = boardSum.indexOf(3)
    let negWin = boardSum.indexOf(-3)
    posWin++ //makes whatever is -1 to 0 so can do bool directly
    negWin++
    if(playerCount == 2) { // swap for 2 player mode
        let tmp = posWin
        posWin = negWin
        negWin = tmp
    }
    if(negWin) { 
        if (playerCount == 1) alert('you lose')
        scoreboardUpdate(-1)
    } else {
        if (playerCount == 1) alert('you win')
        scoreboardUpdate(1)
    }
    initGame()
}

function moveGenerationManager() {
    if(lineFragmentDetection() != -1) { //if there is two in a row, take it
        findEmptyToMoveIndex = lineFragmentDetection()
        for(let i=0;i<3;i++){
            if(board[boardSumIndexes[findEmptyToMoveIndex][i][0]][boardSumIndexes[findEmptyToMoveIndex][i][1]] == 0){ //i am having a stroke
                computerMove(boardSumIndexes[findEmptyToMoveIndex][i][0],boardSumIndexes[findEmptyToMoveIndex][i][1])
                return
            } 
        }
    } else if(moveCount == 1) { //take corners, if corners taken, take middle
        if(board[0][1] || board[1][0]){
            computerMove(0,0)
        } else if (board[1][2] || board[2][1]){
            computerMove(2,2)
        } else if(board[1][1]){
            computerMove(corners(),corners())
            return
        } else {
            computerMove(1,1)
            return
        }
    } else if (moveCount <= 2 || (moveCount == 3 && board[1][1] == 1)) {
        let lc = true
        while(lc){
            let x = corners()
            let y = corners()
            if(board[x][y] == 0){
                computerMove(x,y)
                lc = false
                return
            }
        }
    } else if (moveCount == 3) {
        if(board[1][1]){
            let lc4 = true
            while(lc4){ //TODO rewrite this
                let sides = [[0,1],[1,0],[1,2],[2,1]]
                let randSideUnchecked = Math.floor(Math.random()*sides.length)
                if(board[sides[randSideUnchecked][0]][sides[randSideUnchecked][1]] == 0){
                    computerMove(sides[randSideUnchecked][0],sides[randSideUnchecked][1])
                    lc4 = false
                    return
                }
            }
        } else {
            computerMove(1,1)
        }
    } else if (moveCount == 4 && board[1][1] == 0){
        computerMove(1,1)
    } else { 
        //make a random valid move
        for(i=0;i<3;i++){
            for(j=0;j<3;j++){
                if(board[i][j] == 0){
                    computerMove(i,j)
                    return
                }
            }
        }
    }
}

//detects next-step wins
function lineFragmentDetection() {
    if(boardSum.indexOf(-2) != -1){ //make sure -2 is first
        return boardSum.indexOf(-2)
    } else if (boardSum.indexOf(2) != -1){
        return boardSum.indexOf(2)
    } else {
        return -1
    }
}

//ensure manager makes a valid move
function computerMove(x,y) {
    board[x][y] = inputtingUser
    inputtingUser *= -1
    moveCount++
    boardUpdate()
    boardSumSum()
}

function corners(){
    if (Math.random() < 0.5){
        return 0
    } else {
        return 2
    }
}

function randIndex(){
    return Math.floor(Math.random()*3)
}

