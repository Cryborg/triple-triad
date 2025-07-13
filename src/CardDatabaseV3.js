const CardDatabase = require('./CardDatabase');

class CardDatabaseV3 {
    static getElementalMappings() {
        return {
            'Bite Bug': 'Fire',
            'Gayla': 'Thunder',
            'Fastitocalon-F': 'Earth',
            'Cockatrice': 'Thunder',
            'Glacial Eye': 'Ice',
            'Thrustaevis': 'Wind',
            'Anacondaur': 'Poison',
            'Creeps': 'Thunder',
            'Grendel': 'Thunder',
            'Armadodo': 'Earth',
            'Tri-Face': 'Poison',
            'Fastitocalon': 'Earth',
            'Snow Lion': 'Ice',
            'Ochu': 'None',
            'SAM08G': 'Thunder',
            'Death Claw': 'Fire',
            'Cactuar': 'None',
            'Tonberry': 'None',
            'Abyss Worm': 'Earth',
            'Turtapod': 'None',
            'Vysage': 'None',
            'T-Rexaur': 'None',
            'Bomb': 'Fire',
            'Blitz': 'Thunder',
            'Wendigo': 'None',
            'Torama': 'None',
            'Imp': 'None',
            'Blue Dragon': 'Poison',
            'Adamantoise': 'Earth',
            'Hexadragon': 'Fire',
            'Iron Giant': 'None',
            'Behemoth': 'None',
            'Chimera': 'Water',
            'PuPu': 'None',
            'Elastoid': 'None',
            'GIM47N': 'None',
            'Malboro': 'Poison',
            'Ruby Dragon': 'Fire',
            'Elnoyle': 'Holy',
            'Tonberry King': 'None',
            'Biggs, Wedge': 'None',
            'Fujin, Raijin': 'None',
            'Elvoret': 'Wind',
            'X-ATM092': 'None',
            'Granaldo': 'None',
            'Gerogero': 'Poison',
            'Iguion': 'None',
            'Abadon': 'None',
            'Trauma': 'None',
            'Oilboyle': 'None',
            'Shumi Tribe': 'None',
            'Krysta': 'None',
            'Propagator': 'None',
            'Jumbo Cactuar': 'None',
            'Tri-Point': 'Thunder',
            'Gargantua': 'None',
            'Mobile Type 8': 'None',
            'Sphinxara': 'None',
            'Tiamat': 'None',
            'BGH251F2': 'None',
            'Red Giant': 'None',
            'Catoblepas': 'None',
            'Ultima Weapon': 'None',
            'Chubby Chocobo': 'None',
            'Angelo': 'None',
            'Gilgamesh': 'None',
            'MiniMog': 'None',
            'Chicobo': 'None',
            'Quezacotl': 'Thunder',
            'Shiva': 'Ice',
            'Ifrit': 'Fire',
            'Siren': 'None',
            'Sacred': 'Earth',
            'Minotaur': 'Earth',
            'Carbuncle': 'None',
            'Diablos': 'None',
            'Leviathan': 'Water',
            'Odin': 'None',
            'Pandemona': 'Wind',
            'Cerberus': 'None',
            'Alexander': 'Holy',
            'Phoenix': 'Fire',
            'Bahamut': 'None',
            'Doomtrain': 'Poison',
            'Eden': 'None',
            'Ward': 'None',
            'Kiros': 'None',
            'Laguna': 'None',
            'Selphie': 'None',
            'Quistis': 'None',
            'Irvine': 'None',
            'Zell': 'None',
            'Rinoa': 'None',
            'Edea': 'None',
            'Seifer': 'None',
            'Squall': 'None'
        };
    }

    static getAllCardsWithElements() {
        const baseCards = CardDatabase.getAllCards();
        const elementalMappings = this.getElementalMappings();
        
        return baseCards.map(card => ({
            ...card,
            element: elementalMappings[card.name] || 'None'
        }));
    }

    static getRandomCards(count) {
        const allCards = this.getAllCardsWithElements();
        const shuffled = [...allCards].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    static getPlayerCollection() {
        const allCards = this.getAllCardsWithElements();
        const shuffled = [...allCards].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 20);
    }
}

module.exports = CardDatabaseV3;