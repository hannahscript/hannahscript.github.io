function jumifyWord(text) {
    return text.split('')
        .filter(c => {
            const charCode = c.charCodeAt(0);
            return charCode >= 97 && charCode <= 122;
        })
        .map(c => c.charCodeAt(0) - 97)
        .map(cc => cc.toString(2).padStart(5, '0'))
        .join('')
        .replace(/0/g, 'cringe ')
        .replace(/1/g, 'based ');
}

function jumify(text) {
    return text
        .split(' ')
        .map(jumifyWord)
        .join(' ');
}

function dejumify(text) {
    return text
        .replace(/cringe\s/g, '0')
        .replace(/based\s/g, '1')
        .split(' ')
        .map(dejumifyWord)
        .join(' ');
}

function dejumifyWord(text) {
    return text.split(/(.{5})/)
        .filter(cc => cc)
        .map(cc => parseInt(+cc, 2))
        .map(cc => String.fromCharCode(cc + 97))
        .join('');
}

document.getElementById('jumifyBtn').addEventListener('click', () => {
    const text = document.getElementById('input').value;
    document.getElementById('output').value = jumify(text);
});

document.getElementById('dejumifyBtn').addEventListener('click', () => {
    const text = document.getElementById('output').value;
    document.getElementById('input').value = dejumify(text);
});
