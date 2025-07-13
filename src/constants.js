// Triple Triad Game Constants

// Game Configuration
const GAME_CONFIG = {
    BOARD_SIZE: 3,
    CARDS_PER_HAND: 5,
    MAX_SUDDEN_DEATH_ROUNDS: 5
};

// Player IDs
const PLAYER_IDS = {
    BLUE: 'BLUE',
    RED: 'RED'
};

// Player Colors for Display
const PLAYER_COLORS = {
    BLUE: '\x1b[34m', // Blue ANSI color
    RED: '\x1b[31m',  // Red ANSI color
    RESET: '\x1b[0m'  // Reset ANSI color
};

// Card Sides
const CARD_SIDES = {
    TOP: 'top',
    RIGHT: 'right',
    BOTTOM: 'bottom',
    LEFT: 'left'
};

// Elements
const ELEMENTS = {
    NONE: 'None',
    FIRE: 'Fire',
    ICE: 'Ice',
    THUNDER: 'Thunder',
    EARTH: 'Earth',
    POISON: 'Poison',
    WIND: 'Wind',
    WATER: 'Water',
    HOLY: 'Holy'
};

// Element Abbreviations for Display
const ELEMENT_ABBREV = {
    [ELEMENTS.FIRE]: 'F',
    [ELEMENTS.ICE]: 'I',
    [ELEMENTS.THUNDER]: 'T',
    [ELEMENTS.EARTH]: 'E',
    [ELEMENTS.POISON]: 'P',
    [ELEMENTS.WIND]: 'W',
    [ELEMENTS.WATER]: 'W',
    [ELEMENTS.HOLY]: 'H',
    [ELEMENTS.NONE]: ' '
};

// Trade Rule Types
const TRADE_RULES = {
    ONE: 'One',
    DIFF: 'Diff',
    DIRECT: 'Direct',
    ALL: 'All'
};

// Game Result Types
const GAME_RESULTS = {
    WINNER_DETERMINED: 'WINNER_DETERMINED',
    DRAW: 'DRAW',
    SUDDEN_DEATH_CONTINUE: 'SUDDEN_DEATH_CONTINUE',
    FINAL_DRAW: 'FINAL_DRAW'
};

// Capture Rule Types
const CAPTURE_RULES = {
    BASIC: 'Basic',
    SAME: 'Same',
    PLUS: 'Plus',
    COMBO: 'Combo'
};

// Rank Constants
const RANKS = {
    MIN: 1,
    MAX: 10,
    ACE: 10,
    ACE_CHAR: 'A'
};

// Default Game Rules
const DEFAULT_RULES = {
    open: false,
    random: false,
    elemental: false,
    same: false,
    plus: false,
    sameWall: false,
    combo: false,
    suddenDeath: false,
    tradeRule: TRADE_RULES.ONE
};

// Display Symbols
const DISPLAY_SYMBOLS = {
    AI: '🤖',
    CAPTURE: '⚔️',
    SPECIAL_CAPTURE: '⚡',
    COMBO: '🔗',
    RELOAD: '🔄',
    GAME_OVER: '🎮',
    TARGET: '🎯',
    ERROR: '❌',
    SUCCESS: '✅'
};

module.exports = {
    GAME_CONFIG,
    PLAYER_IDS,
    PLAYER_COLORS,
    CARD_SIDES,
    ELEMENTS,
    ELEMENT_ABBREV,
    TRADE_RULES,
    GAME_RESULTS,
    CAPTURE_RULES,
    RANKS,
    DEFAULT_RULES,
    DISPLAY_SYMBOLS
};