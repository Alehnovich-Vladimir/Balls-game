const screens = document.querySelectorAll('.screen')
const startBtn = document.querySelector('#startBtn')
const timeList = document.querySelector('#time-list')
const timeEl = document.querySelector('#time')
const board = document.querySelector('#board')
const scoreEl = document.querySelector('#score')
const minSizeSlider = document.querySelector('#minSize')
const maxSizeElSlider = document.querySelector('#maxSize')
const minCirclePreview = document.querySelector('#minCircle')
const maxCirclePreview = document.querySelector('#maxCircle')
const sizeSettingsBtn = document.querySelector('#sizeSettingsBtn')
const otherSettingsBtn = document.querySelector('#otherSettingsBtn')
const colorfullTargetsInput = document.querySelector('#colorfullTargetsInput')
const restartBtn = document.querySelector('#restartBtn')
const turboModeInput = document.querySelector('#turboModeInput')

colorfullTargetsInput.checked = false
turboModeInput.checked = false

const LEFT_TO_RIGHT = 'LR'
const RIGHT_TO_LEFT = 'RL'
const DOWN_TO_UP = 'DU'
const UP_TO_DOWN = 'UD'
const directions = [LEFT_TO_RIGHT, RIGHT_TO_LEFT, UP_TO_DOWN, DOWN_TO_UP]

let minCircleSize = 10
let maxCircleSize = 70

let time = 0
let score = 0
let interval = null
let gameLoop = null
let colorFullTargets = false
let turboMode = false

function setCirclePreviewSize(value, target) {
    target.style.width = value + 'px'
    target.style.height = value + 'px'
}

setCirclePreviewSize(minCircleSize, minCirclePreview)
setCirclePreviewSize(maxCircleSize, maxCirclePreview)

minSizeSlider.addEventListener('input', (e) => {
    if (parseInt(e.target.value) > maxCircleSize) {
        minCircleSize = maxCircleSize
        setCirclePreviewSize(minCircleSize, minCirclePreview)
        return
    }
    minCircleSize = parseInt(e.target.value)
    setCirclePreviewSize(minCircleSize, minCirclePreview)
})

maxSizeElSlider.addEventListener('input', (e) => {

    if (parseInt(e.target.value) < minCircleSize) {
        maxCircleSize = minCircleSize
        setCirclePreviewSize(maxCircleSize, maxCirclePreview)
        return
    }
    maxCircleSize = parseInt(e.target.value)
    setCirclePreviewSize(maxCircleSize, maxCirclePreview)
})

restartBtn.addEventListener('click', () => {
    screens[1].classList.remove('up')
    screens[2].classList.remove('up')
    screens[3].classList.remove('up')
})

startBtn.addEventListener('click', (e) => {
    e.preventDefault()
    screens[0].classList.add('up')
})

timeList.addEventListener('click', (e) => { chooseTime(e) })

function chooseTime(e) {
    scoreEl.classList.add('hide')
    restartBtn.classList.add('hideDisplay')
    if (e.target.classList.contains('time-btn')) {
        time = (parseInt(e.target.innerHTML))
        screens[1].classList.add('up')

    }
}

sizeSettingsBtn.addEventListener('click', (e) => { chooseSettings(e) })
otherSettingsBtn.addEventListener('click', () => {
    screens[3].classList.add('up')
    startGame()
})
colorfullTargetsInput.addEventListener('click', (e) => {
    return colorFullTargets = !colorFullTargets
})

turboModeInput.addEventListener('click', () => {
    turboMode = !turboMode
})

function chooseSettings(e) {
    screens[2].classList.add('up')
}

function startGame() {
    score = 0
    board.classList.remove('gameFinished')
    timeEl.parentNode.classList.remove('hide')
    interval = setInterval(decreaseTimer, 1000)
    setTime(time)
    createRandomTarget()
}

function decreaseTimer() {
    --time
    setTime(time)
}

function setTime(current) {
    let minutes = Math.floor(current / 60)
    let seconds = current % 60
    if (current > 59) {
        timeEl.innerHTML = `0${minutes}:${seconds}`
    } else {
        timeEl.innerHTML = `00:${seconds}`
    }
    if (seconds < 10) { timeEl.innerHTML = `0${minutes}:0${seconds}` }
    if (current === 0) {
        clearInterval(interval)
        timeEl.parentNode.classList.add('hide')
        finishGame()
    }
}

function createRandomTarget() {
    const { width, height } = board.getBoundingClientRect()
    const circle = document.createElement('div')
    circle.classList.add('circle')
    const diameter = getRandomNumber(minCircleSize, maxCircleSize)
    circle.style.width = diameter + 'px'
    circle.style.height = diameter + 'px'
    const [left, top] = getRandomPosition(diameter, width, height)
    circle.style.left = left + 'px'
    circle.style.top = top + 'px'
    if (colorFullTargets) {
        circle.style.background = `rgb(${getRandomNumber(0, 255)},${getRandomNumber(0, 255)},${getRandomNumber(0, 255)})`
    }
    moveTarget(circle, diameter, left, top, width, height)
    circle.addEventListener('click', (e) => {
        score++
        e.target.remove()
        createRandomTarget()
    })
    board.append(circle)
}

function moveTarget(target, diameter, left, top, width, height) {
    let transformX = 0
    let transformY = 0
    let currentDirection = directions[getRandomNumber(0, directions.length - 1)]
    gameLoop = setInterval(() => {
        if (currentDirection === LEFT_TO_RIGHT) {
            transformX += getSpeedBasedOnDiameter(diameter)
            if (transformX + left + diameter > width) {
                currentDirection = RIGHT_TO_LEFT
            }
        } else if (currentDirection === RIGHT_TO_LEFT) {
            transformX -= getSpeedBasedOnDiameter(diameter)
            if (transformX + left < 0) {
                currentDirection = LEFT_TO_RIGHT
            }
        } else if (currentDirection === UP_TO_DOWN) {
            transformY += getSpeedBasedOnDiameter(diameter)
            if (transformY + top + diameter > height) {
                currentDirection = DOWN_TO_UP
            }
        } else {
            transformY -= getSpeedBasedOnDiameter(diameter)
            if (transformY + top < 0) {
                currentDirection = UP_TO_DOWN
            }
        }
        target.style.transform = `translate(${transformX}px,${transformY}px)`
    }, 17)
}

function getSpeedBasedOnDiameter(diameter) {
    if (diameter < 20) {
        return turboMode ? 3 : 1
    } else if (diameter < 40) {
        return turboMode ? 5 : 2
    } else {
        return turboMode ? 10 : 4
    }
}

function getRandomNumber(min, max) {
    return Math.floor(min + Math.random() * (max + 1 - min))
}

function finishGame() {
    clearInterval(gameLoop)
    board.childNodes.forEach(el => {
        if (el.classList && el.classList.contains('circle')) {
            el.remove()
        }
    })
    restartBtn.classList.remove('hideDisplay')
    board.classList.add('gameFinished')
    scoreEl.classList.remove('hide')
    scoreEl.innerHTML = `Score: <span>${score}</span>`
    scoreEl.classList.add('scoreShow')
}

function getRandomPosition(diameter, boardWidth, boardHeight) {
    return [getRandomNumber(0, boardWidth - diameter), getRandomNumber(0, boardHeight - diameter)]
}