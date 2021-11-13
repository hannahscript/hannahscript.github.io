(function () {
    function next(initialTerm, rules) {
        let terms = [{product: false, term: initialTerm}];

        for (const stochasticRule of rules) {
            // todo remember start i
            for (let i = 0; i < terms.length; i++) {
                if (terms[i].product) continue;

                const currentTerm = terms[i].term;
                const result = matchRule(currentTerm, stochasticRule);

                if (result) {
                    terms.splice(i, 1, ...result);
                }
            }
        }

        return terms.map(({product, term}) => product ? term : term.join('')).join('');
    }

    function pickRule(stochasticRule) {
        // todo improve https://blog.bruce-hill.com/a-faster-weighted-random-choice
        let remaining = Math.random() * stochasticRule.total;
        for (let i = 0; i < stochasticRule.outcomes.length; i++) {
            remaining -= stochasticRule.outcomes[i].p;
            if (remaining < 0) return stochasticRule.outcomes[i];
        }
    }

    function matchRule(term, stochasticRule) {
        const rule = pickRule(stochasticRule);
        const pos = matchSlidingWindow(term, rule);

        if (pos < 0) {
            return [retain(term)];
        }

        const start = term.slice(0, pos);
        const end = term.slice(pos + rule.from.length, term.length);

        const result = [];
        if (start.length > 0) result.push(retain(start));
        result.push(produce(rule));
        if (end.length > 0) result.push(retain(end));

        return result;
    }

    function produce(rule) {
        return {product: true, term: rule.to};
    }

    function retain(term) {
        return {product: false, term};
    }

    function matchSlidingWindow(term, rule) {
        for (let i = 0; i < term.length; i++) {
            if (rule.from.length > term.length - i) return -1; // 0 1 2 3 4 5

            const matches = matchAtPosition(term, rule, i);
            if (matches) return i;
        }

        return -1;
    }

    function matchAtPosition(term, rule, pos) {
        for (let i = 0; i < rule.from.length; i++) {
            if (term[pos + i] !== rule.from[i]) {
                return false;
            }
        }

        return true;
    }

    window.next = next;
})();
