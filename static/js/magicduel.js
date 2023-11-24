const exampleState = {
    map: [
        {
            age: 0,
            direction: 0,
            type: 2
        }
    ],
    playerPositions: [1, 2]
};

/////////

const TYPE_FIREBALL = '1';
const TYPE_MIRROR_LR = '2';
const TYPE_MIRROR_UD = '3';
const TYPE_CLASH = '100';

const tiledefs = {
    '0': {
        color: '#ddd',
        text: ''
    },
    '1': {
        color: 'red',
        text: 'O'
    },
    '2': {
        color: 'blue',
        text: '|'
    },
    '3': {
        color: 'blue',
        text: '-'
    },
    '100': {
        color: 'purple',
        text: 'clash'
    },
    101: {
        color: 'green',
        text: 'P1'
    },
    102: {
        color: 'green',
        text: 'P2'
    }
}

/////////

function fillGrid() {
    const grid = document.getElementById('grid');
    for (let i = 0; i < 121; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.onclick = () => onClick(i);
        grid.appendChild(cell);
    }
}

function getCell(n) {
    const cells = document.getElementById('grid').getElementsByClassName('cell');
    return cells[n];
}

function setCell(n, color, text) {
    const cell = getCell(n);

    cell.innerHTML = text;
    cell.style.backgroundColor = color;
}

function setImage(n, name, z, rot) {
    const img = document.createElement('img');
    img.src = `/static/img/${name}.png`;
    img.style.zIndex = z;
    img.style.transform = `rotate(${rot}deg)`;

    const cell = getCell(n);
    cell.appendChild(img);
}

function clearCell(n) {
    const cell = getCell(n);
    cell.innerHTML = '';
}

function displayState(state) {
    console.log('Setting state', state);
    
    // Render map
    for (let i = 0; i < state.map.length; i++) {
        clearCell(i);
        
        const tile = state.map[i];

        if (i === state.playerPositions[0]) {
            setImage(i, 'blue_player', 0);
        } else if (i === state.playerPositions[1]) {
            setImage(i, 'red_player', 0);
        }

        for (const entity of tile.entities) {
            if (entity.type === TYPE_FIREBALL) {
                setImage(i, 'fireball', 1, dirToRot(entity.direction));
            } else if (entity.type === TYPE_MIRROR_LR) {
                setImage(i, 'mirror_lr', 0, 0);
            } else if (entity.type === TYPE_MIRROR_UD) {
                setImage(i, 'mirror_lr', 0, 90);
            } else if (entity.type === TYPE_CLASH) {
                setImage(i, 'clash', 0, 0);
            }
        }
    }

    if (state.winner >= 0) {
        let text;
        switch (state.winner) {
            case 2:
                text = "It's a draw"; break;
            case playerId:
                text = "You win!"; break;
            default:
                text = "You lose!";
        }

        document.getElementById('winner').innerHTML = text;
    }
}

function dirToRot(dir) {
    switch (dir) {
        case 0: return 0;
        case 1: return 90;
        case 2: return 180;
        case 3: return 270;
        default: return 0;
    }
}

let ws;
let playerId;
function connectWs() {
    console.log('Starting WS');
    ws = new WebSocket(document.getElementById('host').value);
    ws.onmessage = onMessage;
}

function onMessage(event) {
    console.log(event);
    const data = JSON.parse(event.data);

    if (data === 'UNKNOWN_ERROR') {
        console.log('Got error', data.message);
    } else {
        switch (data.type) {
            case 'gamestate': 
                displayState(data.gameState); break;
            case 'connected':
                playerId = data.playerId;
                storeConnectionId(data.connectionId); break;
            default:
                console.log("Unknown message");
        }
        
    }
}

function storeConnectionId(id) {
    sessionStorage.setItem('connectionId', id);
}

function onClick(pos) {
    console.log('clicked on ', pos);
    const cell = getCell(pos);
    cell.classList.add('rotated');

    const action = document.querySelector('input[name="action"]:checked').value;
    if (action === 'move') {
        move(pos);
    } else {
        const entity = {
            fireball: 1,
            mirror_lr: 2,
            mirror_ud: 3
        }[action];
        place(pos, entity);
    }

    setTimeout(() => {
        cell.classList.remove('rotated');
    }, 300);
}

function reconnect() {
    if (!ws) return;

    console.log('Attempting reconnect');
    ws.send(JSON.stringify({
        type: 'reconnect',
        connectionId: +sessionStorage.getItem('connectionId')
    }))
}

function move(pos) {
    if (!ws) return;

    console.log('Sending mov', pos);
    ws.send(JSON.stringify(makeAction({
        type: "move",
        pos
    })));
}

function place(pos, entity) {
    if (!ws) return;

    console.log('Sending place', pos, entity);
    ws.send(JSON.stringify(makeAction({
        type: 'place',
        entity,
        pos
    })));
}

function makeAction(action) {
    return {
        type: "action",
        action
    }
}

function onConnectButton() {
    
}

// main or whatever

document.addEventListener('keydown', ev => {
    let element;
    switch (ev.key) {
        case 'm': element = 'move'; break;
        case 'f': element = 'fireball'; break;
        case 'u': element = 'mirror_ud'; break;
        case 'l': element = 'mirror_lr'; break;
    }

    if (element) {
        document.getElementById(element).checked = true;
    }
});

fillGrid();
