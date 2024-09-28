const gameboardsContainer = document.querySelector('#gameboards-container')
const optionContainer = document.querySelector('.option-container') // . for class
const flipButton = document.querySelector('#flip-button')   // # for id
const startButton = document.querySelector('#start-button')
const infoDisplay = document.querySelector('#info')
const turnDisplay = document.querySelector('#turn-display')
const difficultyButtons = document.querySelectorAll('.difficulty-button');
const hit = document.getElementById('hit-sound')
const sunk = document.getElementById('sunk-sound')
const miss = document.getElementById('miss-sound')
const win = document.getElementById('win-sound')

var myAudio = document.getElementById("bg-music");
var isPlaying = false;

function togglePlay() {
  isPlaying ? myAudio.pause() : myAudio.play();
};

myAudio.onplaying = function() {
  isPlaying = true;
};
myAudio.onpause = function() {
  isPlaying = false;
};


// can use console.log() to see whats happening in the console

/*------------------------------------------- GAME SETUP ------------------------------------------- */
// choosing difficulty, can only choose one mode
let difficulty = ""
difficultyButtons.forEach(button => {
    button.addEventListener('click', function() {
        // eemove class 'selected' from all buttons
        difficultyButtons.forEach(btn => btn.classList.remove('selected'));
        
        // add class 'selected' to the clicked button
        this.classList.add('selected');

        
        const selectedDifficulty = this.textContent;  
        console.log("Selected difficulty:", selectedDifficulty);

        if (selectedDifficulty === "Easy") {
            console.log("Easy mode selected")
            infoDisplay.textContent = "Currently in Easy Mode"
        } else if (selectedDifficulty === "Medium") {
            console.log("Medium mode selected")
            infoDisplay.textContent = "Currently in Medium Mode"
        } else if (selectedDifficulty === "Hard") {
            console.log("Hard mode selected")
            infoDisplay.textContent = "Currently in Hard Mode"
        }
        difficulty = selectedDifficulty
    })
})

// Choosing orientation of ships
let angle = 0
function flip () {
    const optionShips = Array.from(optionContainer.children)   // can get all the children of element
   angle = angle === 0 ? 90 : 0     // if angle is 0, than flip 90 deg, otherwise flip to 0 deg
   flipButton.textContent = angle === 0 ? "Switch to Vertical Placement" : "Switch to Horizontal Placement"     // if-else
    optionShips.forEach(optionShip => optionShip.style.transform = `rotate(${angle}deg)`)
}
flipButton.addEventListener('click', flip)

// Creating Boards
const width = 10

// TODO: need to add the alphabet and number labels
function createBoard(color, user) {
    const gameboardContainer = document.createElement('div')    // make a div for a game
    gameboardContainer.classList.add('gameboard')   // made a class, 'gameboard'
    gameboardContainer.style.backgroundColor = color
    gameboardContainer.id = user

    // create blocks
    for (let i = 0; i < width * width; i++) {
        const block = document.createElement('div')
        block.classList.add('block')
        block.id = i
        gameboardContainer.append(block)
    }

    gameboardsContainer.append(gameboardContainer)  // add the gameboardContainer div to the gameboardsContainer div
}
createBoard('black', 'player')   // call createBoard function
createBoard('black', 'computer')

// Creating Ships
class Ship {
    constructor(name, length) {
        this.name = name
        this.length = length
    }
}

const ship1 = new Ship('ship1', 1)
//console.log(ship1)
const ship2 = new Ship('ship2', 2)
const ship3 = new Ship('ship3', 3)
const ship4 = new Ship('ship4', 4)
const ship5 = new Ship('ship5', 5)

const ships = [ship1, ship2, ship3, ship4, ship5]
let notDropped

function getValidity(allBoardBlocks, isHorizontal, startIndex, ship) {
    let validStart = isHorizontal ? startIndex <= width * width - ship.length ? startIndex : width * width - ship.length :
    // handle vertical
    startIndex <= width * width - width * ship.length ? startIndex :
    startIndex - ship.length * width + width

    let shipBlocks = []

    for (let i = 0; i < ship.length; i++) {
        // if isHorizontal is true
        if (isHorizontal) {
            //console.log(allBoardBlocks[Number(randomStartIndex) + i])
            shipBlocks.push(allBoardBlocks[Number(validStart) + i])   // get block on the right
        } else {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i * width])   // get block below
        }
    }
    //console.log(shipBlocks)

    // check if block is valid for ship to be placed
    let valid
    if (isHorizontal) {
        shipBlocks.every((_shipBlock, index) => 
            valid = shipBlocks[0].id % width !== width - (shipBlocks.length - (index + 1)))
    } else {
        shipBlocks.every((_shipBlock, index) =>
            valid = shipBlocks[0].id < 90 + (width * index + 1))
    }

    // check is block is 'taken' or not
    const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'))

    return {shipBlocks, valid, notTaken}
}

function addShipPiece(user, ship, startId) {
    const allBoardBlocks = document.querySelectorAll(`#${user} div`)
    //console.log(allBoardBlocks)
    let randomBoolean = Math.random() < 0.5
    let isHorizontal = user === 'player' ? angle === 0 : randomBoolean
    let randomStartIndex = Math.floor(Math.random() * width * width)
    console.log(randomStartIndex)

    let startIndex = startId ? startId : randomStartIndex

    const {shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

    // if everything checks out, place ship
    if (valid && notTaken) {
        // add assigned color for the ships, and add class 'taken'
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add(ship.name)
            shipBlock.classList.add('taken')
        })
    } else {
        if (user === 'computer') addShipPiece('computer', ship, startId)   
        if (user === 'player') notDropped = true
    }
}
ships.forEach(ship => addShipPiece('computer', ship))

// Dragging player ships
let draggedShip
const optionShips = Array.from(optionContainer.children)
optionShips.forEach(optionShip => optionShip.addEventListener('dragstart', dragStart))

const allPlayerBlocks = document.querySelectorAll('#player div')
allPlayerBlocks.forEach(playerBlock => {
    playerBlock.addEventListener('dragover', dragOver)
    playerBlock.addEventListener('drop', dropShip)
})

function dragStart(e) {
    //console.log(e.target)
    notDropped = false
    draggedShip = e.target
}

function dragOver(e) {
    e.preventDefault()
    const ship = ships[draggedShip.id]
    highlightArea(e.target.id, ship)    // can see which blocks to place ships
}

function dropShip(e) {
    const startId = e.target.id
    const ship = ships[draggedShip.id]
    addShipPiece('player', ship, startId)
    if(!notDropped) {
        draggedShip.remove()
    }
}

// Add highlight
function highlightArea(startIndex, ship) {
    const allBoardBlocks = document.querySelectorAll('#player div')
    let isHorizontal = angle === 0

    const {shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

    if (valid && notTaken) {
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add('hover')
            setTimeout(() => shipBlock.classList.remove('hover'), 500)
        })
    }
}


/*------------------------------------------- GAME LOGIC ------------------------------------------- */
let gameOver = false
let playerTurn

// Start Game
function startGame() {
    if (playerTurn === undefined) {
        if (optionContainer.children.length != 0) {
            infoDisplay.textContent = "Place all your ships"
        } else {
            // TODO: may need to get user's name in the beginning
            turnDisplay.textContent = "Your turn!"
            infoDisplay.textContent = "You may start the game!"
            const allBoardBlocks = document.querySelectorAll('#computer div')
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
            playerTurn = true
            turnDisplay.textContent = "Your turn!"
            infoDisplay.textContent = "The game has started!"
        } 
    }
}
startButton.addEventListener('click', startGame)

// keep track of player's and computer's hits
let playerHits = []
let computerHits = []
const playerSunkShips = []
const computerSunkShips = []

function handleClick(e) {
    if (!gameOver) {
        // player's turn to shoot missile

        // if player hits computer's ship, add class 'hit', and let player know
        if (e.target.classList.contains('taken')) {
            e.target.classList.add('hit')
            infoDisplay.textContent = "You hit a ship!"
            let classes = Array.from(e.target.classList)
            // look at which ship was hit
            classes = classes.filter(className => className !== 'block')
            classes = classes.filter(className => className !== 'hit')
            classes = classes.filter(className => className !== 'taken')
            playerHits.push(...classes)
            console.log(playerHits)
            checkScore('player', playerHits, playerSunkShips)
            hit.play()
        }

        // if player misses, add class 'miss', and let player know
        if (!e.target.classList.contains('taken')) {
            e.target.classList.add('miss')
            infoDisplay.textContent = "You missed!"
            miss.play()
        }

        // TODO: if player hits same spot again

        playerTurn = false
        const allBoardBlocks = document.querySelectorAll('#computer div')
        allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)))
        setTimeout(computerGo, 3000)
    }
}

// computer's turn
function computerGo() {
    if (!gameOver) {
        turnDisplay.textContent = "Computer"
        infoDisplay.textContent = "Computer is playing..."

        // computer's turn to shoot missile
        // difficulty level is known
        if (difficulty === "Easy") {
            easyMode()
        } else if (difficulty === "Medium") {
            mediumMode()
        } else if (difficulty === "Hard") {
            hardMode()
        }

        // computer's turn to shoot missile

        setTimeout(() => {
            playerTurn = true
            turnDisplay.textContent = "Your turn!"
            infoDisplay.textContent = "Shoot your shot."
            const allBoardBlocks = document.querySelectorAll('#computer div')
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
        }, 6000)
    }
}

// EASY MODE function
function easyMode() {
    setTimeout(() => {
        let randomGo = Math.floor(Math.random() * width * width)
        const allBoardBlocks = document.querySelectorAll('#player div')

        // computer hits player's ship that already has a hit, computer goes again
        if (allBoardBlocks[randomGo].classList.contains('taken') &&
            allBoardBlocks[randomGo].classList.contains('hit')) {
                computerGo()
                return
        } 
        // computer hits a player's ship
        else if (
            allBoardBlocks[randomGo].classList.contains('taken') &&
            !allBoardBlocks[randomGo].classList.contains('hit')
        ) {
            allBoardBlocks[randomGo].classList.add('hit')
            infoDisplay.textContent = "Computer hit your ship!"
            // keep track of computer's hits
            let classes = Array.from(allBoardBlocks[randomGo].classList)    
            classes = classes.filter(className => className !== 'block')
            classes = classes.filter(className => className !== 'hit')
            classes = classes.filter(className => className !== 'taken')
            computerHits.push(...classes)
            console.log(computerHits)
            checkScore('computer', computerHits, computerSunkShips)
            hit.play()
        } 
        // computer misses player's ship
        else {
            infoDisplay.textContent = "Computer missed your ship!"
            allBoardBlocks[randomGo].classList.add('miss')
            miss.play()
        }
    }, 3000)
}

// TODO: MEDIUM MODE function
function mediumMode() {
    // if computer hasn't made a hit yet
        //shoot randomly

    // if computer has made a hit
        // continue making hits to the right until out of bound or get a 'miss'
        
        // continue makin hits to the left
        
        // continue making hits above
        
        // continue making hits below

        // if sunk a ship
            // mediumMode()
            // return
}

// HARD MODE function
function hardMode() {
    setTimeout(() => {
        const allTakenBlocks = document.querySelectorAll('#player div.taken')

        // if computer already hit a ship, avoid choosing it again
        let targetBlocks = Array.from(allTakenBlocks).filter(block => !block.classList.contains('hit'))

        // if there are blocks that have class 'taken' and haven't been hit, computer will shoot it
        if (targetBlocks.length > 0) {
            let randomTarget = targetBlocks[Math.floor(Math.random() * targetBlocks.length)]

            randomTarget.classList.add('hit')
            infoDisplay.textContent = "Computer hit your ship!"

            // keep track of computer's hits
            // keep track of computer's hits
            let classes = Array.from(randomTarget.classList)    
            classes = classes.filter(className => className !== 'block')
            classes = classes.filter(className => className !== 'hit')
            classes = classes.filter(className => className !== 'taken')
            computerHits.push(...classes)
            console.log(computerHits)
            checkScore('computer', computerHits, computerSunkShips)
            hit.play()
        }
        return
    }, 3000)
}

function checkScore(user, userHits, userSunkShips) {
    function checkShip(shipName, shipLength) {
        // When user hits all parts of a ship
        if (userHits.filter(storedShipName => storedShipName === shipName).length === shipLength) {
            if (user === 'player') {
                infoDisplay.textContent = `You sunk the computer's ship! `
                playerHits = userHits.filter(storedShipName => storedShipName !== shipName)
                sunk.play()
            }
            if (user === 'computer') {
                infoDisplay.textContent = `Computer sunk your ship! `
                computerHits = userHits.filter(storedShipName => storedShipName !== shipName)
                sunk.play()
            }
            userSunkShips.push(shipName)
        }
    }

    checkShip('ship1', 1)
    checkShip('ship2', 2)
    checkShip('ship3', 3)
    checkShip('ship4', 4)
    checkShip('ship5', 5)

    console.log('playerHits', playerHits)
    console.log('playerSunkShips', playerSunkShips)

    // when a user sinks all the ships
    if (playerSunkShips.length === 5) {
        myAudio.pause()
        infoDisplay.textContent = "You sunk all the computers ships, YOU WIN!"
        gameOver = true
        win.play()
        
    }
    if (computerSunkShips.length === 5) {
        myAudio.pause()
        infoDisplay.textContent = "Computer sunk all your ships, YOU LOSE!"
        gameOver = true
    }
}