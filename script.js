let player;
let zombies = [];
let bullets = [];
let powerups = [];
let health = 50;
let wave = 1;
let gameOver = false;
let startScreen = true;
let lastShotTime = 0;
let bulletDamage = 5;
let cooldownTime = 2000;
let pickupMessage = "";
let pickupMessageOpacity = 0;
let pickupMessagePos;
let damagePulse = false;
let pulseOpacity = 0;
let pulseSpeed = 5;
let outputDiv;

const PLAYER_SIZE = 50;
const ZOMBIE_SIZE = 50;
const BULLET_SIZE = 10;
const ZOMBIE_SPAWN_RADIUS = 300;

function setup() {
    createCanvas(windowWidth, windowHeight);
    outputDiv = select('#output');
    logMessage("Game setup started");
    if (!startScreen) {
        player = new Player();
        spawnZombies(wave);
        spawnPowerUps();
    }
    logMessage("Game setup completed");
}

function draw() {
    if (startScreen) {
        showStartScreen();
        return;
    }

    if (gameOver) {
        showGameOverScreen();
        return;
    }

    background(0);
    translate(-player.pos.x + width / 2, -player.pos.y + height / 2);

    fill(50);
    rect(-width * 1.5, -height * 1.5, width * 3, height * 3);

    player.update();
    player.show();

    for (let bullet of bullets) {
        bullet.update();
        bullet.show();
    }

    for (let i = zombies.length - 1; i >= 0; i--) {
        zombies[i].update();
        zombies[i].show();
        if (zombies[i].hits(player)) {
            if (!damagePulse) {
                health -= 10 + (wave - 1) * 4;
                damagePulse = true;
                pulseOpacity = 255;
            }
            if (health <= 0) {
                gameOver = true;
            }
        }

        for (let j = bullets.length - 1; j >= 0; j--) {
            if (zombies[i].hits(bullets[j])) {
                zombies[i].health -= bulletDamage;
                bullets.splice(j, 1);
            }
        }

        if (zombies[i].health <= 0) {
            zombies.splice(i, 1);
        }
    }

    for (let i = powerups.length - 1; i >= 0; i--) {
        powerups[i].show();
        if (powerups[i].hits(player)) {
            powerups[i].applyEffect();
            powerups.splice(i, 1);
        }
    }

    showHUD();
    displayPickupMessage();
    drawMiniMap();

    if (zombies.length === 0) {
        wave++;
        spawnZombies(wave);
        spawnPowerUps();
    }

    if (damagePulse) {
        pulseRed();
    }
}

function showStartScreen() {
    background(0);
    fill(255);
    textSize(50);
    textAlign(CENTER, CENTER);
    text("Welcome to Zombie Game", width / 2, height / 2 - 100);
    textSize(20);
    text("Press 1 to Start", width / 2, height / 2);
    text("Press 2 for GitHub", width / 2, height / 2 + 30);
}

function showGameOverScreen() {
    background(0);
    fill(255);
    textSize(50);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2 - 50);
    textSize(20);
    text("Press 1 to try again", width / 2, height / 2);
    text("Press 2 for GitHub", width / 2, height / 2 + 30);
}

function showHUD() {
    fill(255);
    textSize(20);
    textAlign(CENTER);
    text(`Health: ${health}`, player.pos.x, player.pos.y - height / 2 + 30);
    text(`Wave: ${wave}`, player.pos.x, player.pos.y - height / 2 + 60);
}

function keyPressed() {
    if (startScreen) {
        if (key === '1') {
            startScreen = false;
            setup();
        } else if (key === '2') {
            window.location.href = 'https://github.com/your-repo-link';
        }
    } else if (gameOver) {
        if (key === '1') {
            restartGame();
        } else if (key === '2') {
            window.location.href = 'https://github.com/your-repo-link';
        }
    }
}

function mousePressed() {
    if (mouseButton === LEFT && millis() - lastShotTime >= cooldownTime) {
        shoot();
        lastShotTime = millis();
    }
}

function shoot() {
    let angle = player.dir.heading();
    let bulletDir = p5.Vector.fromAngle(angle);
    bullets.push(new Bullet(player.pos.x, player.pos.y, bulletDir));
}

function spawnZombies(num) {
    for (let i = 0; i < num; i++) {
        let angle = random(TWO_PI);
        let spawnPos = p5.Vector.fromAngle(angle).mult(ZOMBIE_SPAWN_RADIUS).add(player.pos);
        let health = 20 + wave * 5;
        zombies.push(new Zombie(spawnPos.x, spawnPos.y, health));
    }
}

function spawnPowerUps() {
    let powerUpTypes = ["cooldown", "damage", "replenish"];
    let powerUpValues = [0.8, 10, 100];

    for (let i = 0; i < powerUpTypes.length; i++) {
        let type = powerUpTypes[i];
        let value = powerUpValues[i];
        powerups.push(new PowerUp(type, value));
    }
}

function restartGame() {
    health = 100;
    wave = 1;
    gameOver = false;
    damagePulse = false;
    pulseOpacity = 0;
    player = new Player();
    zombies = [];
    bullets = [];
    powerups = [];
    bulletDamage = 5;
    cooldownTime = 2000;
    spawnZombies(wave);
    spawnPowerUps();
}

function displayPickupMessage() {
    fill(255, 255, 255, pickupMessageOpacity);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(pickupMessage, pickupMessagePos.x, pickupMessagePos.y);
    pickupMessageOpacity -= 3;
    if (pickupMessageOpacity < 0) {
        pickupMessageOpacity = 0;
    }
}

function pulseRed() {
    pulseOpacity -= pulseSpeed;
    if (pulseOpacity <= 0) {
        damagePulse = false;
        pulseOpacity = 0;
    }
    push();
    fill(255, 0, 0, pulseOpacity);
    rect(player.pos.x - width / 2, player.pos.y - height / 2, width, height);
    pop();
}

function drawMiniMap() {
    let miniMapScale = 0.1;
    let miniMapSize = 200;
    let miniMapPosX = player.pos.x + width / 2 - miniMapSize - 20;
    let miniMapPosY = player.pos.y - height / 2 + 20;

    push();
    fill(0, 100);
    rect(miniMapPosX, miniMapPosY, miniMapSize, miniMapSize);

    fill(255, 0, 0);
    ellipse(miniMapPosX + (player.pos.x * miniMapScale), miniMapPosY + (player.pos.y * miniMapScale), 5, 5);

    for (let zombie of zombies) {
        fill(0, 255, 0);
        ellipse(miniMapPosX + (zombie.pos.x * miniMapScale), miniMapPosY + (zombie.pos.y * miniMapScale), 5, 5);
    }
    pop();
}

function logMessage(message) {
    outputDiv.html(message);
}

class Player {
    constructor() {
        this.pos = createVector(width / 2, height / 2);
        this.dir = createVector(1, 0);
    }

    update() {
        if (keyIsDown(87)) this.pos.y -= 5; // W key
        if (keyIsDown(83)) this.pos.y += 5; // S key
        if (keyIsDown(65)) this.pos.x -= 5; // A key
        if (keyIsDown(68)) this.pos.x += 5; // D key
        this.dir = createVector(mouseX - width / 2, mouseY - height / 2).normalize();
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.dir.heading());
        fill(0, 0, 255);
        rectMode(CENTER);
        rect(0, 0, PLAYER_SIZE, PLAYER_SIZE);
        pop();
    }
}

class Zombie {
    constructor(x, y, health) {
        this.pos = createVector(x, y);
        this.health = health;
    }

    update() {
        let direction = p5.Vector.sub(player.pos, this.pos).normalize();
        this.pos.add(direction.mult(1 + wave * 0.2));
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(p5.Vector.sub(player.pos, this.pos).heading());
        fill(0, 255, 0);
        rectMode(CENTER);
        rect(0, 0, ZOMBIE_SIZE, ZOMBIE_SIZE);
        pop();
    }

    hits(target) {
        let distance = dist(this.pos.x, this.pos.y, target.pos.x, target.pos.y);
        return distance < ZOMBIE_SIZE / 2 + PLAYER_SIZE / 2;
    }
}

class Bullet {
    constructor(x, y, dir) {
        this.pos = createVector(x, y);
        this.dir = dir.copy().mult(10);
    }

    update() {
        this.pos.add(this.dir);
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.dir.heading());
        fill(255, 255, 0);
        rectMode(CENTER);
        rect(0, 0, BULLET_SIZE, BULLET_SIZE);
        pop();
    }

    hits(target) {
        let distance = dist(this.pos.x, this.pos.y, target.pos.x, target.pos.y);
        return distance < BULLET_SIZE / 2 + ZOMBIE_SIZE / 2;
    }
}

class PowerUp {
    constructor(type, value) {
        this.pos = createVector(random(width), random(height));
        this.type = type;
        this.value = value;
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        fill(255, 165, 0);
        rectMode(CENTER);
        rect(0, 0, 40, 40);
        pop();
    }

    hits(target) {
        let distance = dist(this.pos.x, this.pos.y, target.pos.x, target.pos.y);
        return distance < 20 + PLAYER_SIZE / 2;
    }

    applyEffect() {
        switch (this.type) {
            case "cooldown":
                cooldownTime *= this.value;
                pickupMessage = "Cooldown decreased!";
                break;
            case "damage":
                bulletDamage += this.value;
                pickupMessage = "Damage increased!";
                break;
            case "replenish":
                health = min(health + this.value, 100);
                pickupMessage = "Health replenished!";
                break;
        }
        pickupMessageOpacity = 255;
        pickupMessagePos = player.pos.copy();
    }
}
