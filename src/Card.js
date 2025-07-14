class Card {
    /**
     * Create a new Card instance
     * @param {number|string} top - Top rank (can be number 1-9 or 'A' for 10)
     * @param {number|string} right - Right rank
     * @param {number|string} bottom - Bottom rank  
     * @param {number|string} left - Left rank
     * @param {string} owner - Card owner ('BLUE', 'RED', etc.)
     * @param {string} element - Card element (default: 'None')
     * @param {Object} options - Optional card data (id, name)
     */
    constructor(top, right, bottom, left, owner, element = 'None', options = {}) {
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
        
        // Optional card metadata from JSON
        this.id = options.id || null;
        this.name = options.name || null;
        
        // Cache for effective ranks to avoid recalculation
        this._effectiveRanksCache = new Map();
    }

    /**
     * Create a Card from JSON data
     * @param {Object} cardData - Card data from JSON
     * @param {string} owner - Card owner
     * @returns {Card} New Card instance
     */
    static fromJSON(cardData, owner) {
        return new Card(
            cardData.ranks[0],
            cardData.ranks[1],
            cardData.ranks[2],
            cardData.ranks[3],
            owner,
            cardData.element || 'None',
            {
                id: cardData.id,
                name: cardData.name
            }
        );
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