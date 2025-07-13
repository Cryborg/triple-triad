class Card {
    constructor(top, right, bottom, left, owner, element = 'None') {
        this.originalRanks = {
            top: this.normalizeRank(top),
            right: this.normalizeRank(right),
            bottom: this.normalizeRank(bottom),
            left: this.normalizeRank(left)
        };
        this.ranks = { ...this.originalRanks };
        this.owner = owner;
        this.element = element;
    }

    normalizeRank(rank) {
        if (rank === 'A') return 10;
        return parseInt(rank);
    }

    getRank(side) {
        return this.ranks[side];
    }

    getOriginalRank(side) {
        return this.originalRanks[side];
    }

    getEffectiveRank(side, boardSquareElement, elementalRuleActive = false) {
        if (!elementalRuleActive || !boardSquareElement || boardSquareElement === 'None') {
            return this.originalRanks[side];
        }

        let rank = this.originalRanks[side];
        
        if (this.element === boardSquareElement) {
            rank += 1;
        } else if (this.element !== 'None') {
            rank -= 1;
        }
        
        return Math.max(0, rank);
    }

    changeOwner(newOwner) {
        this.owner = newOwner;
    }

    toString() {
        const formatRank = (rank) => rank === 10 ? 'A' : rank;
        const baseString = `[${formatRank(this.ranks.top)}|${formatRank(this.ranks.right)}|${formatRank(this.ranks.bottom)}|${formatRank(this.ranks.left)}]`;
        if (this.element !== 'None') {
            return `${baseString}(${this.element[0]})`;
        }
        return baseString;
    }
}

module.exports = Card;