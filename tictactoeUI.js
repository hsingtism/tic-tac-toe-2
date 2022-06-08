//requires jQuery
//computer is -1, player is 1; player 1 is -1, player 2 is 1
//Scoreboard
let draws = 0
let compWins = 0
let userWins = 0//in case
//two player mode
let player1Wins = 0
let player2Wins = 0

//takes -1, 0, or 1, and also null
// TODO rewrite this function
function scoreboardUpdate(winner){
    if (winner === 0) {
        draws++ 
        if (draws == 2){ //update when going to 2, back to singular in count update
            $('#drawLabel').text('Draws')
        }
    } 
    else if (playerCount == 1) {
        if(winner === -1) {
            compWins++ 
        } else if (winner == 1) {userWins++}
    } else {
        if (winner === -1) {player1Wins++} 
        else if (winner == 1) player2Wins++
    }
    $('#posScore').text(`${player1Wins + userWins}`)
    $('#draw').text(`${draws}`)
    $('#negScore').text(`${player2Wins + compWins}`)
}

//functions called by html
let playerCount = 1
let inputtingUser = 1 //-1 for computer, 1 and -1

function userClick(x,y){
    if (board[x][y]) return //return of spot is not empty
    board[x][y] = inputtingUser
    inputtingUser *= -1
    moveCount++
    boardUpdate()
    console.time('move')
    boardSumSum()
    if(playerCount == 1){
        moveGenerationManager()
    }
    console.timeEnd('move')
}

function playerCountChange(count){
    if(count == playerCount) {return}
    playerCount = count
    initGame()
    if(playerCount == 1){
        $('#1player').addClass('firstMoveSelected')
        $('#2player').removeClass('firstMoveSelected')
        $('#scoreLabel0').text('You')
        $('#scoreLabel1').text('Computer')
    } else {
        $('#scoreLabel0').text('Player X')
        $('#scoreLabel1').text('Player O')
        $('#1player').removeClass('firstMoveSelected')
        $('#2player').addClass('firstMoveSelected')
    }
    draws = compWins = userWins = player1Wins = player2Wins = 0
    $('#drawLabel').text('Draw')
    scoreboardUpdate(null)
}

//Game management
let firstMove = 0 //0 for swap
let allowUserMove = false

const init = () => initGame()

function boardUpdate() {
    let inputtingUserGhostPiece = ['gamePieceO', '', 'gamePieceX']
    for(i=0; i<3; i++){
        for(j=0; j<3; j++){
            if(board[i][j] === 0) {
                $(`#board${i}${j}`).attr('class',`${inputtingUserGhostPiece[inputtingUser+1]} gamePieceImaginary gamePieceCenter`)
            } else if (board[i][j] == -1) {
                $(`#board${i}${j}`).attr('class','gamePieceO gamePieceDisplay gamePieceCenter')
            } else {
                $(`#board${i}${j}`).attr('class','gamePieceX gamePieceDisplay gamePieceCenter')
            }
        }
    }
}
