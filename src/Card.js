class Card {
    constructor(top, right, bottom, left, owner, element = 'None') {
        // Freeze originalRanks to ensure immutability
        this.originalRanks = Object.freeze({
            top: this.normalizeRank(top),
            right: this.normalizeRank(right),
            bottom: this.normalizeRank(bottom),
            left: this.normalizeRank(left)
        });
        this.ranks = { ...this.originalRanks };
        this.owner = owner;
        this.element = element;
        
        // Cache for effective ranks to avoid recalculation
        this._effectiveRanksCache = new Map();
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

        // Use cache for performance optimization
        const cacheKey = `${side}-${boardSquareElement}-${elementalRuleActive}`;
        if (this._effectiveRanksCache.has(cacheKey)) {
            return this._effectiveRanksCache.get(cacheKey);
        }

        let rank = this.originalRanks[side];
        
        if (this.element === boardSquareElement) {
            rank += 1;
        } else if (this.element !== 'None') {
            rank -= 1;
        }
        
        const effectiveRank = Math.max(0, rank);
        this._effectiveRanksCache.set(cacheKey, effectiveRank);
        return effectiveRank;
    }

    /**
     * Get all effective ranks for all sides at once
     * @param {string} boardSquareElement - The element of the board square
     * @param {boolean} elementalRuleActive - Whether elemental rule is active
     * @returns {Object} Object with all effective ranks
     */
    getAllEffectiveRanks(boardSquareElement, elementalRuleActive = false) {
        return {
            top: this.getEffectiveRank('top', boardSquareElement, elementalRuleActive),
            right: this.getEffectiveRank('right', boardSquareElement, elementalRuleActive),
            bottom: this.getEffectiveRank('bottom', boardSquareElement, elementalRuleActive),
            left: this.getEffectiveRank('left', boardSquareElement, elementalRuleActive)
        };
    }

    /**
     * Check if this card's rank on a given side can beat another rank
     * @param {string} side - The side to check
     * @param {number} opponentRank - The opponent's rank to compare against
     * @param {string} boardSquareElement - The element of the board square
     * @param {boolean} elementalRuleActive - Whether elemental rule is active
     * @returns {boolean} True if this card wins
     */
    canBeat(side, opponentRank, boardSquareElement, elementalRuleActive = false) {
        const myRank = this.getEffectiveRank(side, boardSquareElement, elementalRuleActive);
        return myRank > opponentRank;
    }

    /**
     * Clear the effective ranks cache (useful when element changes)
     */
    clearEffectiveRanksCache() {
        this._effectiveRanksCache.clear();
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