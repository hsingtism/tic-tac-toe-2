function moveGenerationManager() {
    if (lineFragmentDetection() != -1) { //if there is two in a row, take it
        findEmptyToMoveIndex = lineFragmentDetection()
        for (let i = 0; i < 3; i++) {
            if (board[boardSumIndexes[findEmptyToMoveIndex][i][0]][boardSumIndexes[findEmptyToMoveIndex][i][1]] == 0) { //i am having a stroke
                computerMove(boardSumIndexes[findEmptyToMoveIndex][i][0], boardSumIndexes[findEmptyToMoveIndex][i][1])
                return
            }
        }
    } else if (moveCount == 1) { //take corners, if corners taken, take middle
        if (board[0][1] || board[1][0]) {
            computerMove(0, 0)
        } else if (board[1][2] || board[2][1]) {
            computerMove(2, 2)
        } else if (board[1][1]) {
            computerMove(corners(), corners())
            return
        } else {
            computerMove(1, 1)
            return
        }
    } else if (moveCount <= 2 || (moveCount == 3 && board[1][1] == 1)) {
        let lc = true
        while (lc) {
            let x = corners()
            let y = corners()
            if (board[x][y] == 0) {
                computerMove(x, y)
                lc = false
                return
            }
        }
    } else if (moveCount == 3) {
        if (board[1][1]) {
            let lc4 = true
            while (lc4) { //TODO rewrite this
                let sides = [[0, 1], [1, 0], [1, 2], [2, 1]]
                let randSideUnchecked = Math.floor(Math.random() * sides.length)
                if (board[sides[randSideUnchecked][0]][sides[randSideUnchecked][1]] == 0) {
                    computerMove(sides[randSideUnchecked][0], sides[randSideUnchecked][1])
                    lc4 = false
                    return
                }
            }
        } else {
            computerMove(1, 1)
        }
    } else if (moveCount == 4 && board[1][1] == 0) {
        computerMove(1, 1)
    } else {
        //make a random valid move
        for (i = 0; i < 3; i++) {
            for (j = 0; j < 3; j++) {
                if (board[i][j] == 0) {
                    computerMove(i, j)
                    return
                }
            }
        }
    }
}

function corners() {
    if (Math.random() < 0.5) {
        return 0
    } else {
        return 2
    }
}

function randIndex() {
    return Math.floor(Math.random() * 3)
}

