const canvas = document.getElementsByTagName('canvas')[0];
canvas.style.width = '500px';
canvas.style.height = '500px';
canvas.width = 500;
canvas.height = 500;
const ctx = canvas.getContext('2d');
document.getElementById('rules').value = 'X -> F+[[X]-X]-F[-FX]+X\nF -> FF'
resetCanvas();
draw();

function resetCanvas() {
    ctx.clearRect(0, 0, 500, 500);
    ctx.beginPath();
    ctx.rect(0, 0, 500, 500);
    ctx.stroke();
}

function getValue(id) {
    return document.getElementById(id).value;
}

function getRules() {
    /*
    const r = [
        {
            from: 'X',
            total: 13,
            outcomes: [
                {p: 5, to: 'FF'},
                {p: 5, to: 'FXF'},
                {p: 3, to: 'AFF'}
            ]
        }
    ];
    */
    const ungroupedRules = getValue('rules')
        .split('\n')
        .filter(line => line.length > 0)
        .map(line => {
            const [from, p, to] = line.replace(/\s+/g, '').split(/-(\d+)?>/);
            return {from, to, p: p === undefined ? 1 : +p};
        });

    const groups = {};
    for (let rule of ungroupedRules) {
        const from = rule.from;
        if (!groups[from]) {
            groups[from] = {
                from,
                total: 0,
                outcomes: []
            };
        }

        groups[from].total += rule.p;
        groups[from].outcomes.push(rule);
    }

    return Object.values(groups);
}

function draw() {
    resetCanvas();
    const axiom = getValue('axiom');
    const iterations = +getValue('iterations');
    const rules = getRules();
    console.log(rules)
    const initialAngle = (+getValue('initialAngle')) / 180 * Math.PI;
    const turnAngle = (+getValue('turnAngle')) / 180 * Math.PI;
    const branchLength = getValue('branchLength');
    const x = +getValue('x');
    const y = +getValue('y');
    const randomness = document.getElementById('randomness').checked;
    const program = generateProgram(axiom, rules, iterations, next);

    console.log(program.join(''));
    const state = {pos: {x, y}, angle: initialAngle, stack: []};
    for (const cmd of program) {
        run(cmd, state, turnAngle, branchLength, randomness);
    }
}

function generateProgram(axiom, rules, iterations, alg) {
    let term = axiom;
    for (let i = 0; i < iterations; i++) {
        term = alg(term.split(''), rules);
    }
    return term.split('');
}

function run(cmd, state, turn, lenx, randomness) {
    if (cmd === 'F' || cmd === 'G') {
        let len = (randomness ? Math.max(0.5 * lenx, Math.random() * lenx) : lenx);
        const newPos = {x: state.pos.x + len * Math.cos(state.angle), y: state.pos.y + len * Math.sin(state.angle)};
        ctx.strokeStyle = '#327230';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(state.pos.x, state.pos.y);
        ctx.lineTo(newPos.x, newPos.y);
        ctx.stroke();
        state.pos = newPos;
    } else if (cmd === 'H') {
        let len = (randomness ? Math.max(0.5 * lenx, Math.random() * lenx) : lenx);
        state.pos = {x: state.pos.x + len * Math.cos(state.angle), y: state.pos.y + len * Math.sin(state.angle)};
    } else if (cmd === 'Z') {
        if (!randomness || Math.random() > 0.9) {
            const orange = '#f68e39';
            const red = '#8d0606';
            ctx.fillStyle = Math.random() > 0.5 ? orange : red;
            ctx.beginPath();
            ctx.ellipse(state.pos.x, state.pos.y, 3, 3, 10, 0, 2 * Math.PI);
            ctx.fill();
        }
    } else if (cmd === '+') {
        state.angle -= turn + (randomness ? Math.random() : 0) * 0.3;
    } else if (cmd === '-') {
        state.angle += turn + (randomness ? Math.random() : 0) * 0.3;
    } else if (cmd === '[') {
        state.stack.push({x: state.pos.x, y: state.pos.y, angle: state.angle});
    } else if (cmd === ']') {
        const rem = state.stack.pop();
        state.pos = {x: rem.x, y: rem.y};
        state.angle = rem.angle;
    }
}
