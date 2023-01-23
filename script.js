const canvas = document.getElementById('canvas1')
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

// GLOBAL VARIABLES
const cellSize = 100;
const cellGap = 3;
const gameGrid = [];
const defenders = [];
let numberOfResources = 300;
const enemies = [];
const enemyPositions = [];
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;
const projectiles = [];
let score = 0;
const resources = [];
const winningScore = 200;
let startingFrame = true;
let chosenDefender = 1;

// MOUSE
const mouse = {
    x: 0,
    y: 0,
    width: 0.1,
    height: 0.1,
    clicked: false
}
canvas.addEventListener('mousedown', function () {
    mouse.clicked = true;
})
canvas.addEventListener('mouseup', function () {
    mouse.clicked = false;
})

let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', function (e) {
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
})
canvas.addEventListener('mouseleave', function () {
    mouse.x = null;
    mouse.y = null;
})

//GAME BOARD
const controlsBar = {
    width: canvas.width,
    height: cellSize
}

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw() {
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        if (mouse.x && mouse.y && collision(this, mouse)) {
            // console.log(this)
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
        for (let y = cellSize; y < canvas.height; y += cellSize) {
            for (let x = 0; x < canvas.width; x += cellSize) {
                ctx.beginPath();
                ctx.moveTo(x,y + cellSize);
                ctx.lineTo(x + cellSize,y + cellSize);
                ctx.stroke();
            }
        }
    }
}


function createGrid() {
    for (let y = cellSize; y < canvas.height; y += cellSize) {
        for (let x = 0; x < canvas.width; x += cellSize) {
            gameGrid.push(new Cell(x, y));
            // ctx.strokeStyle = 'black';
            // ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x,y + cellSize);
            ctx.lineTo(x + cellSize,y + cellSize);
            ctx.stroke();
        }
    }
}
createGrid()
function handleGameGrid() {
    for (let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].draw();
    }
}

const projectileType1 = new Image();
projectileType1.src = 'mage-bolt.png';
//PROJECTILES
class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 128;
        this.height = 128;
        this.power = 10;
        this.speed = 5;
        this.projectileType = projectileType1;
        this.beginingFrame = 0;
        this.frameX1 = 0;
        this.frameX2 = 0;
        // this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame1 = 13;
        this.maxFrame2 = 8;
        this.spriteWidth1 = 128;
        this.spriteHeight1 = 128;
        this.spriteWidth2 = 64;
        this.spriteHeight2 = 28;
    }
    update() {
        this.x += this.speed;
        if(this.beginingFrame < 3) {
            this.beginingFrame++;
            this.frameX1++;
        } else {
            this.minFrame = this.beginingFrame;
            if(this.frameX1 < this.maxFrame1) this.frameX1++;
            else this.frameX1 = this.minFrame;
        }

    }
    draw() {
        ctx.drawImage(this.projectileType, this.frameX1 * this.spriteWidth1, 0, this.spriteWidth1, this.spriteHeight1, this.x, this.y, this.width, this.height);
        // ctx.fillStyle = 'black';
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2)
        // ctx.fill();
    }
}
function handleProjectiles() {
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].update();
        projectiles[i].draw();

        for (let j = 0; j < enemies.length; j++) {
            if (projectiles[i] && collision(projectiles[i], enemies[j])) {
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }
        }

        if (projectiles[i] && projectiles[i].x > canvas.width) {
            projectiles.splice(i, 1);
            i--;
        }
    }
}

// DEFENDERS
const mage = {
    image: {
        obj: new Image(),
        src1: 'mage-idle.png',
        src2: 'mage-attack.png'
    },
}

const defenderTypes = [];
const defender1 = new Image();
defender1.src = 'mage-idle.png';
defenderTypes.push(defender1);


class Defender {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.shooting = false;
        this.shootNow = false;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
        this.defenderType = mage.image.obj;
        this.frameX1 = 0;
        this.frameX2 = 0;
        // this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame1 = 9;
        this.maxFrame11 = 5;
        this.maxFrame2 = 8;
        this.spriteWidth1 = 128;
        this.spriteHeight1 = 128;
        this.spriteWidth2 = 64;
        this.spriteHeight2 = 28;
        this.chosenDefender = chosenDefender;
    }
    draw() {
        ctx.fillStyle = 'gold';
        ctx.font = '20px Orbitron';
        if(this.chosenDefender === 1) {
            if(this.shooting) {
                this.defenderType.src = mage.image.src2;
                ctx.drawImage(this.defenderType, this.frameX1 * this.spriteWidth1, 0, this.spriteWidth1, this.spriteHeight1, this.x, this.y, this.width, this.height);
            }
            else {
                this.defenderType.src = mage.image.src1;
                ctx.drawImage(this.defenderType, this.frameX1 * this.spriteWidth1, 0, this.spriteWidth1, this.spriteHeight1, this.x, this.y, this.width, this.height);
            }
            ctx.fillText(Math.floor(this.health), this.x + 27, this.y + 40);
        }
        // else if (this.defenderType === defenderTypes[1]) {
        //     ctx.drawImage(this.enemyType, this.frameX2 * this.spriteWidth2, 64, this.spriteWidth2, this.spriteHeight2 + 64, this.x, this.y, this.width, this.height);
        //     ctx.fillText(Math.floor(this.health), this.x + 30, this.y + 20);
        // }
    }
    update() {
            // this.timer++;
            // if (this.timer % 100 === 0) {
            //     projectiles.push(new Projectile(this.x + cellSize / 2, this.y + cellSize / 2))
            // }
        // } else {
        //     this.timer = 0;
        // }
        if(this.chosenDefender === 1) {
            if(this.shooting) {
                if(frame % 6 === 0) {
                    if(this.frameX1 < this.maxFrame1) this.frameX1++;
                    else this.frameX1 = this.minFrame;
                    if(this.frameX1 === 8) {
                        this.shootNow = true;
                    }
                }
            }
            else {
                if(frame % 6 === 0) {
                    if(this.frameX1 < this.maxFrame11) this.frameX1++;
                    else this.frameX1 = this.minFrame;
            }
            }
        }
        else if (this.chosenDefender === 2) {
            if(frame % 12 === 0) {
                if(this.frameX2 < this.maxFrame2) this.frameX2++;
                else this.frameX2 = this.minFrame;
            }
        }
        if (this.shooting && this.shootNow) {
            projectiles.push(new Projectile(this.x - 15, this.y - 15))
            this.shootNow = false;
        }
    }
}

function handleDefenders() {
    for (let i = 0; i < defenders.length; i++) {
        defenders[i].draw();
        defenders[i].update();
        if (enemyPositions.indexOf(defenders[i].y) !== -1) {
            defenders[i].shooting = true;
        }
        else {
            defenders[i].shooting = false;
        }
        for (let j = 0; j < enemies.length; j++) {
            // if (defenders[i] && collision(defenders[i], enemies[j])) {
            if (defenders[i] && collisionTowerEnemy(defenders[i], enemies[j])) {
                enemies[j].movement = 0;
                defenders[i].health -= 0.2;
            }
            if (defenders[i] && defenders[i].health <= 0) {
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}

const card1 = {
    x: 10,
    y: 10,
    width: 70,
    height: 85
}
const card2 = {
    x: 90,
    y: 10,
    width: 70,
    height: 85
}

function chooseDefender() {
    if(collision(mouse,card1) && mouse.clicked) {
        chosenDefender = 1;
    } else if(collision(mouse,card2) && mouse.clicked) {
        chosenDefender = 2;
    }
    if(chosenDefender === 1) {
        card1stroke = 'gold';
        card2stroke = 'black';
    } else if(chosenDefender === 2) {
        card1stroke = 'black';
        card2stroke = 'gold';
    } else {
        card1stroke = 'black';
        card2stroke = 'black';
    }

    ctx.linewidth = 1;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(card1.x, card1.y, card1.width, card1.height);
    ctx.strokeStyle = card1stroke;
    ctx.strokeRect(card1.x, card1.y, card1.width, card1.height);
    ctx.drawImage(defender1,0 ,0, 128, 128, -3, -25, 100, 100);
    ctx.fillRect(card2.x, card2.y, card2.width, card2.height);
    ctx.strokeStyle = card2stroke;
    ctx.strokeRect(card2.x, card2.y, card2.width, card2.height);
    ctx.restore();
}

//FLOATING MESSAGES
const floatingMessages = [];
class FloatingMessage {
    constructor(value, x, y, size, color) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.lifeSpan = 0;
        this.color = color;
        this.opacity = 1;
    }
    update() {
        this.y -= 0.3;
        this.lifeSpan += 1;
        if (this.opacity > 0.01) this.opacity -= 0.022;
    }
    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size + 'px Orbitron';
        ctx.fillText(this.value, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}
function handleFloatingMessages() {
    for (let i = 0; i < floatingMessages.length; i++) {
        floatingMessages[i].update();
        floatingMessages[i].draw();
        if (floatingMessages[i].lifeSpan >= 40) {
            floatingMessages.splice(i, 1);
            i--;
        }
    }
}

// ENEMIES
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = 'zombie.png';
enemyTypes.push(enemy1);
const enemy2 = new Image();
enemy2.src = 'snailz.png';
enemyTypes.push(enemy2);


class Enemy {
    constructor(verticalPosition) {
        this.x = canvas.width;
        this.y = verticalPosition
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 0.2 + 0.4;
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health
        this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        this.frameX1 = 0;
        this.frameX2 = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame1 = 7;
        this.maxFrame2 = 8;
        this.spriteWidth1 = 292;
        this.spriteHeight1 = 410;
        this.spriteWidth2 = 64;
        this.spriteHeight2 = 64;
    }
    update() {
        this.x -= this.movement;
        if(this.enemyType === enemyTypes[0]) {
            if(frame % 8 === 0) {
                if(this.frameX1 < this.maxFrame1) this.frameX1++;
                else this.frameX1 = this.minFrame;
            }
        }
        else if (this.enemyType === enemyTypes[1]) {
            if(frame % 12 === 0) {
                if(this.frameX2 < this.maxFrame2) this.frameX2++;
                else this.frameX2 = this.minFrame;
            }
        }
    }
    draw() {
        // ctx.fillStyle = 'red';
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Orbitron';
        if(this.enemyType === enemyTypes[0]) {
            ctx.drawImage(this.enemyType, this.frameX1 * this.spriteWidth1, 0, this.spriteWidth1, this.spriteHeight1, this.x, this.y, this.width, this.height);
            ctx.fillText(Math.floor(this.health), this.x + 35, this.y - 10);
        }
        else if (this.enemyType === enemyTypes[1]) {
            ctx.drawImage(this.enemyType, this.frameX2 * this.spriteWidth2, 64, this.spriteWidth2, this.spriteHeight2, this.x, this.y, this.width, this.height);
            ctx.fillText(Math.floor(this.health), this.x + 30, this.y + 20);
        }

    }
}
function handleEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
        enemies[i].draw();
        if (enemies[i].x < 0) {
            gameOver = true;
        }
        if (enemies[i].health <= 0) {
            let gainedResources = enemies[i].maxHealth / 10;
            numberOfResources += gainedResources;
            floatingMessages.push(new FloatingMessage('+ ' + gainedResources, enemies[i].x + 15, enemies[i].y, 25,'black'))
            score += 10;
            let findThisIndex = enemyPositions.indexOf(enemies[i].y);
            enemyPositions.splice(findThisIndex, 1);
            enemies.splice(i, 1);
            i--;
        }
    }
    if (frame % enemiesInterval === 0 && score < winningScore) {
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
        enemies.push(new Enemy(verticalPosition));
        enemyPositions.push(verticalPosition)
        if (enemiesInterval > 120) enemiesInterval -= 20;
    }
}

const amounts = [20, 30, 40];
const resourceTypes = [];
const resource1 = new Image();
resource1.src = 'resource.png';
resourceTypes.push(resource1);
const resource2 = new Image();
resource2.src = 'resource2.png';
resourceTypes.push(resource2);
const resource3 = new Image();
resource3.src = 'resource3.png';
resourceTypes.push(resource3);

class Resource {
    constructor() {
        this.x = Math.random() * canvas.width - cellSize;
        this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
        this.width = cellSize * 0.6;
        this.height = cellSize * 0.6;
        this.amount = amounts[Math.floor(Math.random() * amounts.length)];
        this.resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 100;
        this.spriteHeight = 100;
        this.minFrame = 0;
        this.maxFrame = 7;
    }
    draw() {
        // ctx.fillStyle = 'yellow';
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.resourceType, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Orbitron';
        ctx.fillText(this.amount, this.x + 14, this.y + 10);
    }
    update() {
        if(this.frameX < this.maxFrame) {
            if(this.frameY == this.maxFrame && this.frameX == 4) {
                this.frameX = this.minFrame;
                this.frameY = this.minFrame;
            }
            else {
                this.frameX++;
            }
        }
        else if(this.frameY < this.maxFrame) {
            this.frameY++;
            this.frameX = this.minFrame;
        }
        else {
            this.frameX = this.minFrame;
            this.frameY = this.minFrame;
        }
    }
}
function handleResources() {
    if (frame % 500 === 0 && score < winningScore) {
        resources.push(new Resource);
    }
    for (let i = 0; i < resources.length; i++) {
        resources[i].draw();
        resources[i].update();
        if (resources[i] && collision(mouse, resources[i])) {
            numberOfResources += resources[i].amount;
            floatingMessages.push(new FloatingMessage('+ ' + resources[i].amount, resources[i].x, resources[i].y, 20,'black'))
            resources.splice(i, 1);
            i--;
        }
    }
}

function handleGameStatus() {
    ctx.fillStyle = 'gold';
    ctx.font = '25px Orbitron';
    ctx.fillText('Recources: ' + numberOfResources, 180, 40);
    ctx.fillText('Score: ' + score, 180, 80);
    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '60px Orbitron';
        ctx.fillText('GAME OVER', 250, 340);
    }
    if (score >= winningScore && enemies.length === 0) {
        ctx.fillStyle = 'black';
        ctx.font = '60px Orbitron';
        ctx.fillText('YOU WON', 270, 340);
    }
}

canvas.addEventListener('click', function () {
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if (gridPositionY < cellSize) return;
    for (let i = 0; i < defenders.length; i++) {
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) return;
    }
    let defenderCost = 100;
    if (numberOfResources >= defenderCost) {
        defenders.push(new Defender(gridPositionX, gridPositionY));
        numberOfResources -= defenderCost;
    } else {
        floatingMessages.push(new FloatingMessage('Need more resources', mouse.x - 85, mouse.y, 15, 'blue'));
    }
})

let background = new Image();
background.src = 'Background.png';
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, 928, 793, 0 , 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
    handleGameGrid();
    handleDefenders();
    // if(startingFrame) {
    //     chooseDefender();
    //     startingFrame = false;
    // }
    handleResources();
    handleProjectiles();
    handleEnemies();
    chooseDefender();
    handleFloatingMessages();
    frame++;
    if (!gameOver) requestAnimationFrame(animate);
    handleGameStatus();
}
animate();

function collision(first, second) {
    if (!(first.x > second.x + second.width ||
        first.x + first.width < second.x ||
        first.y > second.y + second.height ||
        first.y + first.height < second.y)
    ) {
        return true;
    };
};
function collisionTowerEnemy(tower, enemy) {
    if ((enemy.x - (tower.x + cellSize / 2 - cellGap) <= 5) && (enemy.x - (tower.x + cellSize / 2 - cellGap) >= -50) && enemy.y == tower.y) {
        return true;
    };
}

window.addEventListener('resize', function () {
    canvasPosition = canvas.getBoundingClientRect();
})