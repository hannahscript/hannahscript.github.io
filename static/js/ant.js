class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = new Array(height).fill().map(_ => new Array(width).fill(0));
    }

    get(x, y) {
        return this.grid[y][x];
    }

    getPoint({x, y}) {
        return this.get(x, y);
    }

    set(x, y, n) {
        this.grid[y][x] = n;
    }

    setPoint({x, y}, n) {
        this.set(x, y, n);
    }

    iterate(fn) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                fn(x, y, this.get(x, y));
            }
        }
    }

    copyFrom(grid) {
        grid.iterate((x, y, n) => this.set(x, y, n))
    }
}

// Globals

const canvas = document.getElementsByTagName('canvas')[0];
canvas.style.width = '500px';
canvas.style.height = '500px';
canvas.width = 500;
canvas.height = 500;

let config = {
    initialSteps: 5000,
    stepsPerFrame: 500,
    ctx: canvas.getContext('2d'),
    rules: parseRule('LR')
};

let state = {};

// Dynamic settings

function getSetting(id) {
    return document.getElementById(id).value;
}

function getRadioSetting(name) {
    return document.querySelector(`input[name=${name}]:checked`).value;
}

function resetState() {
    state = {
        grid: new Grid(500, 500),
        ant: {x: +getSetting('antx'), y: +getSetting('anty'), dx: +getSetting('antdx'), dy: +getSetting('antdy')},
    };
}

function loadSettings() {
    config = {
        ctx: canvas.getContext('2d'),
        initialSteps: +getSetting('skip'),
        stepsPerFrame: +getSetting('stepsperframe'),
        rules: parseRule(getSetting('rule')),
        colorStrategy: getRadioSetting('color') === 'colorpreset' ? getColorStatic : getColorGraydient
    }
}

// Event handlers

function handleRunClicked() {
    resetCanvas();
    resetState();
    loadSettings();

    for (let i = 0; i < config.initialSteps; i++) {
        update();
        draw();
    }

    loop();
}

// Simulation loop

function loop() {
    for (let i = 0; i < config.stepsPerFrame; i++) {
        update();
        draw();
    }

    requestAnimationFrame(loop);
}

function update() {
    const antColor = state.grid.getPoint(state.ant);

    const move = config.rules.moves[antColor];
    state.grid.set(state.ant.x, state.ant.y, (antColor + 1) % config.rules.colorMod);
    if (move === 'L') {
        state.ant = turnLeft(state.ant);
    } else if (move === 'R') {
        state.ant = turnRight(state.ant);
    }
    state.ant = moveAnt(state.ant);
}

// Rendering

function resetCanvas() {
    config.ctx.clearRect(0, 0, 500, 500);
    config.ctx.beginPath();
    config.ctx.rect(0, 0, 500, 500);
    config.ctx.stroke();
}

function getColor(n, max) {
    return config.colorStrategy(n, max);
}

function getColorStatic(n, max) {
    return ['white', 'darkmagenta', 'red', 'orange', 'blue', 'cyan', 'darkcyan', 'green', 'darkgreen', 'darkolivegreen'][n % 10];
}

function getColorGraydient(n, max) {
    const p = n / max * 255 | 0;
    return `rgb(${p},${p},${p})`;
}

function getColorGradient(n, max) {
    // For color picking in IDE
    const c1 = '#d579f5';
    const c2 = '#ffffff';

    const r1 = 213;
    const g1 = 121;
    const b1 = 245;

    const r2 = 255;
    const g2 = 255;
    const b2 = 255;

    return `rgb(${r1 + (r2 - r1) / max * n},${g1 + (g2 - g1) / max * n},${b1 + (b2 - b1) / max * n})`;
}

function drawAnt() {
    config.ctx.fillStyle = 'deeppink';
    config.ctx.fillRect(state.ant.x, 500-state.ant.y, 1, 1);
}

function drawNewestPixel() {
    const x = state.ant.x - state.ant.dx;
    const y = state.ant.y - state.ant.dy;
    config.ctx.fillStyle = getColor(state.grid.get(x, y), config.rules.colorMod - 1);
    config.ctx.fillRect(x, 500-y, 1, 1);
}

function draw() {
    drawAnt();
    drawNewestPixel();
}

// Ant behaviour

function turnLeft(ant) {
    const dx = -state.ant.dy;
    const dy = state.ant.dx;
    return {...ant, dx, dy};
}

function turnRight(ant) {
    const dx = state.ant.dy;
    const dy = -state.ant.dx;
    return {...ant, dx, dy};
}

function moveAnt(ant) {
    return {...ant, x: ant.x + ant.dx, y: ant.y + ant.dy};
}

// Parsing

function parseRule(text) {
    return {colorMod: text.length, moves: text.split('')};
}
