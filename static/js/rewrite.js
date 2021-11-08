(function (){
    function next(term, rules) {
        let state = {ranges: [{start: 0, end: term.length - 1}], matches: []};

        for (const rule of rules) {
            if (state.ranges.length === 0) {
                break;
            }

            let nextState = matchRule(term, rule, state);

            while (nextState != null) {
                state = nextState;
                nextState = matchRule(term, rule, state);
            }
        }

        for (const range of state.ranges) {
            const pseudoMatch = {pos: range.start, value: term.slice(range.start, range.end + 1).join('')};
            state.matches.push(pseudoMatch);
        }

        state.matches.sort((a, b) => a.pos - b.pos);

        return state.matches.map(({value}) => value).join('');
    }

    function matchRule(term, rule, state) {
        for (let i = 0; i < state.ranges.length; i++) {
            const range = state.ranges[i];
            const pos = matchRange(term, rule, range);

            if (pos > -1) {
                state.matches.push({pos, value: rule.to});
                state.ranges.splice(i, 1, ...substractFromRange(range, pos, rule.from.length));
                return state;
            }
        }

        return null;
    }

    function matchRange(term, rule, range) {
        for (let i = range.start; i <= range.end; i++) {
            if (rule.from.length > (range.end - i + 1)) return -1;

            const matches = matchAtPosition(term, rule, i);
            if (matches) {
                return i;
            }
        }
    }

    function matchAtPosition(term, rule, pos) {
        for (let i = 0; i < rule.from.length; i++) {
            if (term[pos + i] !== rule.from[i]) {
                return false;
            }
        }

        return true;
    }

    function substractFromRange(range, pos, length) {
        if (pos === range.start) {
            const start = range.start + length;
            return start > range.end ? [] : [{start, end: range.end}];
        } else if (pos + length - 1 === range.end) {
            return [{start: range.start, end: range.end - length}];
        } else {
            return [
                {start: range.start, end: pos - 1},
                {start: pos + length, end: range.end}
            ];
        }
    }

    window.next = next;
})();
