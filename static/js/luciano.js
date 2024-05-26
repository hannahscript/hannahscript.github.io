let state = {
    width: 3,
    height: 0,
    elements: []
}

const table = document.getElementById('puzzle');
const description = document.getElementById('description');
table.style.width = `${state.width * 20}px`;

function loadPuzzle() {
    let params = new URLSearchParams(window.location.search);
    let p = params.get('p');
    let width = +params.get('w');
    let height = +params.get('h');
    let d = params.get('d');
    console.log(p);

    if (!p) return;
    
    description.value = decodeURIComponent(d);
    
    let editorElements = document.getElementsByClassName('editor');
    console.log(editorElements.length)
    for (let el of editorElements) {
        console.log(el)
        el.disabled = true;
    }
    
    state.width = width;
    for (let y = 0; y < height; y++) {
        addRow();
    }

    let x = 0;
    let y = 0;
    for (let c of [...p]) {
        let cell = state.elements[y].cells[x];
        if (c === 'x') {
            cell.children[0].disabled = true;
            cell.children[0].style.backgroundColor = 'black';
        } else if (+c > 0) {
            cell.children[0].placeholder = c;
        }
        
        x++;
        if (x === state.width) {
            x = 0;
            y++;
        }
    }
}

function savePuzzle() {
    const linkBox = document.getElementById('link');
    let link = window.location.href + `?w=${state.width}&h=${state.elements.length}&d=${encodeURIComponent(description.value)}&p=`;

    for (let row of state.elements) {
        for (let cell of row.cells) {
            link += cell.children[0].value || '0';
        }
    }
    
    linkBox.value = link;
}

loadPuzzle();

// UI Handlers
function addRow() {
    let tr = document.createElement('tr');
    let cells = [];
    for (let x = 0; x < state.width; x++) {
        let textbox = document.createElement('input');
        let td = document.createElement('td');
        td.appendChild(textbox);
        cells.push(td);
        tr.appendChild(td);
    }

    table.appendChild(tr);
    state.elements.push({tr, cells});    
}

function removeRow() {
    let lastRow = state.elements.pop();
    table.removeChild(lastRow.tr);
}

function addColumn() {
    for (let row of state.elements) {
        let textbox = document.createElement('input');
        let td = document.createElement('td');
        td.appendChild(textbox);
        
        row.cells.push(td);
        row.tr.appendChild(td);
    }
    
    state.width += 1;
    table.style.width = `${state.width * 20}px`;
}

function removeColumn() {
    for (let row of state.elements) {
        let lastCell = row.cells.pop();
        row.tr.removeChild(lastCell);
    }
    
    state.width -= 1;
    table.style.width = `${state.width * 20}px`;
}
