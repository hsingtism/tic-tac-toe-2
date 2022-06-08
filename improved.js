//board format same as 

const lambdaBoardSum = (board) => {
    [board[0][0] + board[0][1] + board[0][2],
    board[1][0] + board[1][1] + board[1][2],
    board[2][0] + board[2][1] + board[2][2],
    board[0][0] + board[1][0] + board[2][0],
    board[0][1] + board[1][1] + board[2][1],
    board[0][2] + board[1][2] + board[2][2],
    board[2][0] + board[1][1] + board[0][2],
    board[0][0] + board[1][1] + board[2][2]]
}

function lambdaLineDetection(boardSum) {
    if (Math.max(...boardSum == 3)) return 1
    if (Math.min(...boardSum == -3)) return -1
    return false
}

function lambdaLineFragCt(boardSum) {
    let c = [0, 0]
    while (boardSum.length) {
        let v = boardSum.pop()
        if (Math.abs(v) == 2) {
            (Math.sign(v) == 1) ? c[0]++ : c[1]++
        }
    }
    return c
}

function evaluate(board) {
    if (lambdaLineDetection(lambdaBoardSum())) return 64 * lambdaLineDetection(lambdaBoardSum())
    let val = 0
    val += 16 * lambdaLineFragCt()[0]
    val -= 16 * lambdaLineFragCt()[1]
    return val
}

const mean = (a) => a.reduce((a, b) => a + b) / a.length;

function moveGeneration(board, moveCount, player) {
    let depth = 9 - moveCount
    let mcA = []
    let bmv = []
    while (depth) {
        for (let i = 0; i < 9; i++) {
            if (board[Math.floor(i / 3)][i % 3]) continue
            let fork = board
            fork[Math.floor(i / 3)][i % 3] = player
            mcA.push(moveGeneration(fork, moveCount + 1, player)[0] || -Infinity)
            bmv.push(moveGeneration(fork, moveCount + 1, player)[1])
        }
        depth--
        return [Math.max(mcA),bmv[Math.max(mcA)]]
    }
}