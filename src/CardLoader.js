const fs = require('fs');
const path = require('path');
const Card = require('./Card');

/**
 * CardLoader handles loading card data from external JSON files
 * This replaces the hardcoded card databases with externalized data
 */
class CardLoader {
    /**
     * Load all cards from the JSON file
     * @returns {Array} Array of card data objects
     */
    static loadCardData() {
        try {
            const filePath = path.join(__dirname, '..', 'cards.json');
            const jsonData = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(jsonData);
            return data.cards || [];
        } catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error('Card data file (cards.json) not found');
            } else if (error instanceof SyntaxError) {
                throw new Error('Invalid JSON format in cards.json: ' + error.message);
            } else {
                throw new Error('Error loading card data: ' + error.message);
            }
        }
    }

    /**
     * Create Card instances from JSON data
     * @param {Array} cardDataList - Array of card data objects
     * @param {string} owner - The owner of the cards ('BLUE' or 'RED')
     * @returns {Array} Array of Card instances
     */
    static createCards(cardDataList, owner) {
        return cardDataList.map(cardData => {
            return new Card(
                cardData.ranks[0],
                cardData.ranks[1], 
                cardData.ranks[2],
                cardData.ranks[3],
                owner,
                cardData.element || 'None'
            );
        });
    }

    /**
     * Get all available cards
     * @returns {Array} Array of card data objects
     */
    static getAllCards() {
        return this.loadCardData();
    }

    /**
     * Get random cards from the available pool
     * @param {number} count - Number of cards to select
     * @returns {Array} Array of random card data objects
     */
    static getRandomCards(count) {
        const allCards = this.getAllCards();
        const shuffled = [...allCards].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * Get a collection of cards for a player
     * @param {number} count - Number of cards in the collection (default: 20)
     * @returns {Array} Array of card data objects
     */
    static getPlayerCollection(count = 20) {
        const allCards = this.getAllCards();
        const shuffled = [...allCards].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * Find a card by ID
     * @param {string} cardId - The ID of the card to find
     * @returns {Object|null} Card data object or null if not found
     */
    static getCardById(cardId) {
        const allCards = this.getAllCards();
        return allCards.find(card => card.id === cardId) || null;
    }

    /**
     * Find cards by element
     * @param {string} element - The element to filter by
     * @returns {Array} Array of card data objects with the specified element
     */
    static getCardsByElement(element) {
        const allCards = this.getAllCards();
        return allCards.filter(card => card.element === element);
    }
}

module.exports = CardLoader;