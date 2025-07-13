class Card {
    constructor(top, right, bottom, left, owner) {
        this.ranks = {
            top: this.normalizeRank(top),
            right: this.normalizeRank(right),
            bottom: this.normalizeRank(bottom),
            left: this.normalizeRank(left)
        };
        this.owner = owner;
    }

    normalizeRank(rank) {
        if (rank === 'A') return 10;
        return parseInt(rank);
    }

    getRank(side) {
        return this.ranks[side];
    }

    changeOwner(newOwner) {
        this.owner = newOwner;
    }

    toString() {
        const formatRank = (rank) => rank === 10 ? 'A' : rank;
        return `[${formatRank(this.ranks.top)}|${formatRank(this.ranks.right)}|${formatRank(this.ranks.bottom)}|${formatRank(this.ranks.left)}]`;
    }
}

module.exports = Card;